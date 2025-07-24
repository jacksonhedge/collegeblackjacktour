import { supabase } from './supabase/config';

class SMSService {
  /**
   * Send SMS via Supabase Edge Function
   */
  async sendSMS(to, message) {
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to,
          message
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * Send group invite declined SMS notification
   */
  async sendInviteDeclinedSMS({
    inviterPhone,
    inviteeName,
    groupName
  }) {
    const message = `Bankroll: ${inviteeName} declined your invitation to join "${groupName}". You can invite other friends to grow your group!`;
    
    return this.sendSMS(inviterPhone, message);
  }

  /**
   * Send group invite accepted SMS notification
   */
  async sendInviteAcceptedSMS({
    inviterPhone,
    inviteeName,
    groupName
  }) {
    const message = `Bankroll: Great news! ${inviteeName} just joined your group "${groupName}". Welcome them to the team! 🎉`;
    
    return this.sendSMS(inviterPhone, message);
  }

  /**
   * Send money sent SMS notification
   */
  async sendMoneySentSMS({
    senderPhone,
    recipientName,
    amount,
    note
  }) {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
    
    let message = `Bankroll: You sent ${formattedAmount} to ${recipientName}.`;
    if (note) {
      message += ` Note: "${note.substring(0, 50)}${note.length > 50 ? '...' : ''}"`;
    }
    
    return this.sendSMS(senderPhone, message);
  }

  /**
   * Send money received SMS notification
   */
  async sendMoneyReceivedSMS({
    recipientPhone,
    senderName,
    amount,
    note
  }) {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
    
    let message = `Bankroll: ${senderName} sent you ${formattedAmount}!`;
    if (note) {
      message += ` "${note.substring(0, 50)}${note.length > 50 ? '...' : ''}"`;
    }
    
    return this.sendSMS(recipientPhone, message);
  }

  /**
   * Send money request SMS notification
   */
  async sendMoneyRequestSMS({
    requestedPhone,
    requesterName,
    amount,
    note
  }) {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
    
    let message = `Bankroll: ${requesterName} requested ${formattedAmount} from you.`;
    if (note) {
      message += ` "${note.substring(0, 40)}${note.length > 40 ? '...' : ''}"`;
    }
    message += ' Open app to respond.';
    
    return this.sendSMS(requestedPhone, message);
  }

  /**
   * Send group invite SMS
   */
  async sendGroupInviteSMS({
    inviteePhone,
    inviterName,
    groupName,
    inviteLink
  }) {
    const message = `Bankroll: ${inviterName} invited you to join "${groupName}". Join now: ${inviteLink}`;
    
    return this.sendSMS(inviteePhone, message);
  }

  /**
   * Send bulk SMS notifications
   */
  async sendBulkSMS(recipients, message) {
    const promises = recipients.map(phone => 
      this.sendSMS(phone, message).catch(err => ({
        phone,
        error: err.message,
        success: false
      }))
    );

    const results = await Promise.all(promises);
    return {
      sent: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error),
      total: recipients.length
    };
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phone) {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Add US country code if not present
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    // Return as-is if already has country code
    return phone.startsWith('+') ? phone : `+${phone}`;
  }

  /**
   * Check if user has SMS notifications enabled
   */
  async isUserSMSEnabled(userId) {
    try {
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('sms_enabled, phone_number')
        .eq('user_id', userId)
        .single();

      return prefs?.sms_enabled && prefs?.phone_number;
    } catch (error) {
      console.error('Error checking SMS preferences:', error);
      return false;
    }
  }

  /**
   * Get user's phone number
   */
  async getUserPhone(userId) {
    try {
      // First check notification preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('phone_number')
        .eq('user_id', userId)
        .single();

      if (prefs?.phone_number) {
        return this.formatPhoneNumber(prefs.phone_number);
      }

      // Fallback to users table
      const { data: user } = await supabase
        .from('users')
        .select('phone_number')
        .eq('id', userId)
        .single();

      return user?.phone_number ? this.formatPhoneNumber(user.phone_number) : null;
    } catch (error) {
      console.error('Error getting user phone:', error);
      return null;
    }
  }
}

export default new SMSService();