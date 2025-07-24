import { db } from './config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  DocumentData,
  CollectionReference,
  DocumentReference,
  Firestore,
  arrayUnion
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { groupWalletService } from '../GroupWalletService';
import { emailService } from '../EmailService';
import { getAuth } from 'firebase/auth';
import type { Group, GroupService as IGroupService, User, InviteResult, PendingMember, GroupWallet } from '../../types/group';

// Assert db is initialized
const firestore = db as Firestore;

class GroupService implements IGroupService {
  private static instance: GroupService;
  private groupsCollection = 'groups';
  private usersCollection = 'users';
  private baseUrl = 'https://bankroll.live';

  constructor() {
    if (GroupService.instance) {
      return GroupService.instance;
    }
    GroupService.instance = this;
  }

  generateGroupUrl(groupId: string): string {
    return `${this.baseUrl}/groups/${groupId}`;
  }

  // Helper method to create initial wallet structure
  private createInitialWallet(groupId: string, ownerId: string): GroupWallet {
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
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const groupsRef = collection(firestore, this.groupsCollection);
      const q = query(groupsRef, where('memberIds', 'array-contains', userId));
      const querySnapshot = await getDocs(q);

      const groups: Group[] = [];
      for (const doc of querySnapshot.docs) {
        const groupData = doc.data();
        
        // Fetch owner data
        const ownerData = await this.getUserData(groupData.ownerId);
        
        // Fetch all member data
        const memberPromises = (groupData.memberIds || []).map(async (memberId: string) => {
          try {
            return await this.getUserData(memberId);
          } catch (error) {
            console.error(`Error fetching member data for ${memberId}:`, error);
            return null;
          }
        });
        const members = await Promise.all(memberPromises);

        // Filter out null members and ensure unique members
        const validMembers = members.filter((member): member is User => member !== null);
        const uniqueMembers = Array.from(new Map(validMembers.map(m => [m.uid, m])).values());

        // Ensure wallet exists
        let wallet = groupData.wallet;
        if (!wallet) {
          wallet = this.createInitialWallet(doc.id, groupData.ownerId);
          await updateDoc(doc.ref, { wallet });
        }

        groups.push({
          id: doc.id,
          name: groupData.name || '',
          description: groupData.description || '',
          emoji: groupData.emoji || '👥',
          ownerId: groupData.ownerId,
          owner: ownerData!,
          members: uniqueMembers,
          memberIds: groupData.memberIds || [],
          pendingMembers: groupData.pendingMembers || [],
          dateCreated: groupData.dateCreated || new Date().toISOString(),
          isHidden: groupData.isHidden || false,
          visibility: groupData.visibility || 'private',
          inviteLink: this.generateGroupUrl(doc.id),
          status: groupData.status || 'active',
          wallet,
          type: groupData.type || 'default',
          leagueInfo: groupData.leagueInfo || null
        });
      }

      return groups;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  }

