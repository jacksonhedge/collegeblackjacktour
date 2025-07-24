import { supabase } from './supabase/config';
import EmailService from './EmailService';
import SMSService from './SMSService';
import { notificationService } from './supabase/NotificationService';

class MoneyTransferService {
  /**
   * Send money from one user to another with multi-channel notifications
   */
  async sendMoney({
    senderId,
    recipientId,
    amount,
    note = '',
    notifyEmail = true,
    notifySMS = true,
    notifyInApp = true
  }) {
    try {
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      // Start transaction
      const { data: { user: sender } } = await supabase.auth.getUser();
      if (!sender || sender.id !== senderId) {
        throw new Error('Unauthorized');
      }

      // Get sender and recipient details
      const [senderData, recipientData] = await Promise.all([
        this.getUserDetails(senderId),
        this.getUserDetails(recipientId)
      ]);

      if (!recipientData) {
        throw new Error('Recipient not found');
      }

      // Check sender balance
      if (senderData.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction record
      const transaction = {
        id: this.generateTransactionId(),
        sender_id: senderId,
        recipient_id: recipientId,
        amount: amount,
        note: note,
        type: 'transfer',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Store transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert(transaction);

      if (txError) throw txError;

      // Update balances
      const [senderUpdate, recipientUpdate] = await Promise.all([
        supabase
          .from('users')
          .update({ balance: senderData.balance - amount })
          .eq('id', senderId),
        supabase
          .from('users')
          .update({ balance: recipientData.balance + amount })
          .eq('id', recipientId)
      ]);

      if (senderUpdate.error || recipientUpdate.error) {
        // Rollback transaction
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', transaction.id);
        throw new Error('Failed to update balances');
      }

      // Update transaction status
      await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id);

      // Send notifications
      await this.sendTransferNotifications({
        transaction,
        senderData,
        recipientData,
        notifyEmail,
        notifySMS,
        notifyInApp
      });

      return {
        success: true,
        transactionId: transaction.id,
        amount: amount,
        recipientName: recipientData.display_name || recipientData.email
      };

    } catch (error) {
      console.error('Error sending money:', error);
      throw error;
    }
  }

  /**
   * Request money from another user
   */
  async requestMoney({
    requesterId,
    requestedUserId,
    amount,
    note = '',
    notifyEmail = true,
    notifySMS = true,
    notifyInApp = true
  }) {
    try {
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      // Get user details
      const [requesterData, requestedData] = await Promise.all([
        this.getUserDetails(requesterId),
        this.getUserDetails(requestedUserId)
      ]);

      if (!requestedData) {
        throw new Error('User not found');
      }

      // Create money request record
      const request = {
        id: this.generateRequestId(),
        requester_id: requesterId,
        requested_user_id: requestedUserId,
        amount: amount,
        note: note,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Store request
      const { error } = await supabase
        .from('money_requests')
        .insert(request);

      if (error) throw error;

      // Send notifications
      await this.sendRequestNotifications({
        request,
        requesterData,
        requestedData,
        notifyEmail,
        notifySMS,
        notifyInApp
      });

      return {
        success: true,
        requestId: request.id,
        amount: amount,
        requestedUserName: requestedData.display_name || requestedData.email
      };

    } catch (error) {
      console.error('Error requesting money:', error);
      throw error;
    }
  }

  /**
   * Send transfer notifications through multiple channels
   */
  async sendTransferNotifications({
    transaction,
    senderData,
    recipientData,
    notifyEmail,
    notifySMS,
    notifyInApp
  }) {
    const promises = [];

    // Format names
    const senderName = senderData.display_name || senderData.email?.split('@')[0] || 'Someone';
    const recipientName = recipientData.display_name || recipientData.email?.split('@')[0] || 'Someone';

    // Email notifications
    if (notifyEmail) {
      // Email to sender
      if (senderData.email) {
        promises.push(
          EmailService.sendTransactionEmail({
            to: senderData.email,
            type: 'sent',
            amount: transaction.amount,
            recipientName: recipientName,
            note: transaction.note,
            transactionId: transaction.id,
            balance: senderData.balance - transaction.amount
          }).catch(err => console.error('Failed to send sender email:', err))
        );
      }

      // Email to recipient
      if (recipientData.email) {
        promises.push(
          EmailService.sendTransactionEmail({
            to: recipientData.email,
            type: 'received',
            amount: transaction.amount,
            senderName: senderName,
            note: transaction.note,
            transactionId: transaction.id,
            balance: recipientData.balance + transaction.amount
          }).catch(err => console.error('Failed to send recipient email:', err))
        );
      }
    }

    // SMS notifications
    if (notifySMS) {
      // SMS to sender
      const senderPhone = await SMSService.getUserPhone(senderData.id);
      if (senderPhone && await SMSService.isUserSMSEnabled(senderData.id)) {
        promises.push(
          SMSService.sendMoneySentSMS({
            senderPhone: senderPhone,
            recipientName: recipientName,
            amount: transaction.amount,
            note: transaction.note
          }).catch(err => console.error('Failed to send sender SMS:', err))
        );
      }

      // SMS to recipient
      const recipientPhone = await SMSService.getUserPhone(recipientData.id);
      if (recipientPhone && await SMSService.isUserSMSEnabled(recipientData.id)) {
        promises.push(
          SMSService.sendMoneyReceivedSMS({
            recipientPhone: recipientPhone,
            senderName: senderName,
            amount: transaction.amount,
            note: transaction.note
          }).catch(err => console.error('Failed to send recipient SMS:', err))
        );
      }
    }

    // In-app notifications
    if (notifyInApp) {
      // Notification to sender
      promises.push(
        notificationService.sendNotification(
          senderData.id,
          'money_sent',
          {
            recipientName: recipientName,
            amount: transaction.amount.toFixed(2)
          },
          {
            type: 'transaction',
            action_url: `/transactions/${transaction.id}`,
            metadata: {
              transactionId: transaction.id,
              amount: transaction.amount
            }
          }
        ).catch(err => console.error('Failed to send sender notification:', err))
      );

      // Notification to recipient
      promises.push(
        notificationService.sendNotification(
          recipientData.id,
          'money_received',
          {
            senderName: senderName,
            amount: transaction.amount.toFixed(2)
          },
          {
            type: 'transaction',
            action_url: `/transactions/${transaction.id}`,
            metadata: {
              transactionId: transaction.id,
              amount: transaction.amount
            }
          }
        ).catch(err => console.error('Failed to send recipient notification:', err))
      );
    }

    await Promise.all(promises);
  }

  /**
   * Send request notifications through multiple channels
   */
  async sendRequestNotifications({
    request,
    requesterData,
    requestedData,
    notifyEmail,
    notifySMS,
    notifyInApp
  }) {
    const promises = [];

    // Format names
    const requesterName = requesterData.display_name || requesterData.email?.split('@')[0] || 'Someone';
    const requestedName = requestedData.display_name || requestedData.email?.split('@')[0] || 'Someone';

    // Email notification to requested user
    if (notifyEmail && requestedData.email) {
      promises.push(
        EmailService.sendTransactionEmail({
          to: requestedData.email,
          type: 'request',
          amount: request.amount,
          requesterName: requesterName,
          note: request.note,
          requestId: request.id
        }).catch(err => console.error('Failed to send request email:', err))
      );
    }

    // SMS notification to requested user
    if (notifySMS) {
      const requestedPhone = await SMSService.getUserPhone(requestedData.id);
      if (requestedPhone && await SMSService.isUserSMSEnabled(requestedData.id)) {
        promises.push(
          SMSService.sendMoneyRequestSMS({
            requestedPhone: requestedPhone,
            requesterName: requesterName,
            amount: request.amount,
            note: request.note
          }).catch(err => console.error('Failed to send request SMS:', err))
        );
      }
    }

    // In-app notification to requested user
    if (notifyInApp) {
      promises.push(
        notificationService.sendNotification(
          requestedData.id,
          'money_request',
          {
            requesterName: requesterName,
            amount: request.amount.toFixed(2)
          },
          {
            type: 'request',
            action_url: `/requests/${request.id}`,
            metadata: {
              requestId: request.id,
              amount: request.amount
            }
          }
        ).catch(err => console.error('Failed to send request notification:', err))
      );
    }

    await Promise.all(promises);
  }

  /**
   * Get user details including balance
   */
  async getUserDetails(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, display_name, phone_number, balance')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user details:', error);
      return null;
    }
  }

  /**
   * Generate unique transaction ID
   */
  generateTransactionId() {
    return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  /**
   * Get user's notification preferences
   */
  async getUserNotificationPreferences(userId) {
    try {
      const { data } = await supabase
        .from('notification_preferences')
        .select('email_enabled, sms_enabled, in_app_enabled')
        .eq('user_id', userId)
        .single();

      return data || {
        email_enabled: true,
        sms_enabled: false,
        in_app_enabled: true
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        email_enabled: true,
        sms_enabled: false,
        in_app_enabled: true
      };
    }
  }
}

export default new MoneyTransferService();