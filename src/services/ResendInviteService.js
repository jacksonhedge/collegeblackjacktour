import { supabase } from './supabase/config';
import { auth } from './firebase/config';

class ResendInviteService {
  constructor() {
    this.baseUrl = 'https://bankroll.live';
  }

  /**
   * Send invitation to join Bankroll platform using Resend
   */
  async sendBankrollInvite({ 
    to, 
    inviterName, 
    inviterEmail,
    personalMessage,
    method = 'email' // 'email' or 'sms'
  }) {
    try {
      if (method === 'sms') {
        return await this.sendSMSInvite({
          to,
          type: 'bankroll',
          inviterName,
          personalMessage,
          inviteLink: `${this.baseUrl}/signup?referrer=${encodeURIComponent(inviterEmail)}`
        });
      }

      // Send via Resend using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          type: 'welcome',
          data: {
            userName: inviterName,
            inviterName,
            inviterEmail,
            personalMessage,
            inviteLink: `${this.baseUrl}/signup?referrer=${encodeURIComponent(inviterEmail)}`,
            unsubscribeUrl: `${this.baseUrl}/unsubscribe`
          }
        }
      });

      if (error) throw error;

      // Track the invitation
      await this.trackInvite('bankroll', to, 'sent');

      return data;
    } catch (error) {
      console.error('Error sending Bankroll invite:', error);
      throw error;
    }
  }

  /**
   * Send group invitation using Resend
   */
  async sendGroupInvite({ 
    to, 
    inviterName,
    inviterEmail,
    groupId,
    groupName,
    groupEmoji,
    groupBalance,
    memberCount,
    members,
    winRate,
    personalMessage,
    method = 'email'
  }) {
    try {
      // Generate invite code
      const inviteCode = await this.generateInviteCode(groupId);
      const inviteLink = `${this.baseUrl}/join/group/${groupId}`;

      if (method === 'sms') {
        return await this.sendSMSInvite({
          to,
          type: 'group',
          inviterName,
          groupName,
          personalMessage,
          inviteLink
        });
      }

      // Check if recipient is a new user
      const isNewUser = await this.checkIfNewUser(to);

      // Send via Resend using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          type: 'group-invite',
          data: {
            inviterName,
            inviterEmail,
            groupId,
            groupName,
            groupEmoji,
            groupBalance: groupBalance || 0,
            memberCount: memberCount || 1,
            members,
            winRate: winRate || 0,
            personalMessage,
            inviteLink,
            isNewUser,
            unsubscribeUrl: `${this.baseUrl}/unsubscribe`
          }
        }
      });

      if (error) throw error;

      // Store invite in database
      await this.storeInvite({
        type: 'group',
        sender_id: auth.currentUser?.uid,
        sender_name: inviterName,
        sender_email: inviterEmail,
        recipient: to,
        group_id: groupId,
        invite_code: inviteCode,
        message: personalMessage,
        status: 'pending'
      });

      // Track the invitation
      await this.trackInvite('group', to, 'sent');

      return data;
    } catch (error) {
      console.error('Error sending group invite:', error);
      throw error;
    }
  }

  /**
   * Send friend request using Resend
   */
  async sendFriendRequest({ 
    to, 
    senderName,
    senderEmail,
    senderUsername,
    senderAvatar,
    groupCount,
    friendCount,
    winStreak,
    mutualFriends,
    personalMessage,
    method = 'email'
  }) {
    try {
      const requestId = this.generateRequestId();
      const acceptUrl = `${this.baseUrl}/friends/requests?action=accept&id=${requestId}`;
      const declineUrl = `${this.baseUrl}/friends/requests?action=decline&id=${requestId}`;

      if (method === 'sms') {
        return await this.sendSMSInvite({
          to,
          type: 'friend',
          senderName,
          personalMessage,
          acceptUrl
        });
      }

      // Check if recipient is a new user
      const isNewUser = await this.checkIfNewUser(to);

      // Send via Resend using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          type: 'custom',
          subject: `${senderName} wants to be your friend on Bankroll`,
          data: {
            message: personalMessage || `${senderName} sent you a friend request on Bankroll!`,
            senderName,
            senderEmail,
            senderUsername,
            senderAvatar,
            groupCount: groupCount || 0,
            friendCount: friendCount || 0,
            winStreak: winStreak || 0,
            mutualFriends,
            personalMessage,
            acceptUrl,
            declineUrl,
            settingsUrl: `${this.baseUrl}/settings/notifications`,
            unsubscribeUrl: `${this.baseUrl}/unsubscribe`,
            isNewUser
          }
        }
      });

      if (error) throw error;

      // Store friend request in database
      await this.storeFriendRequest({
        request_id: requestId,
        sender_id: auth.currentUser?.uid,
        sender_name: senderName,
        sender_email: senderEmail,
        recipient: to,
        message: personalMessage,
        status: 'pending'
      });

      // Track the invitation
      await this.trackInvite('friend', to, 'sent');

      return data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * Send bulk invitations using Resend
   */
  async sendBulkInvites({ recipients, type, inviteData, method = 'email' }) {
    const results = [];
    const emailRecipients = [];
    const smsRecipients = [];

    // Separate email and SMS recipients
    recipients.forEach(recipient => {
      if (recipient.includes('@')) {
        emailRecipients.push(recipient);
      } else {
        smsRecipients.push(recipient);
      }
    });

    // Send bulk emails if method is email
    if (method === 'email' && emailRecipients.length > 0) {
      try {
        // For bulk emails, we can send to multiple recipients at once
        const templateData = this.prepareBulkTemplateData(type, inviteData);
        
        console.log('Sending bulk email invites:', { 
          recipients: emailRecipients, 
          type: type === 'group' ? 'group-invite' : type,
          templateData 
        });
        
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            to: emailRecipients, // Resend supports array of recipients
            type: type === 'group' ? 'group-invite' : type,
            data: templateData
          }
        });

        console.log('Email send response:', { data, error });

        if (error) throw error;

        emailRecipients.forEach(recipient => {
          results.push({ recipient, success: true, method: 'email' });
        });
      } catch (error) {
        emailRecipients.forEach(recipient => {
          results.push({ recipient, success: false, error: error.message });
        });
      }
    }

    // Send individual SMS messages
    for (const recipient of smsRecipients) {
      try {
        await this.sendSMSInvite({
          to: recipient,
          type,
          ...inviteData
        });
        results.push({ recipient, success: true, method: 'sms' });
      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Send SMS invitation (opens native SMS app)
   */
  async sendSMSInvite(data) {
    try {
      let message = '';
      
      switch (data.type) {
        case 'bankroll':
          message = `${data.inviterName} invited you to join Bankroll! Get instant withdrawals from sportsbooks and earn on your balance. Sign up and get $25: ${data.inviteLink}`;
          break;
        case 'group':
          message = `${data.inviterName} invited you to join ${data.groupName} on Bankroll! ${data.personalMessage ? `"${data.personalMessage}" ` : ''}Join here: ${data.inviteLink}`;
          break;
        case 'friend':
          message = `${data.senderName} sent you a friend request on Bankroll! ${data.personalMessage ? `"${data.personalMessage}" ` : ''}Accept: ${data.acceptUrl}`;
          break;
        case 'referral':
          message = `${data.inviterName} invited you to join Bankroll! Sign up with referral code ${data.referralCode} and we both get $10! ${data.personalMessage ? `"${data.personalMessage}" ` : ''}Join here: ${this.baseUrl}/signup?ref=${data.referralCode}`;
          break;
      }

      // Format phone number
      const cleanPhone = data.to.replace(/\D/g, '');
      
      // Open native SMS app
      window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
      
      return { success: true };
    } catch (error) {
      console.error('Error sending SMS invite:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  
  async generateInviteCode(groupId) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${groupId}-${code}`;
  }

  generateRequestId() {
    return `fr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  getTemplateName(type) {
    const templateMap = {
      'bankroll': 'joinBankroll',
      'group': 'groupInvite',
      'friend': 'friendRequest',
      'referral': 'referralInvite'
    };
    return templateMap[type] || 'genericInvite';
  }

  prepareBulkTemplateData(type, inviteData) {
    // Prepare template data without recipient-specific info for bulk sends
    const baseData = { ...inviteData };
    delete baseData.to;
    
    // Add referral-specific data
    if (type === 'referral' && inviteData.referralCode) {
      baseData.referralLink = `${this.baseUrl}/signup?ref=${inviteData.referralCode}`;
      baseData.reward = '$10';
    }
    
    return baseData;
  }

  async checkIfNewUser(emailOrPhone) {
    try {
      // Check if user exists in Supabase
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', emailOrPhone)
        .single();
      
      return !data; // Return true if user doesn't exist
    } catch {
      return true; // Assume new user if check fails
    }
  }

  async storeInvite(inviteData) {
    try {
      const { error } = await supabase
        .from('invitations')
        .insert({
          ...inviteData,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error storing invite:', error);
    }
  }

  async storeFriendRequest(requestData) {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          ...requestData,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error storing friend request:', error);
    }
  }

  async trackInvite(type, recipient, status) {
    try {
      await supabase
        .from('invitation_metrics')
        .insert({
          type,
          recipient,
          status,
          sender_id: auth.currentUser?.uid,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking invite:', error);
    }
  }

  /**
   * Resend invite if previous one expired or was not received
   */
  async resendInvite(inviteId) {
    try {
      // Get the original invite
      const { data: invite, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (error || !invite) throw new Error('Invite not found');

      // Resend based on type
      switch (invite.type) {
        case 'group':
          return await this.sendGroupInvite({
            to: invite.recipient,
            inviterName: invite.sender_name,
            inviterEmail: invite.sender_email,
            groupId: invite.group_id,
            groupName: invite.group_name,
            personalMessage: invite.message
          });
        
        case 'friend':
          return await this.sendFriendRequest({
            to: invite.recipient,
            senderName: invite.sender_name,
            senderEmail: invite.sender_email,
            personalMessage: invite.message
          });
        
        default:
          throw new Error('Unknown invite type');
      }
    } catch (error) {
      console.error('Error resending invite:', error);
      throw error;
    }
  }
}

export default new ResendInviteService();