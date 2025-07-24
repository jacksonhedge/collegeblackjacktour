import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { v4 as uuidv4 } from 'uuid';
import { generateGroupInviteLink } from '../utils/urlHelpers';

const GroupContext = createContext();

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};

export const GroupProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserData = async (userId) => {
    if (!userId) {
      console.warn('getUserData called with no userId');
      return null;
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Generate a default profile image if none exists
        let profileImage = userData.profileImage || userData.photoURL;
        if (!profileImage) {
          // Assign a consistent default profile image based on user ID
          const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const profileNumber = (hash % 30) + 1; // We have profile_1 through profile_30
          profileImage = `/images/profile_${profileNumber}.${profileNumber === 1 || profileNumber === 4 || profileNumber === 16 || profileNumber === 30 ? 'jpeg' : 'png'}`;
        }
        
        return {
          uid: userId,
          ...userData,
          photoURL: profileImage,
          profileImage: profileImage,
          displayName: userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : userData.displayName || userData.username || userData.email || 'Unknown User',
          groups: userData.groups || [] // Ensure groups array always exists
        };
      }
      
      // If user document doesn't exist, return a minimal user object with default avatar
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const profileNumber = (hash % 30) + 1;
      const defaultProfileImage = `/images/profile_${profileNumber}.${profileNumber === 1 || profileNumber === 4 || profileNumber === 16 || profileNumber === 30 ? 'jpeg' : 'png'}`;
      
      return {
        uid: userId,
        displayName: 'Unknown User',
        photoURL: defaultProfileImage,
        profileImage: defaultProfileImage,
        groups: []
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Return minimal user object on error with default avatar
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const profileNumber = (hash % 30) + 1;
      const defaultProfileImage = `/images/profile_${profileNumber}.${profileNumber === 1 || profileNumber === 4 || profileNumber === 16 || profileNumber === 30 ? 'jpeg' : 'png'}`;
      
      return {
        uid: userId,
        displayName: 'Unknown User',
        photoURL: defaultProfileImage,
        profileImage: defaultProfileImage,
        groups: []
      };
    }
  };

  const createInitialWallet = (groupId, ownerId) => {
    return {
      platformId: `group_${groupId}`,
      groupId,
      ownerId,
      name: 'Group Wallet',
      logo: '/images/BankrollLogoTransparent.png',
      cashBalance: 0,
      bonusBalances: [],
      totalBonusBalance: 0,
      lastUpdated: new Date(),
      status: 'active',
      connected: true,
      memberBalances: {},
      expenses: []
    };
  };

  useEffect(() => {
    if (!currentUser) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const fetchGroups = async () => {
      try {
        setError(null);
        setLoading(true);

        // Get the user ID (Supabase uses 'id' instead of 'uid')
        const userId = currentUser.uid || currentUser.id;
        if (!userId) {
          console.warn('No user ID found for current user');
          setGroups([]);
          setLoading(false);
          return;
        }

        // Query groups where user is a member
        const groupsRef = collection(db, 'groups');
        const q = query(groupsRef, where('memberIds', 'array-contains', userId));
        const querySnapshot = await getDocs(q);

        const groupsData = [];
        for (const doc of querySnapshot.docs) {
          const groupData = doc.data();
          
          // Ensure memberIds exists
          groupData.memberIds = groupData.memberIds || [];
          
          // Fetch owner data
          const ownerData = await getUserData(groupData.ownerId);
          
          // Fetch all member data
          const memberPromises = groupData.memberIds.map(memberId => getUserData(memberId));
          const members = await Promise.all(memberPromises);

          // Filter out null members and ensure unique members
          const validMembers = members.filter(member => member !== null);
          const uniqueMembers = Array.from(new Map(validMembers.map(m => [m.uid, m])).values());

          // Ensure wallet exists
          let wallet = groupData.wallet;
          if (!wallet) {
            wallet = createInitialWallet(doc.id, groupData.ownerId);
            await updateDoc(doc.ref, { wallet });
          }

          groupsData.push({
            id: doc.id,
            name: groupData.name || '',
            description: groupData.description || '',
            emoji: groupData.emoji || '👥',
            ownerId: groupData.ownerId,
            owner: ownerData,
            members: uniqueMembers,
            memberIds: groupData.memberIds,
            pendingMembers: groupData.pendingMembers || [],
            dateCreated: groupData.dateCreated || new Date().toISOString(),
            isHidden: groupData.isHidden || false,
            visibility: groupData.visibility || 'private',
            inviteLink: generateGroupInviteLink(doc.id),
            status: groupData.status || 'active',
            wallet,
            type: groupData.type || 'default',
            leagueInfo: groupData.leagueInfo || null
          });
        }
          
        setGroups(groupsData);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [currentUser]);

  const createGroup = async (groupData) => {
    if (!currentUser) throw new Error('Must be logged in to create a group');

    try {
      // Get the user ID (Supabase uses 'id' instead of 'uid')
      const userId = currentUser.uid || currentUser.id;
      if (!userId) throw new Error('No user ID found');

      // First ensure user document exists
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          groups: [],
          createdAt: new Date(),
          email: currentUser.email
        });
      }

      const groupId = uuidv4();
      const groupsRef = collection(db, 'groups');
      
      // Get creator's full user data
      const creatorData = await getUserData(userId);
      
      // Create initial wallet structure
      const initialWallet = createInitialWallet(groupId, userId);
      
      // Create the group document
      const newGroup = {
        id: groupId,
        name: groupData.name,
        emoji: groupData.emoji || '👥',
        description: groupData.description || '',
        ownerId: userId,
        owner: creatorData,
        members: [creatorData],
        memberIds: [userId],
        pendingMembers: [],
        dateCreated: new Date().toISOString(),
        isHidden: false,
        visibility: groupData.visibility || 'private',
        inviteLink: generateGroupInviteLink(groupId),
        status: 'active',
        wallet: initialWallet,
        type: groupData.type || 'default',
        leagueInfo: groupData.leagueInfo || null
      };
      
      const docRef = await addDoc(groupsRef, newGroup);
      
      // Update the document with its own ID
      await updateDoc(docRef, { id: docRef.id });

      // Update user's groups array
      const currentGroups = userDoc.exists() ? (userDoc.data().groups || []) : [];
      await updateDoc(userRef, {
        groups: [...currentGroups, docRef.id]
      });

      // Add the new group to the state
      setGroups(prev => [...prev, { ...newGroup, id: docRef.id }]);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const getGroup = async (groupId) => {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        
        // Ensure memberIds exists
        groupData.memberIds = groupData.memberIds || [];
        
        // Fetch owner data
        const ownerData = await getUserData(groupData.ownerId);
        
        // Fetch all member data
        const memberPromises = groupData.memberIds.map(memberId => getUserData(memberId));
        const members = await Promise.all(memberPromises);

        // Filter out null members and ensure unique members
        const validMembers = members.filter(member => member !== null);
        const uniqueMembers = Array.from(new Map(validMembers.map(m => [m.uid, m])).values());

        // Ensure wallet exists
        let wallet = groupData.wallet;
        if (!wallet) {
          wallet = createInitialWallet(groupId, groupData.ownerId);
          await updateDoc(groupRef, { wallet });
        }

        return {
          id: groupDoc.id,
          name: groupData.name || '',
          description: groupData.description || '',
          emoji: groupData.emoji || '👥',
          ownerId: groupData.ownerId,
          owner: ownerData,
          members: uniqueMembers,
          memberIds: groupData.memberIds,
          pendingMembers: groupData.pendingMembers || [],
          dateCreated: groupData.dateCreated || new Date().toISOString(),
          isHidden: groupData.isHidden || false,
          visibility: groupData.visibility || 'private',
          inviteLink: generateGroupInviteLink(groupDoc.id),
          status: groupData.status || 'active',
          wallet,
          type: groupData.type || 'default',
          leagueInfo: groupData.leagueInfo || null
        };
      } else {
        throw new Error('Group not found');
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      if (!currentUser) throw new Error('Must be logged in to delete a group');
      if (!groupId) throw new Error('Group ID is required');

      // Get the user ID (Supabase uses 'id' instead of 'uid')
      const userId = currentUser.uid || currentUser.id;
      if (!userId) throw new Error('No user ID found');

      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();

      // Check if the current user is the group owner
      if (groupData.ownerId !== userId) {
        throw new Error('Only the group owner can delete the group');
      }

      // Delete the group document
      await deleteDoc(groupRef);
      
      // Update local state
      setGroups(prev => prev.filter(group => group.id !== groupId));
      
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  };

  const refreshGroups = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get the user ID (Supabase uses 'id' instead of 'uid')
      const userId = currentUser.uid || currentUser.id;
      if (!userId) {
        console.warn('No user ID found for current user');
        setGroups([]);
        setLoading(false);
        return;
      }

      // Use the same query as initial fetch - query groups where user is a member
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('memberIds', 'array-contains', userId));
      const querySnapshot = await getDocs(q);

      const groupsData = [];
      for (const doc of querySnapshot.docs) {
        const groupData = doc.data();
        
        // Ensure memberIds exists
        groupData.memberIds = groupData.memberIds || [];
        
        // Fetch owner data
        const ownerData = await getUserData(groupData.ownerId);
        
        // Fetch all member data
        const memberPromises = groupData.memberIds.map(memberId => getUserData(memberId));
        const members = await Promise.all(memberPromises);

        // Filter out null members and ensure unique members
        const validMembers = members.filter(member => member !== null);
        const uniqueMembers = Array.from(new Map(validMembers.map(m => [m.uid, m])).values());

        // Ensure wallet exists
        let wallet = groupData.wallet;
        if (!wallet) {
          wallet = createInitialWallet(doc.id, groupData.ownerId);
          await updateDoc(doc.ref, { wallet });
        }

        groupsData.push({
          id: doc.id,
          name: groupData.name || '',
          description: groupData.description || '',
          emoji: groupData.emoji || '👥',
          ownerId: groupData.ownerId,
          owner: ownerData,
          members: uniqueMembers,
          memberIds: groupData.memberIds,
          pendingMembers: groupData.pendingMembers || [],
          dateCreated: groupData.dateCreated || new Date().toISOString(),
          isHidden: groupData.isHidden || false,
          visibility: groupData.visibility || 'private',
          inviteLink: generateGroupInviteLink(doc.id),
          status: groupData.status || 'active',
          wallet,
          type: groupData.type || 'default',
          leagueInfo: groupData.leagueInfo || null
        });
      }
        
      setGroups(groupsData);
    } catch (err) {
      console.error('Error refreshing groups:', err);
      setError('Failed to refresh groups');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    groups,
    loading,
    error,
    createGroup,
    getGroup,
    deleteGroup,
    refreshGroups
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};

export default GroupContext;
