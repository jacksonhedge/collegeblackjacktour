import { supabase } from './supabase/config';
import EmailService from './EmailService';
import SMSService from './SMSService';
import { getBaseUrl } from '../utils/urlHelpers';

class InviteService {
  async sendEmailInvite({ to, type, inviterName, groupName, groupId, amount, message }) {
    try {
      // Use the new email service
      if (type === 'group' && groupName) {
        const result = await EmailService.sendGroupInvite({
          to,
          inviterName,
          groupName,
          groupId: groupId || '1',
          groupBalance: amount || 0,
          memberCount: 8, // Default for now
          personalMessage: message
        });
        return result;
      } else {
        // For other invite types, use custom email
        const emailContent = this.generateEmailContent({ type, inviterName, amount, message });
        const result = await EmailService.sendCustomEmail({
          to,
          subject: emailContent.subject,
          htmlContent: emailContent.html
        });
        return result;
      }
    } catch (error) {
      console.error('Error sending email invite:', error);
      throw error;
    }
  }

  async sendSMSInvite({ to, type, inviterName, groupName, groupId, amount, message }) {
    try {
      // Get current user for auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Format phone number
      const formattedPhone = SMSService.formatPhoneNumber(to);
      
      // Generate invite link
      const inviteLink = await this.generateInviteLink({ type, groupId, amount });
      
      switch (type) {
        case 'group':
          if (!groupName) throw new Error('Group name required for group invites');
          await SMSService.sendGroupInviteSMS({
            inviteePhone: formattedPhone,
            inviterName,
            groupName,
            inviteLink
          });
          break;
          
        case 'money':
          // For money invites, create a custom message
          const moneyMessage = `Bankroll: ${inviterName} sent you $${amount}! ${message ? `"${message.substring(0, 40)}"` : ''} Claim: ${inviteLink}`;
          await SMSService.sendSMS(formattedPhone, moneyMessage);
          break;
          
        case 'freebet':
          const freebetMessage = `Bankroll: ${inviterName} sent you a $${amount} free bet! ${message ? `"${message.substring(0, 30)}"` : ''} Claim: ${inviteLink}`;
          await SMSService.sendSMS(formattedPhone, freebetMessage);
          break;
          
        default:
          const defaultMessage = `Bankroll: ${inviterName} invited you! Join: ${inviteLink}`;
          await SMSService.sendSMS(formattedPhone, defaultMessage);
      }
      
      return { success: true, inviteLink };
    } catch (error) {
      console.error('Error sending SMS invite:', error);
      throw error;
    }
  }

  async generateInviteLink({ type, groupId, amount }) {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams();
    
    if (type) params.append('type', type);
    if (groupId) params.append('group', groupId);
    if (amount) params.append('amount', amount);
    
    // Generate a unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    params.append('code', inviteCode);
    
    // Store invite code in database for validation
    const { error } = await supabase
      .from('invite_codes')
      .insert({
        code: inviteCode,
        type: type,
        group_id: groupId,
        amount: amount,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });
    
    if (error) console.error('Error storing invite code:', error);
    
    return `${baseUrl}/invite/${inviteCode}`;
  }

  generateInviteMessage({ type, inviterName, groupName, amount }) {
    const baseUrl = getBaseUrl();
    
    switch (type) {
      case 'group':
        return `${inviterName} invited you to join ${groupName} on Bankroll! Join here: ${baseUrl}/invite?type=group`;
      case 'money':
        return `${inviterName} sent you $${amount} on Bankroll! Claim it here: ${baseUrl}/invite?type=money`;
      case 'freebet':
        return `${inviterName} sent you a $${amount} free bet on Bankroll! Claim it here: ${baseUrl}/invite?type=freebet`;
      case 'gift':
        return `${inviterName} sent you a gift on Bankroll! Open it here: ${baseUrl}/invite?type=gift`;
      default:
        return `You're invited to Bankroll! Join here: ${baseUrl}`;
    }
  }

  generateEmailContent({ type, inviterName, amount, message }) {
    const baseUrl = 'https://bankroll.live';
    let subject = '';
    let html = '';

    switch (type) {
      case 'money':
        subject = `${inviterName} sent you $${amount} on Bankroll`;
        html = `
          <h2>💵 You've received money!</h2>
          <p>${inviterName} sent you <strong>$${amount}</strong> on Bankroll.</p>
          ${message ? `<p><em>"${message}"</em></p>` : ''}
          <a href="${baseUrl}/invite?type=money&amount=${amount}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px;">
            Claim Your Money
          </a>
        `;
        break;
      case 'freebet':
        subject = `${inviterName} sent you a free bet on Bankroll`;
        html = `
          <h2>🎟️ You've received a free bet!</h2>
          <p>${inviterName} sent you a <strong>$${amount} free bet</strong> on Bankroll.</p>
          ${message ? `<p><em>"${message}"</em></p>` : ''}
          <a href="${baseUrl}/invite?type=freebet&amount=${amount}" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px;">
            Claim Free Bet
          </a>
        `;
        break;
      case 'gift':
        subject = `${inviterName} sent you a gift on Bankroll`;
        html = `
          <h2>🎁 You've received a gift!</h2>
          <p>${inviterName} sent you a gift on Bankroll.</p>
          ${message ? `<p><em>"${message}"</em></p>` : ''}
          <a href="${baseUrl}/invite?type=gift" style="display: inline-block; padding: 12px 24px; background: #ec4899; color: white; text-decoration: none; border-radius: 8px;">
            Open Your Gift
          </a>
        `;
        break;
      default:
        subject = `${inviterName} invited you to Bankroll`;
        html = `
          <h2>You're invited to Bankroll!</h2>
          <p>${inviterName} wants you to join them on Bankroll.</p>
          ${message ? `<p><em>"${message}"</em></p>` : ''}
          <a href="${baseUrl}" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px;">
            Join Bankroll
          </a>
        `;
    }

    return { subject, html };
  }
}

export default new InviteService();