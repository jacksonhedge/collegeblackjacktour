import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { where } from 'firebase/firestore';
import { emailService } from '../services/EmailService';
import type { 
  Group, 
  GroupContextType, 
  User, 
  GroupMember,
  UserRole,
  GroupMemberUpdate
} from '../types/group';
import { ERROR_MESSAGES, GROUP_ROLES } from '../constants';
import {
  getDocRef,
  getCollectionRef,
  getDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  createQuery,
  getQueryDocuments,
  getDocumentsByRefs,
  batchWrite
} from '../services/firebase/firestore';

const GroupContext = createContext<GroupContextType | null>(null);

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};

interface GroupProviderProps {
  children: React.ReactNode;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createGroupMember = (user: User, role: UserRole = GROUP_ROLES.member): GroupMember => ({
    ...user,
    role,
    joinedAt: new Date().toISOString()
  });

  const getUserData = async (userId: string): Promise<User> => {
    if (!userId) {
      console.warn('getUserData called with no userId');
      return createDefaultUser(userId);
    }

    try {
      const userRef = getDocRef<User>('users', userId);
      const userData = await getDocument(userRef);
      
      if (!userData) {
        console.log(`User document not found for ID: ${userId}`);
        return createDefaultUser(userId);
      }

      return {
        uid: userId,
        displayName: userData.displayName || 'Unknown User',
        email: userData.email || '',
        photoURL: userData.photoURL || '',
        username: userData.username || '',
        phone: userData.phone || '',
        groups: userData.groups || [],
        createdAt: userData.createdAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return createDefaultUser(userId);
    }
  };

  const createDefaultUser = (userId: string): User => {
    return {
      uid: userId,
      displayName: 'Unknown User',
      email: '',
      photoURL: '',
      username: '',
      phone: '',
      groups: [],
      createdAt: new Date().toISOString()
    };
  };

  const createInitialWallet = (groupId: string, ownerId: string) => {
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

  // Create default public groups if they don't exist
  const createDefaultPublicGroups = async () => {
    try {
      const cctGroupId = 'cct-group';
      const groupRef = getDocRef<Group>('groups', cctGroupId);
      const groupData = await getDocument(groupRef);

      if (!groupData) {
        const adminUser: User = {
          uid: 'admin',
          displayName: 'CCT Admin',
          email: 'admin@cct.com',
          groups: [],
          createdAt: new Date().toISOString()
        };

        const newGroup: Group = {
          id: cctGroupId,
          name: 'CCT Group',
          emoji: '🎯',
          description: 'Join the CCT community! Connect with other members and participate in group activities.',
          ownerId: 'admin',
          owner: adminUser,
          members: [createGroupMember(adminUser, GROUP_ROLES.owner)],
          memberIds: ['admin'],
          pendingMembers: [],
          dateCreated: new Date().toISOString(),
          isHidden: false,
          visibility: 'public',
          inviteLink: `${window.location.origin}/groups/${cctGroupId}`,
          status: 'active',
          wallet: {
            platformId: `group_${cctGroupId}`,
            groupId: cctGroupId,
            ownerId: 'admin',
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
          },
          type: 'community',
          leagueInfo: null
        };

        await setDocument(groupRef, newGroup);
      }
    } catch (error) {
      console.error('Error creating default public groups:', error);
    }
  };

  // Initialize default groups on context mount
  useEffect(() => {
    createDefaultPublicGroups();
  }, []);

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

        const groupsRef = getCollectionRef<Group>('groups');
        const groupsQuery = createQuery(groupsRef, where('memberIds', 'array-contains', currentUser.uid));
        const groupsData = await getQueryDocuments(groupsQuery);

        const enrichedGroups = await Promise.all(
          groupsData.map(async (groupData) => {
            const ownerData = await getUserData(groupData.ownerId);
            const memberPromises = (groupData.memberIds || []).map(async memberId => {
              const userData = await getUserData(memberId);
              return createGroupMember(
                userData,
                memberId === groupData.ownerId ? GROUP_ROLES.owner : GROUP_ROLES.member
              );
            });
            const members = await Promise.all(memberPromises);
            const uniqueMembers = Array.from(new Map(members.map(m => [m.uid, m])).values());

            let wallet = groupData.wallet;
            if (!wallet) {
              wallet = createInitialWallet(groupData.id, groupData.ownerId);
              const groupRef = getDocRef<Group>('groups', groupData.id);
              await updateDocument(groupRef, { wallet });
            }

            return {
              ...groupData,
              owner: ownerData,
              members: uniqueMembers,
              memberIds: groupData.memberIds || [],
              pendingMembers: groupData.pendingMembers || [],
              wallet
            };
          })
        );

        setGroups(enrichedGroups);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [currentUser]);

  const createGroup = async (groupData: Partial<Group>): Promise<string> => {
    if (!currentUser) throw new Error('Must be logged in to create a group');

    try {
      const userRef = getDocRef<User>('users', currentUser.uid);
      const userData = await getDocument(userRef);
      
      if (!userData) {
        await setDocument(userRef, {
          uid: currentUser.uid,
          groups: [],
          createdAt: new Date().toISOString(),
          email: currentUser.email || '',
          displayName: currentUser.displayName || '',
          photoURL: currentUser.photoURL || '',
          username: '',
          phone: ''
        });
      }

      const creatorData = await getUserData(currentUser.uid);
      const groupId = groupData.id || crypto.randomUUID();
      const initialWallet = createInitialWallet(groupId, currentUser.uid);
      const ownerMember = createGroupMember(creatorData, GROUP_ROLES.owner);

      const newGroup: Group = {
        id: groupId,
        name: groupData.name || '',
        emoji: groupData.emoji || '👥',
        description: groupData.description || '',
        ownerId: currentUser.uid,
        owner: creatorData,
        members: [ownerMember],
        memberIds: [currentUser.uid],
        pendingMembers: [],
        dateCreated: new Date().toISOString(),
        isHidden: false,
        visibility: groupData.visibility || 'private',
        inviteLink: `${window.location.origin}/groups/${groupId}`,
        status: 'active',
        wallet: initialWallet,
        type: groupData.type || 'default',
        leagueInfo: groupData.leagueInfo || null
      };

      const groupRef = getDocRef<Group>('groups', groupId);
      await setDocument(groupRef, newGroup);

      // Update user's groups
      const currentGroups = userData?.groups || [];
      await updateDocument(userRef, {
        groups: [...currentGroups, groupId]
      });

      setGroups(prev => [...prev, newGroup]);
      
      return groupId;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const getGroup = async (groupId: string): Promise<Group> => {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const groupRef = getDocRef<Group>('groups', groupId);
      const groupData = await getDocument(groupRef);
      
      if (!groupData) {
        throw new Error('Group not found');
      }

      const ownerData = await getUserData(groupData.ownerId);
      const memberPromises = (groupData.memberIds || []).map(async memberId => {
        const userData = await getUserData(memberId);
        return createGroupMember(
          userData,
          memberId === groupData.ownerId ? GROUP_ROLES.owner : GROUP_ROLES.member
        );
      });
      const members = await Promise.all(memberPromises);
      const uniqueMembers = Array.from(new Map(members.map(m => [m.uid, m])).values());

      let wallet = groupData.wallet;
      if (!wallet) {
        wallet = createInitialWallet(groupId, groupData.ownerId);
        await updateDocument(groupRef, { wallet });
      }

      return {
        ...groupData,
        owner: ownerData,
        members: uniqueMembers,
        memberIds: groupData.memberIds || [],
        pendingMembers: groupData.pendingMembers || [],
        wallet
      };
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  };

  const updateGroup = async (groupId: string, data: Partial<Group>): Promise<Group> => {
    if (!currentUser) throw new Error('Must be logged in to update group');
    if (!groupId) throw new Error('Group ID is required');

    try {
      const groupRef = getDocRef<Group>('groups', groupId);
      const groupData = await getDocument(groupRef);

      if (!groupData) {
        throw new Error('Group not found');
      }

      if (groupData.ownerId !== currentUser.uid) {
        throw new Error('Only the group owner can update the group');
      }

      await updateDocument(groupRef, data);
      const updatedGroup = await getGroup(groupId);

      setGroups(prev => 
        prev.map(group => 
          group.id === groupId ? updatedGroup : group
        )
      );

      return updatedGroup;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  };

  const deleteGroup = async (groupId: string): Promise<boolean> => {
    if (!currentUser) throw new Error('Must be logged in to delete a group');
    if (!groupId) throw new Error('Group ID is required');

    try {
      const groupRef = getDocRef<Group>('groups', groupId);
      const groupData = await getDocument(groupRef);

      if (!groupData) {
        throw new Error('Group not found');
      }

      if (groupData.ownerId !== currentUser.uid) {
        throw new Error('Only the group owner can delete the group');
      }

      await deleteDocument(groupRef);
      setGroups(prev => prev.filter(group => group.id !== groupId));
      
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  };

  const inviteMembers = async (groupId: string, emails: string[]): Promise<void> => {
    if (!currentUser) throw new Error('Must be logged in to invite members');
    if (!groupId) throw new Error('Group ID is required');

    try {
      const groupRef = getDocRef<Group>('groups', groupId);
      const groupData = await getDocument(groupRef);

      if (!groupData) {
        throw new Error('Group not found');
      }

      const pendingMembers = groupData.pendingMembers || [];
      const newEmails = emails.filter(email => 
        !pendingMembers.some(member => member.identifier === email)
      );

      if (newEmails.length === 0) {
        throw new Error('All emails are already invited');
      }

      const newPendingMembers = newEmails.map(email => ({
        identifier: email,
        type: 'email',
        status: 'pending',
        invitedAt: new Date().toISOString()
      }));

      await updateDocument(groupRef, {
        pendingMembers: [...pendingMembers, ...newPendingMembers]
      });

      await emailService.sendBulkGroupInvites(
        groupId,
        groupData.name,
        newEmails,
        groupData.emoji
      );
    } catch (error) {
      console.error('Error inviting members:', error);
      throw error;
    }
  };

  const removeMember = async (groupId: string, userId: string): Promise<void> => {
    if (!currentUser) throw new Error('Must be logged in to remove members');
    if (!groupId) throw new Error('Group ID is required');

    try {
      const groupRef = getDocRef<Group>('groups', groupId);
      const groupData = await getDocument(groupRef);

      if (!groupData) {
        throw new Error('Group not found');
      }

      if (groupData.ownerId !== currentUser.uid && userId !== currentUser.uid) {
        throw new Error('Only the group owner can remove members');
      }

      await updateDocument(groupRef, {
        memberIds: groupData.memberIds.filter(id => id !== userId)
      });

      setGroups(prev => 
        prev.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              memberIds: group.memberIds.filter(id => id !== userId),
              members: group.members.filter(member => member.uid !== userId)
            };
          }
          return group;
        })
      );
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const updateMemberRole = async (groupId: string, userId: string, role: UserRole): Promise<void> => {
    if (!currentUser) throw new Error('Must be logged in to update member roles');
    if (!groupId) throw new Error('Group ID is required');

    try {
      const groupRef = getDocRef<Group>('groups', groupId);
      const groupData = await getDocument(groupRef);

      if (!groupData) {
        throw new Error('Group not found');
      }

      if (groupData.ownerId !== currentUser.uid) {
        throw new Error('Only the group owner can update member roles');
      }

      const memberUpdate: GroupMemberUpdate = {
        role,
        lastActive: new Date().toISOString()
      };

      const memberRef = getDocRef<GroupMemberUpdate>('groups', groupId, 'members', userId);
      await setDocument(memberRef, memberUpdate, true);

      setGroups(prev => 
        prev.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              members: group.members.map(member => 
                member.uid === userId ? { ...member, ...memberUpdate } : member
              )
            };
          }
          return group;
        })
      );
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  };

