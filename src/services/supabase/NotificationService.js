import { supabase } from './client';
import { pushNotificationService } from '../PushNotificationService';

class NotificationService {
  /**
   * Send a notification to a user
   * @param {string} userId - The user ID to send to
   * @param {string} templateName - The notification template name
   * @param {Object} data - Template variables
   * @param {Object} options - Additional options (channels, scheduling, etc.)
   */
  async sendNotification(userId, templateName, data = {}, options = {}) {
    try {
      // Get the template if it exists
      const { data: template } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('name', templateName)
        .single();

      // Process the template or use defaults
      let title = template?.title || templateName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      let message = template?.body || '';
      
      // Replace template variables
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        title = title.replace(regex, value);
        message = message.replace(regex, value);
      });

      // Create a simplified notification
      const notification = {
        user_id: userId,
        title,
        message,
        type: template?.type || options.type || 'system',
        action_url: options.action_url || null,
        metadata: {
          template_name: templateName,
          ...data,
          ...(options.metadata || {})
        }
      };

      const { data: createdNotification, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;

      // If this is an important notification, also send push
      if (template?.priority && template.priority <= 2) {
        this.sendPushNotification(userId, title, message, { notificationId: createdNotification.id });
      }

      return createdNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send a notification to multiple users
   */
  async sendBulkNotification(userIds, templateName, data = {}, options = {}) {
    const promises = userIds.map(userId => 
      this.sendNotification(userId, templateName, { ...data }, options)
    );
    return Promise.allSettled(promises);
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId, channelOrOptions = 'in_app', limitOrUndefined) {
    try {
      // Handle both old and new calling conventions
      let options = {};
      if (typeof channelOrOptions === 'object') {
        options = channelOrOptions;
      } else {
        // Legacy support for (userId, channel, limit) signature
        options.limit = limitOrUndefined;
      }

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      // Update notification to is_read = true
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId, channel = 'in_app') {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(userId, preferences) {
    try {
      // Map UI preferences back to database format
      const dbPreferences = {
        user_id: userId,
        email: preferences.email_enabled ?? preferences.email ?? true,
        sms: preferences.sms_enabled ?? preferences.sms ?? false,
        in_app: preferences.in_app_enabled ?? preferences.in_app ?? true,
        push_token: preferences.push_token || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert(dbPreferences)
        .select()
        .single();

      if (error) throw error;
      
      // Return mapped UI format
      return this.mapPreferencesToUI(data);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No preferences found, create default
        return this.createDefaultPreferences(userId);
      }

      if (error) throw error;
      
      // Map simple structure to expected UI structure
      return this.mapPreferencesToUI(data);
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw error;
    }
  }

  /**
   * Map database preferences to UI format
   */
  mapPreferencesToUI(dbPrefs) {
    if (!dbPrefs) return null;
    
    return {
      ...dbPrefs,
      // Map simple fields to UI expected fields
      email_enabled: dbPrefs.email,
      push_enabled: !!dbPrefs.push_token,
      sms_enabled: dbPrefs.sms,
      in_app_enabled: dbPrefs.in_app,
      
      // Add category-specific preferences (all default to the main channel setting)
      transactions_email: dbPrefs.email,
      transactions_push: !!dbPrefs.push_token,
      transactions_in_app: dbPrefs.in_app,
      social_email: dbPrefs.email,
      social_push: !!dbPrefs.push_token,
      social_in_app: dbPrefs.in_app,
      rewards_email: dbPrefs.email,
      rewards_push: !!dbPrefs.push_token,
      rewards_in_app: dbPrefs.in_app,
      marketing_email: dbPrefs.email,
      marketing_push: false,
      security_email: true,
      security_sms: dbPrefs.sms,
      
      // Default quiet hours settings
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  /**
   * Create default preferences for a user
   */
  async createDefaultPreferences(userId) {
    const defaultPreferences = {
      user_id: userId,
      in_app: true,
      email: true,
      sms: false,
      push_token: null
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      .insert(defaultPreferences)
      .select()
      .single();

    if (error) throw error;
    
    // Return mapped UI format
    return this.mapPreferencesToUI(data);
  }

  /**
   * Send notification when group invitation is declined
   */
  async notifyInviteDeclined(inviterId, inviteeName, groupName, groupId) {
    try {
      await this.sendNotification(
        inviterId,
        'group_invite_declined',
        {
          inviteeName,
          groupName
        },
        {
          type: 'social',
          action_url: `/groups/${groupId}/invite`,
          metadata: {
            groupId,
            action: 'invite_declined'
          }
        }
      );
    } catch (error) {
      console.error('Error sending invite declined notification:', error);
    }
  }

  /**
   * Send notification when group invitation is accepted
   */
  async notifyInviteAccepted(inviterId, inviteeName, groupName, groupId) {
    try {
      await this.sendNotification(
        inviterId,
        'group_invite_accepted',
        {
          inviteeName,
          groupName
        },
        {
          type: 'social',
          action_url: `/groups/${groupId}`,
          metadata: {
            groupId,
            action: 'invite_accepted'
          }
        }
      );
    } catch (error) {
      console.error('Error sending invite accepted notification:', error);
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(userId, callback) {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * Helper: Determine which channels to use based on template and preferences
   */
  determineChannels(template, preferences, options) {
    if (options.channels) {
      return options.channels;
    }

    const channels = [];

    // Always add in-app notifications
    if (preferences?.in_app !== false) {
      channels.push('in_app');
    }

    // Add email if enabled
    if (preferences?.email && template?.type === 'email') {
      channels.push('email');
    }

    // Add SMS for security notifications
    if (preferences?.sms && template?.category === 'security') {
      channels.push('sms');
    }

    // Add push if token exists
    if (preferences?.push_token) {
      channels.push('push');
    }

    return channels.length > 0 ? channels : ['in_app']; // Default to in-app
  }

  /**
   * Trigger edge function to process pending notifications
   */
  async triggerNotificationProcessing() {
    try {
      const { data, error } = await supabase.functions.invoke('process-notifications');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error triggering notification processing:', error);
    }
  }

  /**
   * Send push notification to user
   */
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      // Check if user has push enabled
      const preferences = await this.getPreferences(userId);
      if (!preferences?.push_token) {
        console.log('No push token found for user');
        return false;
      }

      // Send via edge function
      const { data: result, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          title,
          body,
          data,
          tag: `bankroll-${Date.now()}`,
          requireInteraction: data.requireInteraction || false
        }
      });

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Initialize push notifications for current user
   */
  async initializePushNotifications(userId) {
    try {
      // Initialize service
      const initialized = await pushNotificationService.init();
      if (!initialized) return false;

      // Check if already subscribed
      const isSubscribed = await pushNotificationService.isSubscribed();
      if (isSubscribed) return true;

      // Check user preferences
      const preferences = await this.getPreferences(userId);
      if (preferences?.push_token) {
        // User already has a push token
        return true;
      }
      
      // Try to subscribe silently if permission was previously granted
      const permission = pushNotificationService.getPermissionStatus();
      if (permission === 'granted') {
        try {
          await pushNotificationService.requestPermission(userId);
          return true;
        } catch (error) {
          console.error('Failed to auto-subscribe:', error);
        }
      }

      return false;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  /**
   * Common notification triggers
   */
  async notifyMoneyReceived(recipientId, senderName, senderUsername, amount, newBalance) {
    return this.sendNotification(recipientId, 'money_received', {
      sender_name: senderName,
      sender_username: senderUsername,
      amount: `$${amount.toFixed(2)}`,
      new_balance: `$${newBalance.toFixed(2)}`
    });
  }

  async notifyWithdrawalCompleted(userId, amount, transactionId, destination, estimatedTime) {
    return this.sendNotification(userId, 'withdrawal_completed', {
      amount: `$${amount.toFixed(2)}`,
      transaction_id: transactionId,
      destination,
      estimated_time: estimatedTime
    });
  }

  async notifyDepositSuccessful(userId, amount, newBalance) {
    return this.sendNotification(userId, 'deposit_successful', {
      amount: `$${amount.toFixed(2)}`,
      new_balance: `$${newBalance.toFixed(2)}`
    });
  }

  async notifyGroupInvite(userId, inviterName, groupName, groupDescription, memberCount) {
    return this.sendNotification(userId, 'group_invite', {
      inviter_name: inviterName,
      group_name: groupName,
      group_description: groupDescription,
      member_count: memberCount
    });
  }

  async notifyDailySpinAvailable(userId, streakDays, maxReward, streakBonus) {
    return this.sendNotification(userId, 'daily_spin_available', {
      streak_days: streakDays,
      max_reward: maxReward.toFixed(2),
      streak_bonus: streakBonus
    });
  }

  async notifyRewardWon(userId, amount, rewardSource, bonusBalance) {
    return this.sendNotification(userId, 'reward_won', {
      amount: `$${amount.toFixed(2)}`,
      reward_source: rewardSource,
      bonus_balance: `$${bonusBalance.toFixed(2)}`
    });
  }
}

export const notificationService = new NotificationService();