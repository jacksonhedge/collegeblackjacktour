import { db } from './config';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, or } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

class GroupService {
  constructor() {
    this.groupsCollection = 'groups';
    this.usersCollection = 'users';
  }

  async searchUsers(searchTerm) {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      const usersRef = collection(db, this.usersCollection);
      const searchTermLower = searchTerm.toLowerCase();
      
      // Create queries for username, email, and phone
      const q = query(usersRef, 
        or(
          where('username', '>=', searchTermLower),
          where('username', '<=', searchTermLower + '\uf8ff'),
          where('email', '>=', searchTermLower),
          where('email', '<=', searchTermLower + '\uf8ff'),
          where('phone', '>=', searchTermLower),
          where('phone', '<=', searchTermLower + '\uf8ff')
        )
      );

      const snapshot = await getDocs(q);
      const users = [];
      
      snapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          uid: doc.id,
          displayName: userData.firstName && userData.lastName ? 
            `${userData.firstName} ${userData.lastName}` : 
            userData.username || doc.id,
          username: userData.username,
          email: userData.email,
          phone: userData.phone,
          photoURL: userData.profileImage
        });
      });

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async getUserData(userId) {
    try {
      console.log('Fetching user data for:', userId);
      const userDoc = await getDoc(doc(db, this.usersCollection, userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('Found user data:', userData);
        
        // Generate a default profile image if none exists
        let profileImage = userData.profileImage;
        if (!profileImage && !userData.photoURL) {
          // Assign a consistent default profile image based on user ID
          const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const profileNumber = (hash % 30) + 1; // We have profile_1 through profile_30
          profileImage = `/images/profile_${profileNumber}.${profileNumber === 1 || profileNumber === 4 || profileNumber === 16 || profileNumber === 30 ? 'jpeg' : 'png'}`;
        }
        
        return {
          uid: userId,
          displayName: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.username || userId,
          photoURL: profileImage || userData.photoURL,
          profileImage: profileImage || userData.profileImage,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          username: userData.username
        };
      }
      console.log('No user data found for:', userId);
      
      // Generate default profile image for non-existent users
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const profileNumber = (hash % 30) + 1;
      const defaultProfileImage = `/images/profile_${profileNumber}.${profileNumber === 1 || profileNumber === 4 || profileNumber === 16 || profileNumber === 30 ? 'jpeg' : 'png'}`;
      
      return {
        uid: userId,
        displayName: 'Unknown User',
        photoURL: defaultProfileImage,
        profileImage: defaultProfileImage,
        firstName: '',
        lastName: ''
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  async getUserGroups(userId) {
    try {
      console.log('Fetching groups for user:', userId);
      if (!userId) {
        throw new Error('User ID is required');
      }

      const groupsRef = collection(db, this.groupsCollection);
      const memberQ = query(groupsRef, where('memberIds', 'array-contains', userId));
      const ownerQ = query(groupsRef, where('ownerId', '==', userId));
      
      const [memberSnapshot, ownerSnapshot] = await Promise.all([
        getDocs(memberQ),
        getDocs(ownerQ)
      ]);
      
      const groups = new Set();
      memberSnapshot.forEach((doc) => {
        console.log('Found member group:', doc.id, doc.data());
        groups.add({
          id: doc.id,
          ...doc.data()
        });
      });
      
      ownerSnapshot.forEach((doc) => {
        console.log('Found owner group:', doc.id, doc.data());
        groups.add({
          id: doc.id,
          ...doc.data()
        });
      });
      
      const result = Array.from(groups);
      console.log('Total groups found:', result.length, result);
      return result;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  }

  async getGroup(groupId) {
    try {
      console.log('Fetching group:', groupId);
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const groupRef = doc(db, this.groupsCollection, groupId);
      const groupDoc = await getDoc(groupRef);
      console.log('Group doc exists:', groupDoc.exists());
      
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        console.log('Raw group data:', groupData);
        
        // Fetch owner data
        console.log('Fetching owner data for:', groupData.ownerId);
        const ownerData = await this.getUserData(groupData.ownerId);
        console.log('Owner data:', ownerData);
        
        // Fetch all member data
        console.log('Fetching member data for:', groupData.memberIds);
        const memberPromises = (groupData.memberIds || []).map(memberId => this.getUserData(memberId));
        const members = await Promise.all(memberPromises);
        console.log('Member data:', members);
        
        const fullGroupData = {
          id: groupDoc.id,
          ...groupData,
          owner: ownerData,
          members: members.filter(member => member !== null)
        };
        console.log('Full group data:', fullGroupData);
        return fullGroupData;
      } else {
        console.log('Group not found with ID:', groupId);
        throw new Error('Group not found');
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  }

  async createGroup(groupData, creator) {
    try {
      console.log('Creating group with data:', { groupData, creator });
      if (!groupData || !creator) {
        throw new Error('Group data and creator information are required');
      }

      if (!groupData.name) {
        throw new Error('Group name is required');
      }

      if (!creator.id && !creator.uid) {
        throw new Error('Creator must have an id or uid property');
      }

      const creatorId = creator.id || creator.uid;
      const groupId = uuidv4();
      const groupsRef = collection(db, this.groupsCollection);
      
      // Get creator's full user data
      const creatorData = await this.getUserData(creatorId);
      console.log('Creator data:', creatorData);
      
      // Create the group document
      const newGroup = {
        id: groupId,
        name: groupData.name,
        emoji: groupData.emoji || '👥',
        description: groupData.description || '',
        ownerId: creatorId,
        owner: creatorData,
        members: [creatorData],
        memberIds: [creatorId],
        pendingMembers: groupData.pendingMembers || [],
        dateCreated: new Date().toISOString(),
        isHidden: false,
        visibility: groupData.visibility || 'private',
        inviteLink: `https://onbankroll.com/group/${groupId}`,
        status: 'active'
      };
      
      console.log('Creating new group:', newGroup);
      const docRef = await addDoc(groupsRef, newGroup);
      console.log('Group created with ID:', docRef.id);
      
      const groupWithId = {
        ...newGroup,
        id: docRef.id
      };

      await updateDoc(doc(groupsRef, docRef.id), { id: docRef.id });
      console.log('Group updated with ID');
      
      return groupWithId;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async updateGroup(groupId, updateData, userId) {
    try {
      const group = await this.getGroup(groupId);
      if (group.ownerId !== userId && !group.coOwners?.includes(userId)) {
        throw new Error('User does not have permission to update this group');
      }

      const groupRef = doc(db, this.groupsCollection, groupId);
      await updateDoc(groupRef, updateData);
      
      return await this.getGroup(groupId);
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(groupId, userId) {
    try {
      const group = await this.getGroup(groupId);
      if (group.ownerId !== userId) {
        throw new Error('Only the group owner can delete the group');
      }

      const groupRef = doc(db, this.groupsCollection, groupId);
      await deleteDoc(groupRef);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  async leaveGroup(groupId, userId) {
    try {
      const group = await this.getGroup(groupId);
      
      if (group.ownerId === userId) {
        throw new Error('Group owner cannot leave the group');
      }

      const updatedMembers = group.members.filter(member => member.uid !== userId);
      const updatedMemberIds = group.memberIds.filter(id => id !== userId);
      const updatedCoOwners = group.coOwners?.filter(id => id !== userId) || [];

      await this.updateGroup(groupId, {
        members: updatedMembers,
        memberIds: updatedMemberIds,
        coOwners: updatedCoOwners
      }, group.ownerId);
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  async addMembers(groupId, newMembers) {
    try {
      const group = await this.getGroup(groupId);
      
      // Get full user data for new members
      const newMemberDataPromises = newMembers.map(member => this.getUserData(member.id || member.uid));
      const newMemberData = await Promise.all(newMemberDataPromises);
      
      // Add new members if they're not already in the group
      const updatedMembers = [...group.members];
      const updatedMemberIds = [...group.memberIds];

      newMemberData.forEach(member => {
        if (member && !updatedMemberIds.includes(member.uid)) {
          updatedMembers.push(member);
          updatedMemberIds.push(member.uid);
        }
      });
      
      await this.updateGroup(groupId, {
        members: updatedMembers,
        memberIds: updatedMemberIds
      }, group.ownerId);
      
      return await this.getGroup(groupId);
    } catch (error) {
      console.error('Error adding members:', error);
      throw error;
    }
  }

  async isUserInGroup(userId, groupId) {
    try {
      if (!userId || !groupId) {
        throw new Error('User ID and Group ID are required');
      }

      const group = await this.getGroup(groupId);
      return group.memberIds.includes(userId) || group.ownerId === userId;
    } catch (error) {
      console.error('Error checking user group membership:', error);
      throw error;
    }
  }

  async inviteUsers(groupId, inviteData, currentUserId) {
    try {
      console.log('Inviting users to group:', groupId, inviteData);
      
      if (!groupId || !inviteData || inviteData.length === 0) {
        throw new Error('Group ID and invite data are required');
      }

      if (!currentUserId) {
        throw new Error('Current user ID is required');
      }

      // Get the group details
      const group = await this.getGroup(groupId);
      
      // Get the current user (inviter) details
      const inviterData = await this.getUserData(currentUserId);
      
      // Create invitations collection if it doesn't exist
      const invitationsRef = collection(db, 'groupInvitations');
      
      // Process each invite
      const invitePromises = inviteData.map(async (user) => {
        // Create invitation record
        const invitation = {
          groupId: groupId,
          groupName: group.name,
          inviterId: currentUserId,
          inviterName: inviterData.displayName,
          invitedUserId: user.uid,
          invitedUserEmail: user.email,
          invitedUserName: user.displayName,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        
        // Add invitation to database
        await addDoc(invitationsRef, invitation);
        
        // Send email if user has email
        if (user.email) {
          try {
            const EmailService = (await import('../EmailService')).default;
            
            // Get more group details for the email
            const groupBalance = group.totalBalance || 0;
            const memberCount = group.memberIds?.length || 1;
            
            // Use sendBulkGroupInvites which properly uses the beautiful template
            const result = await EmailService.sendBulkGroupInvites(
              groupId,
              group.name,
              [user.email],
              group.emoji || '👥',
              {
                displayName: inviterData.displayName,
                email: inviterData.email || currentUserId
              }
            );
            
            if (!result.success) {
              console.error('Failed to send invite email:', result.failed);
            }
          } catch (emailError) {
            console.error('Error sending invite email:', emailError);
            // Don't throw - continue with other invites even if email fails
          }
        }
        
        return invitation;
      });
      
      const invitations = await Promise.all(invitePromises);
      console.log('Created invitations:', invitations);
      
      return invitations;
    } catch (error) {
      console.error('Error inviting users:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService();