  const refreshGroups = async (): Promise<void> => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const userRef = getDocRef<User>('users', currentUser.uid);
      const userData = await getDocument(userRef);
      
      if (userData) {
        const groupIds = userData.groups || [];
        const groupRefs = groupIds.map(id => getDocRef<Group>('groups', id));
        const groupsData = await getDocumentsByRefs(groupRefs);
        
        const validGroups = await Promise.all(
          groupsData
            .filter((group): group is Group => group !== null)
            .map(async (group) => {
              const enrichedGroup = await getGroup(group.id);
              return enrichedGroup;
            })
        );
        
        setGroups(validGroups);
      }
    } catch (err) {
      console.error('Error refreshing groups:', err);
      setError('Failed to refresh groups');
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupCode: string): Promise<void> => {
    if (!currentUser) throw new Error('Must be logged in to join a group');
    if (!groupCode) throw new Error('Group code is required');

    try {
      const groupRef = getDocRef<Group>('groups', groupCode);
      const groupData = await getDocument(groupRef);

      if (!groupData) {
        throw new Error('Group not found');
      }

      if (groupData.memberIds.includes(currentUser.uid)) {
        throw new Error('You are already a member of this group');
      }

      const userData = await getUserData(currentUser.uid);
      const newMember = createGroupMember(userData, GROUP_ROLES.member);

      await updateDocument(groupRef, {
        memberIds: [...groupData.memberIds, currentUser.uid]
      });

      // Update user's groups
      const userRef = getDocRef<User>('users', currentUser.uid);
      const currentUserData = await getDocument(userRef);
      const currentGroups = currentUserData?.groups || [];
      await updateDocument(userRef, {
        groups: [...currentGroups, groupCode]
      });

      // Update local state
      const updatedGroup = await getGroup(groupCode);
      setGroups(prev => [...prev, updatedGroup]);

    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  };

  const value: GroupContextType = {
    groups,
    loading,
    error,
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
    refreshGroups,
    inviteMembers,
    removeMember,
    updateMemberRole,
    joinGroup
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};

export default GroupContext;
