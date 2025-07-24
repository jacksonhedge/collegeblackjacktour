import { supabase } from '../../config/supabaseClient';
import EmailService from '../EmailService';
import SMSService from '../SMSService';
import { notificationService } from './NotificationService';
import type { GroupInvite } from '../../types/group';

export class InvitationService {
  private static instance: InvitationService;

  constructor() {
    if (InvitationService.instance) {
      return InvitationService.instance;
    }
    InvitationService.instance = this;
  }

  // Helper to get current user
  private async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  // Get invitation by token with comprehensive validation
  async getInvitationByToken(token: string): Promise<{
    invitation: GroupInvite;
    group: any;
    inviter: any;
    isValid: boolean;
    errorMessage?: string;
  }> {
    try {
      const { data: invitationData, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          groups!inner(*),
          users!group_invitations_inviter_id_fkey(*)
        `)
        .eq('invite_token', token)
        .single();

      if (error || !invitationData) {
        return {
          invitation: {} as GroupInvite,
          group: null,
          inviter: null,
          isValid: false,
          errorMessage: 'Invitation not found'
        };
      }

      // Check if invitation is still valid
      const now = new Date();
      const expiresAt = new Date(invitationData.expires_at);
      
      if (invitationData.status !== 'pending') {
        return {
          invitation: this.transformInvitationData(invitationData),
          group: invitationData.groups,
          inviter: invitationData.users,
          isValid: false,
          errorMessage: `This invitation has already been ${invitationData.status}`
        };
      }

      if (expiresAt < now) {
        // Mark invitation as expired
        await supabase
          .from('group_invitations')
          .update({ status: 'expired' })
          .eq('id', invitationData.id);

        return {
          invitation: this.transformInvitationData(invitationData),
          group: invitationData.groups,
          inviter: invitationData.users,
          isValid: false,
          errorMessage: 'This invitation has expired'
        };
      }

      // Check if group still exists and is active
      if (!invitationData.groups || !invitationData.groups.is_active) {
        return {
          invitation: this.transformInvitationData(invitationData),
          group: invitationData.groups,
          inviter: invitationData.users,
          isValid: false,
          errorMessage: 'This group is no longer available'
        };
      }

      return {
        invitation: this.transformInvitationData(invitationData),
        group: invitationData.groups,
        inviter: invitationData.users,
        isValid: true
      };
    } catch (error: any) {
      console.error('Error getting invitation by token:', error);
      return {
        invitation: {} as GroupInvite,
        group: null,
        inviter: null,
        isValid: false,
        errorMessage: 'Failed to load invitation'
      };
    }
  }

  // Accept invitation with comprehensive error handling
  async acceptInvitation(token: string): Promise<{
    success: boolean;
    groupId?: string;
    errorMessage?: string;
  }> {
    try {
      const user = await this.getCurrentUser();
      
      // Get and validate invitation
      const { invitation, group, inviter, isValid, errorMessage } = await this.getInvitationByToken(token);
      
      if (!isValid) {
        return { success: false, errorMessage };
      }

      // Check if user's email matches the invitation
      if (invitation.inviteeEmail.toLowerCase() !== user.email?.toLowerCase()) {
        return {
          success: false,
          errorMessage: `This invitation is for ${invitation.inviteeEmail}, but you're signed in as ${user.email}. Please sign in with the correct account.`
        };
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id, status')
        .eq('group_id', invitation.groupId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        if (existingMember.status === 'invited') {
          // Update existing invited status to member
          const { error: updateError } = await supabase
            .from('group_members')
            .update({ 
              status: 'member',
              joined_at: new Date().toISOString()
            })
            .eq('id', existingMember.id);

          if (updateError) {
            throw new Error(`Failed to update member status: ${updateError.message}`);
          }
        } else {
          return {
            success: false,
            errorMessage: 'You are already a member of this group'
          };
        }
      } else {
        // Add user as new member
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: invitation.groupId,
            user_id: user.id,
            status: 'member',
            role: 'member',
            invited_by: invitation.inviterId,
            invited_at: invitation.createdAt
          });

        if (memberError) {
          throw new Error(`Failed to add member: ${memberError.message}`);
        }
      }

      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from('group_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          invitee_user_id: user.id
        })
        .eq('invite_token', token);

      if (inviteError) {
        console.error('Failed to update invitation status:', inviteError);
        // Don't fail the whole operation if this fails
      }

      // Initialize wallet balance
      const { data: wallet } = await supabase
        .from('group_wallets')
        .select('id')
        .eq('group_id', invitation.groupId)
        .single();

      if (wallet) {
        await supabase
          .from('group_wallet_balances')
          .insert({
            wallet_id: wallet.id,
            user_id: user.id,
            balance: 0
          })
          .on('conflict', () => {
            // Ignore if balance already exists
          });
      }

      // Send notifications to inviter (email, SMS, and in-app)
      try {
        // Get current group stats
        const { data: groupStats } = await supabase
          .from('groups')
          .select('member_count, total_balance')
          .eq('id', invitation.groupId)
          .single();

        // Get invitee name
        const { data: inviteeData } = await supabase
          .from('users')
          .select('display_name, email')
          .eq('id', user.id)
          .single();

        const inviteeName = inviteeData?.display_name || inviteeData?.email?.split('@')[0] || 'Someone';
        const inviterName = inviter.display_name || inviter.email?.split('@')[0] || 'there';

        // Send email notification
        await EmailService.sendInviteAcceptedNotification({
          inviterEmail: inviter.email,
          inviterName: inviterName,
          inviteeName: inviteeName,
          groupName: group.name,
          groupId: invitation.groupId,
          memberCount: groupStats?.member_count || 0,
          groupBalance: groupStats?.total_balance || 0
        });

        // Send SMS notification if enabled
        const inviterPhone = await SMSService.getUserPhone(inviter.id);
        if (inviterPhone && await SMSService.isUserSMSEnabled(inviter.id)) {
          await SMSService.sendInviteAcceptedSMS({
            inviterPhone: inviterPhone,
            inviteeName: inviteeName,
            groupName: group.name
          });
        }

        // Send in-app notification
        await notificationService.notifyInviteAccepted(
          inviter.id,
          inviteeName,
          group.name,
          invitation.groupId
        );
      } catch (notificationError) {
        console.error('Failed to send acceptance notifications:', notificationError);
        // Don't fail the whole operation if notifications fail
      }

      return {
        success: true,
        groupId: invitation.groupId
      };

    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      return {
        success: false,
        errorMessage: error.message || 'Failed to accept invitation'
      };
    }
  }

  // Decline invitation
  async declineInvitation(token: string): Promise<{
    success: boolean;
    errorMessage?: string;
  }> {
    try {
      const user = await this.getCurrentUser();
      const { invitation, group, inviter, isValid, errorMessage } = await this.getInvitationByToken(token);
      
      if (!isValid && !errorMessage?.includes('already been')) {
        return { success: false, errorMessage };
      }

      const { error } = await supabase
        .from('group_invitations')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString()
        })
        .eq('invite_token', token);

      if (error) {
        throw new Error(`Failed to decline invitation: ${error.message}`);
      }

      // Send notifications to inviter (email, SMS, and in-app)
      try {
        // Get current group stats
        const { data: groupStats } = await supabase
          .from('groups')
          .select('member_count, total_balance')
          .eq('id', invitation.groupId)
          .single();

        // Get decliner name
        const { data: inviteeData } = await supabase
          .from('users')
          .select('display_name, email')
          .eq('email', invitation.inviteeEmail)
          .single();

        const inviteeName = inviteeData?.display_name || invitation.inviteeEmail.split('@')[0] || 'Someone';
        const inviterName = inviter.display_name || inviter.email?.split('@')[0] || 'there';

        // Send email notification
        await EmailService.sendInviteDeclinedNotification({
          inviterEmail: inviter.email,
          inviterName: inviterName,
          inviteeName: inviteeName,
          groupName: group.name,
          groupId: invitation.groupId,
          memberCount: groupStats?.member_count || 0,
          groupBalance: groupStats?.total_balance || 0
        });

        // Send SMS notification if enabled
        const inviterPhone = await SMSService.getUserPhone(inviter.id);
        if (inviterPhone && await SMSService.isUserSMSEnabled(inviter.id)) {
          await SMSService.sendInviteDeclinedSMS({
            inviterPhone: inviterPhone,
            inviteeName: inviteeName,
            groupName: group.name
          });
        }

        // Send in-app notification
        await notificationService.notifyInviteDeclined(
          inviter.id,
          inviteeName,
          group.name,
          invitation.groupId
        );
      } catch (notificationError) {
        console.error('Failed to send decline notifications:', notificationError);
        // Don't fail the whole operation if notifications fail
      }

      return { success: true };

    } catch (error: any) {
      console.error('Error declining invitation:', error);
      return {
        success: false,
        errorMessage: error.message || 'Failed to decline invitation'
      };
    }
  }

  // Cancel invitation (for group admins)
  async cancelInvitation(invitationId: string): Promise<{
    success: boolean;
    errorMessage?: string;
  }> {
    try {
      const user = await this.getCurrentUser();

      // Check if user has permission to cancel this invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('group_invitations')
        .select(`
          *,
          groups!inner(owner_id)
        `)
        .eq('id', invitationId)
        .single();

      if (inviteError || !invitation) {
        return { success: false, errorMessage: 'Invitation not found' };
      }

      // Check if user is the inviter or group owner
      const isInviter = invitation.inviter_id === user.id;
      const isOwner = invitation.groups.owner_id === user.id;

      if (!isInviter && !isOwner) {
        // Check if user is group admin
        const { data: member } = await supabase
          .from('group_members')
          .select('status')
          .eq('group_id', invitation.group_id)
          .eq('user_id', user.id)
          .single();

        if (!member || !['owner', 'admin'].includes(member.status)) {
          return { success: false, errorMessage: 'You do not have permission to cancel this invitation' };
        }
      }

      const { error } = await supabase
        .from('group_invitations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) {
        throw new Error(`Failed to cancel invitation: ${error.message}`);
      }

      return { success: true };

    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      return {
        success: false,
        errorMessage: error.message || 'Failed to cancel invitation'
      };
    }
  }

  // Resend invitation email
  async resendInvitation(invitationId: string): Promise<{
    success: boolean;
    errorMessage?: string;
  }> {
    try {
      const user = await this.getCurrentUser();

      const { data: invitation, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          groups!inner(*)
        `)
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single();

      if (error || !invitation) {
        return { success: false, errorMessage: 'Invitation not found or no longer pending' };
      }

      // Check if user has permission
      const { data: member } = await supabase
        .from('group_members')
        .select('status')
        .eq('group_id', invitation.group_id)
        .eq('user_id', user.id)
        .single();

      if (!member || !['owner', 'admin'].includes(member.status)) {
        return { success: false, errorMessage: 'You do not have permission to resend invitations' };
      }

      // Send email
      await emailService.sendBulkGroupInvites(
        invitation.group_id,
        invitation.groups.name,
        [invitation.invitee_email],
        invitation.groups.emoji || '👥'
      );

      // Update reminder sent timestamp
      await supabase
        .from('group_invitations')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', invitationId);

      return { success: true };

    } catch (error: any) {
      console.error('Error resending invitation:', error);
      return {
        success: false,
        errorMessage: error.message || 'Failed to resend invitation'
      };
    }
  }

  // Clean up expired invitations
  async cleanupExpiredInvitations(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('group_invitations')
        .update({ status: 'expired' })
        .lt('expires_at', new Date().toISOString())
        .eq('status', 'pending')
        .select('id');

      if (error) {
        console.error('Error cleaning up expired invitations:', error);
        return 0;
      }

      return data.length;
    } catch (error) {
      console.error('Error in cleanup process:', error);
      return 0;
    }
  }

  // Helper to transform database invitation data to GroupInvite type
  private transformInvitationData(data: any): GroupInvite {
    return {
      id: data.id,
      groupId: data.group_id,
      inviterId: data.inviter_id,
      inviteeEmail: data.invitee_email,
      inviteeUserId: data.invitee_user_id,
      status: data.status,
      message: data.message,
      inviteToken: data.invite_token,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
      acceptedAt: data.accepted_at,
      declinedAt: data.declined_at
    };
  }
}

export const invitationService = new InvitationService();