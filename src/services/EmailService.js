import { supabase } from './supabase/config';

class EmailService {
  /**
   * Send a welcome email to a new user
   */
  async sendWelcomeEmail(email, userName) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          type: 'welcome',
          data: {
            userName: userName || email.split('@')[0]
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Send a group invitation email
   */
  async sendGroupInvite({ 
    to, 
    inviterName, 
    groupName, 
    groupId,
    groupBalance = 0,
    memberCount = 0,
    personalMessage 
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          type: 'group-invite',
          data: {
            inviterName,
            groupName,
            groupId,
            groupBalance,
            memberCount,
            personalMessage,
            inviteLink: `https://bankroll.live/invite/${groupId}/${Date.now().toString(36)}`
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending group invite:', error);
      throw error;
    }
  }

  /**
   * Send a transaction notification email
   */
  async sendTransactionEmail({ 
    to, 
    type, 
    amount, 
    currency = 'USD',
    fromUser,
    toUser,
    platform,
    description,
    transactionId,
    balance 
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          type: 'transaction',
          data: {
            type,
            amount,
            currency,
            fromUser,
            toUser,
            platform,
            description,
            transactionId,
            timestamp: new Date().toLocaleString(),
            balance
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending transaction email:', error);
      throw error;
    }
  }

  /**
   * Send a custom email with your own HTML content
   */
  async sendCustomEmail({ to, subject, htmlContent }) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          type: 'custom',
          subject,
          data: {
            htmlContent
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending custom email:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails (same content to multiple recipients)
   */
  async sendBulkEmail({ recipients, type, subject, data }) {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipients, // array of email addresses
          type,
          subject,
          data
        }
      });

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      throw error;
    }
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          type: 'verification',
          data: {
            email,
            verificationLink: `https://bankroll.live/verify-email?email=${encodeURIComponent(email)}`
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  /**
   * Send notification when an invitation is declined
   */
  async sendInviteDeclinedNotification({
    inviterEmail,
    inviterName,
    inviteeName,
    groupName,
    groupId,
    memberCount = 0,
    groupBalance = 0
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: inviterEmail,
          type: 'invite-declined',
          data: {
            inviterName,
            inviteeName,
            groupName,
            groupId,
            memberCount,
            groupBalance
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending invite declined notification:', error);
      throw error;
    }
  }

  /**
   * Send notification when an invitation is accepted
   */
  async sendInviteAcceptedNotification({
    inviterEmail,
    inviterName,
    inviteeName,
    groupName,
    groupId,
    memberCount = 0,
    groupBalance = 0
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: inviterEmail,
          type: 'invite-accepted',
          data: {
            inviterName,
            inviteeName,
            groupName,
            groupId,
            memberCount,
            groupBalance
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending invite accepted notification:', error);
      throw error;
    }
  }

  /**
   * Send bulk group invitations to multiple emails
   * This uses the ResendInviteService which is already integrated
   */
  async sendBulkGroupInvites(groupId, groupName, emails, emoji = '👥', inviterInfo = null) {
    try {
      console.log('Sending bulk group invites via Resend:', { groupId, groupName, emails });
      
      // Use ResendInviteService for actual email sending
      const ResendInviteService = (await import('./ResendInviteService')).default;
      
      // If inviter info not provided, try to get from Firebase
      let inviterName, inviterEmail;
      
      if (inviterInfo) {
        inviterName = inviterInfo.displayName || inviterInfo.email?.split('@')[0] || 'Someone';
        inviterEmail = inviterInfo.email;
      } else {
        // Fallback to Firebase auth
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) throw new Error('User not authenticated');
        
        inviterName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Someone';
        inviterEmail = currentUser.email;
      }
      
      // Send bulk invites using ResendInviteService
      const results = await ResendInviteService.sendBulkInvites({
        recipients: emails,
        type: 'group',
        inviteData: {
          inviterName,
          inviterEmail,
          groupId,
          groupName,
          groupEmoji: emoji,
          method: 'email'
        }
      });
      
      // Count successful sends
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount > 0,
        message: `Successfully sent ${successCount} of ${emails.length} invitations`,
        sentTo: results.filter(r => r.success).map(r => r.recipient),
        failed: results.filter(r => !r.success).map(r => ({ email: r.recipient, error: r.error })),
        results
      };
    } catch (error) {
      console.error('Error sending bulk group invites:', error);
      throw error;
    }
  }

  /**
   * Send referral invitations to multiple emails
   */
  async sendReferralInvites(emails, referralCode, inviterName, personalMessage = '') {
    try {
      console.log('Sending referral invites:', { emails, referralCode, inviterName });
      
      // Use ResendInviteService for actual email sending
      const ResendInviteService = (await import('./ResendInviteService')).default;
      
      // Send bulk invites using ResendInviteService
      const results = await ResendInviteService.sendBulkInvites({
        recipients: emails,
        type: 'referral',
        inviteData: {
          inviterName,
          referralCode,
          personalMessage,
          method: 'email'
        }
      });
      
      // Count successful sends
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount > 0,
        message: `Successfully sent ${successCount} of ${emails.length} referral invites`,
        sentTo: results.filter(r => r.success).map(r => r.recipient),
        failed: results.filter(r => !r.success).map(r => ({ email: r.recipient, error: r.error })),
        results
      };
    } catch (error) {
      console.error('Error sending referral invites:', error);
      throw error;
    }
  }

  /**
   * Send security alert email (login notifications, password changes, etc.)
   */
  async sendSecurityEmail({ to, alertType, data }) {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          type: 'security',
          data: {
            alertType,
            ...data,
            timestamp: new Date().toLocaleString(),
          }
        }
      });

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error sending security email:', error);
      throw error;
    }
  }
}

export default new EmailService();