  async getUserData(userId: string): Promise<User | null> {
    try {
      const userRef = doc(firestore, this.usersCollection, userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return {
          uid: userId,
          ...userDoc.data()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  async getGroup(groupId: string): Promise<Group> {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const groupRef = doc(firestore, this.groupsCollection, groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        
        // Fetch owner data
        const ownerData = await this.getUserData(groupData.ownerId);
        
        // Fetch all member data
        const memberPromises = (groupData.memberIds || []).map(async (memberId: string) => {
          try {
            return await this.getUserData(memberId);
          } catch (error) {
            console.error(`Error fetching member data for ${memberId}:`, error);
            return null;
          }
        });
        const members = await Promise.all(memberPromises);

        // Filter out null members and ensure unique members
        const validMembers = members.filter((member): member is User => member !== null);
        const uniqueMembers = Array.from(new Map(validMembers.map(m => [m.uid, m])).values());

        // Ensure wallet exists
        let wallet = groupData.wallet;
        if (!wallet) {
          wallet = this.createInitialWallet(groupId, groupData.ownerId);
          await updateDoc(groupRef, { wallet });
        }

        return {
          id: groupDoc.id,
          name: groupData.name || '',
          description: groupData.description || '',
          emoji: groupData.emoji || '👥',
          ownerId: groupData.ownerId,
          owner: ownerData!,
          members: uniqueMembers,
          memberIds: groupData.memberIds || [],
          pendingMembers: groupData.pendingMembers || [],
          dateCreated: groupData.dateCreated || new Date().toISOString(),
          isHidden: groupData.isHidden || false,
          visibility: groupData.visibility || 'private',
          inviteLink: this.generateGroupUrl(groupDoc.id),
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
  }

  async createGroup(groupData: Partial<Group>, creator: { id?: string; uid?: string }): Promise<Group> {
    try {
      if (!creator || (!creator.id && !creator.uid)) {
        throw new Error('Creator information is required');
      }

      if (!groupData) {
        throw new Error('Group data is required');
      }

      if (!groupData.name) {
        throw new Error('Group name is required');
      }

      if (!creator.id && !creator.uid) {
        throw new Error('Creator must have an id or uid property');
      }

      const creatorId = creator.id || creator.uid;
      const groupId = uuidv4();
      const groupsRef = collection(firestore, this.groupsCollection);
      
      // Get creator's full user data
      const creatorData = await this.getUserData(creatorId!);
      
      // Create initial wallet structure
      const initialWallet = this.createInitialWallet(groupId, creatorId!);
      
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
        pendingMembers: [],
        dateCreated: new Date().toISOString(),
        isHidden: false,
        visibility: groupData.visibility || 'private',
        inviteLink: this.generateGroupUrl(groupId),
        status: 'active',
        wallet: initialWallet,
        type: groupData.type || 'default',
        leagueInfo: groupData.leagueInfo || null
      };
      
      const docRef = await addDoc(groupsRef, newGroup);
      
      // Update the document with its own ID
      await updateDoc(docRef, { id: docRef.id });
      
      // Initialize the group wallet in GroupWalletService
      await groupWalletService.createGroupWallet(docRef.id, creatorId!);
      
      // Return the group with the correct ID
      return {
        ...newGroup,
        id: docRef.id
      } as Group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async inviteUsers(groupId: string, emails: string[]): Promise<InviteResult> {
    try {
      if (!groupId || !emails || !emails.length) {
        throw new Error('Group ID and at least one email are required');
      }

      const groupRef = doc(firestore, this.groupsCollection, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();
      const newPendingMembers: PendingMember[] = [];
      const existingEmails = new Set([
        ...(groupData.members || []).map((m: User) => m.email || ''),
        ...(groupData.pendingMembers || []).map((m: PendingMember) => m.identifier || '')
      ].filter(Boolean));

      // Filter out existing members/invites
      const newEmails = emails.filter(email => !existingEmails.has(email));

      if (newEmails.length === 0) {
        return {
          success: true,
          message: 'All emails are already invited or members',
          invitedCount: 0,
          skippedCount: emails.length
        };
      }

      // Create pending member entries
      newEmails.forEach(email => {
        newPendingMembers.push({
          identifier: email,
          type: 'email',
          status: 'pending',
          invitedAt: new Date().toISOString()
        });
      });

      // Update group with new pending members
      await updateDoc(groupRef, {
        pendingMembers: [...(groupData.pendingMembers || []), ...newPendingMembers]
      });

      return {
        success: true,
        message: `Successfully added ${newEmails.length} invites`,
        invitedCount: newEmails.length,
        skippedCount: emails.length - newEmails.length
      };
    } catch (error) {
      console.error('Error inviting users:', error);
      throw error;
    }
  }

  async removePendingInvite(groupId: string, email: string): Promise<Group> {
    try {
      if (!groupId || !email) {
        throw new Error('Group ID and email are required');
      }

      const groupRef = doc(firestore, this.groupsCollection, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();
      const pendingMembers = groupData.pendingMembers || [];

      // Filter out the specified email
      const updatedPendingMembers = pendingMembers.filter(
        (member: PendingMember) => member.identifier !== email
      );

      // Update group with new pending members list
      await updateDoc(groupRef, {
        pendingMembers: updatedPendingMembers
      });

      return await this.getGroup(groupId);
    } catch (error) {
      console.error('Error removing pending invite:', error);
      throw error;
    }
  }

  async requestToJoinGroup(groupId: string, userId: string): Promise<void> {
    try {
      if (!groupId || !userId) {
        throw new Error('Group ID and User ID are required');
      }

      const groupRef = doc(firestore, this.groupsCollection, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();

      // Check if user is already a member
      if (groupData.memberIds?.includes(userId)) {
        throw new Error('User is already a member of this group');
      }

      // Get user data
      const userData = await this.getUserData(userId);
      if (!userData) {
        throw new Error('User not found');
      }

      // Check if user already has a pending request
      const existingRequest = groupData.joinRequests?.find(
        (request: any) => request.userId === userId
      );

      if (existingRequest) {
        throw new Error('User already has a pending join request');
      }

      // Add join request
      const joinRequest = {
        userId,
        user: userData,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };

      await updateDoc(groupRef, {
        joinRequests: arrayUnion(joinRequest)
      });

      // Send notification to group owner
      try {
        const { notificationsService } = await import('../firebase/NotificationsService');
        await notificationsService.sendNotification(
          groupData.ownerId,
          {
            type: 'GROUP_JOIN_REQUEST',
            title: 'New Join Request',
            body: `${userData.displayName || userData.email} wants to join ${groupData.name}`,
            data: {
              groupId,
              groupName: groupData.name,
              userId,
              userName: userData.displayName || userData.email,
              action: 'group_join_request'
            }
          },
          ['push', 'email']
        );
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
        // Don't throw - the request was still created successfully
      }
    } catch (error) {
      console.error('Error requesting to join group:', error);
      throw error;
    }
  }

  async approveJoinRequest(groupId: string, userId: string, adminId: string): Promise<Group> {
    try {
      const groupRef = doc(firestore, this.groupsCollection, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();

      // Check if admin is group owner or admin
      if (groupData.ownerId !== adminId && !groupData.adminIds?.includes(adminId)) {
        throw new Error('Only group owner or admins can approve join requests');
      }

      // Find the join request
      const joinRequest = groupData.joinRequests?.find(
        (request: any) => request.userId === userId && request.status === 'pending'
      );

      if (!joinRequest) {
        throw new Error('Join request not found');
      }

      // Get user data
      const userData = await this.getUserData(userId);
      if (!userData) {
        throw new Error('User not found');
      }

      // Update join request status
      const updatedJoinRequests = groupData.joinRequests.map((request: any) =>
        request.userId === userId 
          ? { ...request, status: 'approved', approvedBy: adminId, approvedAt: new Date().toISOString() }
          : request
      );

      // Add user to members
      const updatedMembers = [...(groupData.members || []), userData];
      const updatedMemberIds = [...(groupData.memberIds || []), userId];

      // Update group document
      await updateDoc(groupRef, {
        members: updatedMembers,
        memberIds: updatedMemberIds,
        joinRequests: updatedJoinRequests
      });

      // Initialize member's balance in the group wallet
      await groupWalletService.initializeMemberBalance(groupId, userId);

      return await this.getGroup(groupId);
    } catch (error) {
      console.error('Error approving join request:', error);
      throw error;
    }
  }

  async rejectJoinRequest(groupId: string, userId: string, adminId: string): Promise<void> {
    try {
      const groupRef = doc(firestore, this.groupsCollection, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();

      // Check if admin is group owner or admin
      if (groupData.ownerId !== adminId && !groupData.adminIds?.includes(adminId)) {
        throw new Error('Only group owner or admins can reject join requests');
      }

      // Update join request status
      const updatedJoinRequests = groupData.joinRequests?.map((request: any) =>
        request.userId === userId 
          ? { ...request, status: 'rejected', rejectedBy: adminId, rejectedAt: new Date().toISOString() }
          : request
      ) || [];

      await updateDoc(groupRef, {
        joinRequests: updatedJoinRequests
      });
    } catch (error) {
      console.error('Error rejecting join request:', error);
      throw error;
    }
  }

  async joinGroup(groupId: string, userId: string): Promise<Group> {
    try {
      if (!groupId || !userId) {
        throw new Error('Group ID and User ID are required');
      }

      const groupRef = doc(firestore, this.groupsCollection, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();

      // Check if user is already a member
      if (groupData.memberIds.includes(userId)) {
        throw new Error('User is already a member of this group');
      }

      // Get user data
      const userData = await this.getUserData(userId);
      if (!userData) {
        throw new Error('User not found');
      }

      // Check if user was invited
      const pendingMember = groupData.pendingMembers?.find(
        (member: PendingMember) => member.identifier === userData.email
      );

      // Check if this is from an invite link
      const hasValidInviteCode = groupData.inviteCode && groupData.inviteCodeCreatedAt;

      if (!pendingMember && !hasValidInviteCode && groupData.visibility !== 'public') {
        // User needs to request to join
        await this.requestToJoinGroup(groupId, userId);
        throw new Error('Join request sent. Waiting for admin approval.');
      }

      // Remove from pending members if they were invited
      const updatedPendingMembers = groupData.pendingMembers?.filter(
        (member: PendingMember) => member.identifier !== userData.email
      ) || [];

      // Add user to members
      const updatedMembers = [...groupData.members, userData];
      const updatedMemberIds = [...groupData.memberIds, userId];

      // Update group document
      await updateDoc(groupRef, {
        members: updatedMembers,
        memberIds: updatedMemberIds,
        pendingMembers: updatedPendingMembers
      });

      // Initialize member's balance in the group wallet if needed
      if (groupData.wallet) {
        const updatedWallet = {
          ...groupData.wallet,
          memberBalances: {
            ...groupData.wallet.memberBalances,
            [userId]: 0
          }
        };
        await updateDoc(groupRef, { wallet: updatedWallet });
      }

      return await this.getGroup(groupId);
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<Group> {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const groupRef = doc(firestore, this.groupsCollection, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      await updateDoc(groupRef, updates);
      return await this.getGroup(groupId);
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(groupId: string): Promise<boolean> {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User must be authenticated to delete a group');
      }

      const groupRef = doc(firestore, this.groupsCollection, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();

      // Check if the current user is the group owner
      if (groupData.ownerId !== user.uid) {
        throw new Error('Only the group owner can delete the group');
      }

      // Delete the group document
      await deleteDoc(groupRef);
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  async checkGroupExists(leagueId: string, platform: string): Promise<boolean> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User must be authenticated to check group existence');
      }

      if (!leagueId || !platform) {
        throw new Error('League ID and platform are required');
      }

      const groupsRef = collection(firestore, this.groupsCollection);
      const q = query(
        groupsRef,
        where('leagueInfo.leagueId', '==', leagueId.toString()),
        where('leagueInfo.platform', '==', platform)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking group existence:', error);
      throw error;
    }
  }

  async getPublicGroups(): Promise<Group[]> {
    try {
      const groupsRef = collection(firestore, this.groupsCollection);
      const q = query(groupsRef, where('visibility', '==', 'public'));
      const querySnapshot = await getDocs(q);

      const groups: Group[] = [];
      for (const doc of querySnapshot.docs) {
        const groupData = doc.data();
        
        // Fetch owner data
        const ownerData = await this.getUserData(groupData.ownerId);
        
        // Fetch all member data
        const memberPromises = (groupData.memberIds || []).map(async (memberId: string) => {
          try {
            return await this.getUserData(memberId);
          } catch (error) {
            console.error(`Error fetching member data for ${memberId}:`, error);
            return null;
          }
        });
        const members = await Promise.all(memberPromises);

        // Filter out null members and ensure unique members
        const validMembers = members.filter((member): member is User => member !== null);
        const uniqueMembers = Array.from(new Map(validMembers.map(m => [m.uid, m])).values());

        // Ensure wallet exists
        let wallet = groupData.wallet;
        if (!wallet) {
          wallet = this.createInitialWallet(doc.id, groupData.ownerId);
        }

        groups.push({
          id: doc.id,
          ...groupData,
          owner: ownerData,
          members: uniqueMembers,
          memberIds: uniqueMembers.map(m => m.uid),
          wallet: wallet,
          pendingMembers: groupData.pendingMembers || [],
          joinRequests: groupData.joinRequests || []
        } as Group);
      }

      return groups;
    } catch (error) {
      console.error('Error fetching public groups:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService();
