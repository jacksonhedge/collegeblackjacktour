import { supabase } from '../../config/supabaseClient';
import { emailService } from '../EmailService';
import type { 
  Group, 
  GroupMember, 
  GroupInvite, 
  User, 
  MemberStatus, 
  UserRole,
  InviteResult 
} from '../../types/group';

interface GroupData {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  owner_id: string;
  visibility: 'public' | 'private';
  invite_code?: string;
  invite_code_expires_at?: string;
  settings?: any;
  metadata?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GroupMemberData {
  id: string;
  group_id: string;
  user_id: string;
  status: MemberStatus;
  role: string;
  joined_at: string;
  invited_by?: string;
  invited_at?: string;
  last_active?: string;
  settings?: any;
}

interface GroupInvitationData {
  id: string;
  group_id: string;
  inviter_id: string;
  invitee_email: string;
  invitee_user_id?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  message?: string;
  invite_token: string;
  expires_at: string;
  accepted_at?: string;
  declined_at?: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseGroupService {
  private static instance: SupabaseGroupService;

  constructor() {
    if (SupabaseGroupService.instance) {
      return SupabaseGroupService.instance;
    }
    SupabaseGroupService.instance = this;
  }

  // Helper to get current user
  private async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  // Helper to get user data
  private async getUserData(userId: string): Promise<User> {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user data: ${error.message}`);
    }

    return {
      uid: userData.id,
      email: userData.email,
      displayName: userData.first_name && userData.last_name 
        ? `${userData.first_name} ${userData.last_name}` 
        : userData.username || 'Unknown User',
      username: userData.username,
      photoURL: userData.profile_image,
      createdAt: userData.created_at,
      groups: []
    };
  }

  // Create a new group
  async createGroup(groupData: {
    name: string;
    description?: string;
    emoji?: string;
    visibility?: 'public' | 'private';
  }): Promise<Group> {
    const user = await this.getCurrentUser();

    // Use the database function to create group with owner
    const { data, error } = await supabase.rpc('create_group_with_owner', {
      p_name: groupData.name,
      p_description: groupData.description || '',
      p_emoji: groupData.emoji || '👥',
      p_owner_id: user.id,
      p_visibility: groupData.visibility || 'private'
    });

    if (error) {
      throw new Error(`Failed to create group: ${error.message}`);
    }

    return this.getGroupById(data);
  }

  // Get groups for current user
  async getUserGroups(): Promise<Group[]> {
    const user = await this.getCurrentUser();

    const { data: memberData, error } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups!inner(*)
      `)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to fetch user groups: ${error.message}`);
    }

    const groupIds = memberData.map(m => m.group_id);
    const groupPromises = groupIds.map(id => this.getGroupById(id));
    
    return Promise.all(groupPromises);
  }

  // Get group by ID with full member details
  async getGroupById(groupId: string): Promise<Group> {
    // Get group data
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError) {
      throw new Error(`Failed to fetch group: ${groupError.message}`);
    }

    // Get group members with user data
    const { data: membersData, error: membersError } = await supabase
      .from('group_members')
      .select(`
        *,
        users!inner(*)
      `)
      .eq('group_id', groupId);

    if (membersError) {
      throw new Error(`Failed to fetch group members: ${membersError.message}`);
    }

    // Get pending invitations
    const { data: invitationsData, error: invitationsError } = await supabase
      .from('group_invitations')
      .select('*')
      .eq('group_id', groupId)
      .eq('status', 'pending');

    if (invitationsError) {
      throw new Error(`Failed to fetch invitations: ${invitationsError.message}`);
    }

    // Get group wallet
    const { data: walletData, error: walletError } = await supabase
      .from('group_wallets')
      .select('*')
      .eq('group_id', groupId)
      .single();

    // Transform data
    const members: GroupMember[] = membersData.map((memberData: any) => ({
      uid: memberData.users.id,
      email: memberData.users.email,
      displayName: memberData.users.first_name && memberData.users.last_name 
        ? `${memberData.users.first_name} ${memberData.users.last_name}` 
        : memberData.users.username || 'Unknown User',
      username: memberData.users.username,
      photoURL: memberData.users.profile_image,
      role: memberData.role as UserRole,
      status: memberData.status as MemberStatus,
      joinedAt: memberData.joined_at,
      invitedAt: memberData.invited_at,
      invitedBy: memberData.invited_by,
      lastActive: memberData.last_active,
      createdAt: memberData.users.created_at,
      groups: []
    }));

    const owner = members.find(m => m.status === 'owner');
    if (!owner) {
      throw new Error('Group owner not found');
    }

    const pendingMembers = invitationsData.map((inv: GroupInvitationData) => ({
      identifier: inv.invitee_email,
      type: 'email' as const,
      status: 'invited' as MemberStatus,
      invitedAt: inv.created_at,
      invitedBy: inv.inviter_id,
      message: inv.message
    }));

    return {
      id: groupData.id,
      name: groupData.name,
      description: groupData.description || '',
      emoji: groupData.emoji || '👥',
      ownerId: groupData.owner_id,
      owner,
      members,
      memberIds: members.map(m => m.uid),
      pendingMembers,
      dateCreated: groupData.created_at,
      isHidden: !groupData.is_active,
      visibility: groupData.visibility,
      inviteLink: groupData.invite_code 
        ? `${window.location.origin}/invite/group/${groupData.invite_code}`
        : `${window.location.origin}/groups/${groupData.id}`,
      status: groupData.is_active ? 'active' : 'inactive',
      wallet: walletData ? {
        platformId: `group_${groupData.id}`,
        groupId: groupData.id,
        ownerId: groupData.owner_id,
        name: 'Group Wallet',
        logo: '/images/BankrollLogoTransparent.png',
        cashBalance: parseFloat(walletData.total_balance || '0'),
        bonusBalances: [],
        totalBonusBalance: 0,
        lastUpdated: new Date(walletData.updated_at),
        status: 'active',
        connected: true,
        memberBalances: {},
        expenses: []
      } : {
        platformId: `group_${groupData.id}`,
        groupId: groupData.id,
        ownerId: groupData.owner_id,
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
      type: 'default',
      leagueInfo: null
    };
  }

  // Invite users to a group
  async inviteUsers(groupId: string, emails: string[], message?: string): Promise<InviteResult> {
    const user = await this.getCurrentUser();
    
    let invitedCount = 0;
    let skippedCount = 0;
    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    for (const email of emails) {
      try {
        const { data, error } = await supabase.rpc('invite_user_to_group', {
          p_group_id: groupId,
          p_inviter_id: user.id,
          p_invitee_email: email.trim().toLowerCase(),
          p_message: message || null
        });

        if (error) {
          if (error.message.includes('already a member')) {
            skippedCount++;
            results.push({ email, success: false, error: 'Already a member' });
          } else {
            results.push({ email, success: false, error: error.message });
          }
        } else {
          invitedCount++;
          results.push({ email, success: true });
          
          // Send email invitation
          try {
            const group = await this.getGroupById(groupId);
            await emailService.sendBulkGroupInvites(
              groupId,
              group.name,
              [email],
              group.emoji
            );
          } catch (emailError) {
            console.error('Failed to send email invitation:', emailError);
            // Don't fail the invitation if email sending fails
          }
        }
      } catch (error: any) {
        results.push({ email, success: false, error: error.message });
      }
    }

    return {
      success: invitedCount > 0,
      message: invitedCount > 0 
        ? `Successfully invited ${invitedCount} user(s)${skippedCount > 0 ? ` (${skippedCount} skipped)` : ''}`
        : 'No invitations sent',
      invitedCount,
      skippedCount
    };
  }

  // Accept a group invitation
  async acceptInvitation(inviteToken: string): Promise<string> {
    const user = await this.getCurrentUser();

    const { data: groupId, error } = await supabase.rpc('accept_group_invitation', {
      p_invitation_token: inviteToken,
      p_user_id: user.id
    });

    if (error) {
      throw new Error(`Failed to accept invitation: ${error.message}`);
    }

    return groupId;
  }

  // Decline a group invitation
  async declineInvitation(inviteToken: string): Promise<void> {
    const { error } = await supabase
      .from('group_invitations')
      .update({ 
        status: 'declined',
        declined_at: new Date().toISOString()
      })
      .eq('invite_token', inviteToken);

    if (error) {
      throw new Error(`Failed to decline invitation: ${error.message}`);
    }
  }

  // Join a group (for public groups or with invite code)
  async joinGroup(groupId: string): Promise<Group> {
    const user = await this.getCurrentUser();

    // Check if group exists and is public, or user has been invited
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError) {
      throw new Error('Group not found');
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      throw new Error('You are already a member of this group');
    }

    // Check if user has a pending invitation
    const { data: invitation } = await supabase
      .from('group_invitations')
      .select('*')
      .eq('group_id', groupId)
      .eq('invitee_email', user.email)
      .eq('status', 'pending')
      .single();

    if (invitation) {
      // Accept the invitation
      return this.getGroupById(await this.acceptInvitation(invitation.invite_token));
    }

    if (groupData.visibility === 'public') {
      // Add user directly to public group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          status: 'member',
          role: 'member'
        });

      if (memberError) {
        throw new Error(`Failed to join group: ${memberError.message}`);
      }

      // Initialize wallet balance
      const { data: wallet } = await supabase
        .from('group_wallets')
        .select('id')
        .eq('group_id', groupId)
        .single();

      if (wallet) {
        await supabase
          .from('group_wallet_balances')
          .insert({
            wallet_id: wallet.id,
            user_id: user.id,
            balance: 0
          });
      }

      return this.getGroupById(groupId);
    }

    // For private groups, create a join request
    const { error: requestError } = await supabase
      .from('group_join_requests')
      .insert({
        group_id: groupId,
        user_id: user.id,
        status: 'pending'
      });

    if (requestError) {
      throw new Error(`Failed to create join request: ${requestError.message}`);
    }

    throw new Error('Join request sent. Waiting for admin approval.');
  }

  // Remove member from group
  async removeMember(groupId: string, userId: string): Promise<void> {
    const user = await this.getCurrentUser();

    // Check if current user has permission
    const { data: currentMember } = await supabase
      .from('group_members')
      .select('status')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!currentMember || !['owner', 'admin'].includes(currentMember.status)) {
      throw new Error('You do not have permission to remove members');
    }

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  }

  // Update member role
  async updateMemberRole(groupId: string, userId: string, newStatus: MemberStatus): Promise<void> {
    const user = await this.getCurrentUser();

    // Check if current user has permission
    const { data: currentMember } = await supabase
      .from('group_members')
      .select('status')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!currentMember || currentMember.status !== 'owner') {
      throw new Error('Only group owners can update member roles');
    }

    const { error } = await supabase
      .from('group_members')
      .update({ 
        status: newStatus,
        role: newStatus
      })
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update member role: ${error.message}`);
    }
  }

  // Delete group
  async deleteGroup(groupId: string): Promise<void> {
    const user = await this.getCurrentUser();

    // Check if user is the owner
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();

    if (!group || group.owner_id !== user.id) {
      throw new Error('Only group owners can delete groups');
    }

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      throw new Error(`Failed to delete group: ${error.message}`);
    }
  }

  // Get user's invitations
  async getUserInvitations(): Promise<GroupInvite[]> {
    const user = await this.getCurrentUser();

    const { data: invitations, error } = await supabase
      .from('group_invitations')
      .select(`
        *,
        groups!inner(*),
        users!group_invitations_inviter_id_fkey(*)
      `)
      .eq('invitee_email', user.email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (error) {
      throw new Error(`Failed to fetch invitations: ${error.message}`);
    }

    return invitations.map((inv: any) => ({
      id: inv.id,
      groupId: inv.group_id,
      inviterId: inv.inviter_id,
      inviteeEmail: inv.invitee_email,
      inviteeUserId: inv.invitee_user_id,
      status: inv.status,
      message: inv.message,
      inviteToken: inv.invite_token,
      createdAt: inv.created_at,
      expiresAt: inv.expires_at,
      acceptedAt: inv.accepted_at,
      declinedAt: inv.declined_at
    }));
  }
}

export const supabaseGroupService = new SupabaseGroupService();