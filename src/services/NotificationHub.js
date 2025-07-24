import { getFirestore, collection, addDoc, doc, setDoc, getDoc, updateDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from './firebase/config';
import { notificationsService } from './firebase/NotificationsService';

class NotificationHub {
  constructor() {
    this.db = getFirestore(app);
    this.baseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL || 'https://us-central1-bankroll-2ccb4.cloudfunctions.net';
  }

  /**
   * Send a unified notification through multiple channels
   * @param {string} userId - Target user ID
   * @param {Object} notification - Notification data
   * @param {Array} channels - Channels to send through ['sms', 'email', 'push']
   * @param {Object} options - Additional options
   */
  async sendNotification(userId, notification, channels = ['push'], options = {}) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to send notifications');
      }

      // Get user preferences
      const userPrefs = await this.getUserNotificationPreferences(userId);
      
      // Filter channels based on user preferences
      const enabledChannels = channels.filter(channel => {
        switch (channel) {
          case 'sms':
            return userPrefs.sms && userPrefs.phone;
          case 'email':
            return userPrefs.email && userPrefs.emailAddress;
          case 'push':
            return userPrefs.inApp && userPrefs.pushToken;
          default:
            return false;
        }
      });

      if (enabledChannels.length === 0) {
        throw new Error('No enabled notification channels for this user');
      }

      const results = {};
      const idToken = await user.getIdToken(true);

      // Send through each enabled channel
      for (const channel of enabledChannels) {
        try {
          switch (channel) {
            case 'sms':
              results.sms = await this.sendSMS(userId, notification, idToken);
              break;
            case 'email':
              results.email = await this.sendEmail(userId, notification, idToken);
              break;
            case 'push':
              results.push = await this.sendPushNotification(userId, notification, idToken);
              break;
          }
        } catch (channelError) {
          console.error(`Failed to send ${channel} notification:`, channelError);
          results[channel] = { success: false, error: channelError.message };
        }
      }

      // Store notification record
      await this.storeNotificationRecord(userId, {
        ...notification,
        channels: enabledChannels,
        results,
        timestamp: new Date(),
        senderId: user.uid
      });

      return { success: true, channels: enabledChannels, results };
    } catch (error) {
      console.error('Error sending unified notification:', error);
      throw error;
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(userId, notification, idToken) {
    const response = await fetch(`${this.baseUrl}/sendSMS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        userId,
        message: notification.body || notification.message,
        type: notification.type || 'general'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send SMS');
    }

    return await response.json();
  }

  /**
   * Send email notification
   */
  async sendEmail(userId, notification, idToken) {
    const response = await fetch(`${this.baseUrl}/sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        userId,
        emailType: notification.type || 'general',
        templateName: notification.templateName || 'general',
        templateData: {
          subject: notification.title || 'Notification from Bankroll',
          message: notification.body || notification.message,
          ...notification.templateData
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }

    return await response.json();
  }

  /**
   * Send push notification
   */
  async sendPushNotification(userId, notification, idToken) {
    return await notificationsService.sendNotification(userId, {
      title: notification.title,
      body: notification.body || notification.message,
      data: notification.data || {}
    });
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationPreferences(userId) {
    try {
      const prefsDoc = await getDoc(doc(this.db, 'userPreferences', userId));
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      
      if (!prefsDoc.exists() || !userDoc.exists()) {
        return {
          inApp: true,
          sms: false,
          email: false,
          pushToken: null,
          phone: null,
          emailAddress: null
        };
      }

      const prefs = prefsDoc.data().notifications || {};
      const userData = userDoc.data();

      return {
        ...prefs,
        phone: userData.phone,
        emailAddress: userData.email
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update user notification preferences
   */
  async updateNotificationPreferences(userId, preferences) {
    try {
      await setDoc(doc(this.db, 'userPreferences', userId), {
        notifications: preferences
      }, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Store notification record for tracking
   */
  async storeNotificationRecord(userId, notificationData) {
    try {
      await addDoc(collection(this.db, 'notificationHistory'), {
        userId,
        ...notificationData
      });
    } catch (error) {
      console.error('Error storing notification record:', error);
      // Don't throw - this is just for tracking
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotification(userIds, notification, channels = ['push'], options = {}) {
    const results = {};
    
    for (const userId of userIds) {
      try {
        results[userId] = await this.sendNotification(userId, notification, channels, options);
      } catch (error) {
        results[userId] = { success: false, error: error.message };
      }
    }

    return results;
  }

  /**
   * Test notification delivery for a user
   */
  async testNotification(userId, channel = 'push') {
    const testNotification = {
      title: 'Test Notification',
      body: 'This is a test notification from Bankroll',
      type: 'test'
    };

    return await this.sendNotification(userId, testNotification, [channel]);
  }

  /**
   * Send email directly (for admin panel)
   */
  async sendEmail(email, subject, message) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to send emails');
      }

      const idToken = await user.getIdToken(true);
      
      const response = await fetch(`${this.baseUrl}/sendAdminEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          to: email,
          subject,
          body: message,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>${subject}</h2>
            <p>${message}</p>
            <hr />
            <p style="color: #666; font-size: 12px;">Sent from Bankroll Admin Panel</p>
          </div>`
        })
      });

      if (!response.ok) {
        throw new Error(`Email sending failed: ${response.statusText}`);
      }

      return { success: true, channel: 'email', recipient: email };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS directly (for admin panel)
   */
  async sendSMS(phoneNumber, message) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to send SMS');
      }

      const idToken = await user.getIdToken(true);
      
      const response = await fetch(`${this.baseUrl}/sendAdminSMS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          to: phoneNumber,
          message
        })
      });

      if (!response.ok) {
        throw new Error(`SMS sending failed: ${response.statusText}`);
      }

      return { success: true, channel: 'sms', recipient: phoneNumber };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification directly (for admin panel)
   */
  async sendPushNotification(userId, title, body) {
    try {
      // Use the existing Firebase notification service
      await notificationsService.createNotification({
        userId,
        title,
        body,
        type: 'admin',
        actionUrl: null,
        metadata: { sentFromAdmin: true }
      });

      return { success: true, channel: 'push', recipient: userId };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(userId, limit = 50) {
    try {
      const snapshot = await getDocs(
        query(
          collection(this.db, 'notificationHistory'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(limit)
        )
      );

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting notification history:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const notificationHub = new NotificationHub();
export default NotificationHub; 