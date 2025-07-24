import { createClient } from '@supabase/supabase-js';

class SupabaseNotificationService {
  constructor() {
    // Check if Supabase credentials are available
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
    
    // Only initialize if we have the required credentials
    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.isInitialized = true;
      } catch (error) {
        console.warn('Failed to initialize Supabase client:', error);
        this.isInitialized = false;
      }
    } else {
      console.warn('Supabase credentials not found. Notification service will run in limited mode.');
      this.isInitialized = false;
    }
  }

  // Helper method to check if service is available
  _checkInitialized() {
    if (!this.isInitialized) {
      throw new Error('Supabase notification service is not available. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_KEY.');
    }
  }

  // Get the admin user profile
  async getAdminProfile() {
    try {
      this._checkInitialized();
      
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('admin_users')
        .select(`
          id,
          admin_roles:role_id(
            id,
            name,
            permissions
          ),
          is_active,
          last_login_at
        `)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Not an admin user');
      
      return {
        id: data.id,
        userId: user.id,
        role: data.admin_roles,
        isActive: data.is_active,
        lastLoginAt: data.last_login_at
      };
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats() {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase
        .from('admin_notification_stats')
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  // Get user notification settings
  async getUserNotificationStats() {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase
        .from('admin_user_notification_stats')
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user notification stats:', error);
      throw error;
    }
  }

  // Get all templates
  async getNotificationTemplates() {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      throw error;
    }
  }

  // Create a notification template
  async createNotificationTemplate(template) {
    try {
      this._checkInitialized();
      
      const adminProfile = await this.getAdminProfile();
      
      const { data, error } = await this.supabase.rpc(
        'admin_create_notification_template',
        {
          p_name: template.name,
          p_description: template.description,
          p_type: template.type,
          p_title_template: template.title_template,
          p_message_template: template.message_template,
          p_action_url_template: template.action_url_template,
          p_metadata_template: template.metadata_template || {},
          p_admin_user_id: adminProfile.id
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification template:', error);
      throw error;
    }
  }

  // Update a notification template
  async updateNotificationTemplate(id, template) {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase
        .from('notification_templates')
        .update({
          name: template.name,
          description: template.description,
          type: template.type,
          title_template: template.title_template,
          message_template: template.message_template,
          action_url_template: template.action_url_template,
          metadata_template: template.metadata_template || {},
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating notification template:', error);
      throw error;
    }
  }

  // Delete a notification template
  async deleteNotificationTemplate(id) {
    try {
      this._checkInitialized();
      
      const { error } = await this.supabase
        .from('notification_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification template:', error);
      throw error;
    }
  }

  // Get all user segments
  async getUserSegments() {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase
        .from('user_segments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user segments:', error);
      throw error;
    }
  }

  // Create a user segment
  async createUserSegment(segment) {
    try {
      this._checkInitialized();
      
      const adminProfile = await this.getAdminProfile();
      
      const { data, error } = await this.supabase.rpc(
        'admin_create_user_segment',
        {
          p_name: segment.name,
          p_description: segment.description,
          p_filter_query: segment.filter_query,
          p_admin_user_id: adminProfile.id
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user segment:', error);
      throw error;
    }
  }

  // Update a user segment
  async updateUserSegment(id, segment) {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase
        .from('user_segments')
        .update({
          name: segment.name,
          description: segment.description,
          filter_query: segment.filter_query,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user segment:', error);
      throw error;
    }
  }

  // Delete a user segment
  async deleteUserSegment(id) {
    try {
      this._checkInitialized();
      
      const { error } = await this.supabase
        .from('user_segments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user segment:', error);
      throw error;
    }
  }

  // Get all notification campaigns
  async getNotificationCampaigns() {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase
        .from('notification_campaigns')
        .select(`
          *,
          template:template_id(name, type),
          segment:segment_id(name),
          admin:created_by(id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification campaigns:', error);
      throw error;
    }
  }

  // Create a notification campaign
  async createNotificationCampaign(campaign) {
    try {
      this._checkInitialized();
      
      const adminProfile = await this.getAdminProfile();
      
      const { data, error } = await this.supabase.rpc(
        'admin_create_notification_campaign',
        {
          p_name: campaign.name,
          p_description: campaign.description,
          p_template_id: campaign.template_id,
          p_segment_id: campaign.segment_id,
          p_specific_users: campaign.specific_users,
          p_schedule_time: campaign.schedule_time,
          p_send_immediately: campaign.send_immediately,
          p_admin_user_id: adminProfile.id
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification campaign:', error);
      throw error;
    }
  }

  // Send a notification campaign now
  async sendNotificationCampaign(campaignId) {
    try {
      this._checkInitialized();
      
      const adminProfile = await this.getAdminProfile();
      
      const { data, error } = await this.supabase.rpc(
        'admin_send_notification_campaign',
        {
          p_campaign_id: campaignId,
          p_admin_user_id: adminProfile.id
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending notification campaign:', error);
      throw error;
    }
  }

  // Get all notification triggers
  async getNotificationTriggers() {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase
        .from('notification_triggers')
        .select(`
          *,
          template:template_id(name, type),
          admin:created_by(id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification triggers:', error);
      throw error;
    }
  }

  // Create a notification trigger
  async createNotificationTrigger(trigger) {
    try {
      this._checkInitialized();
      
      const adminProfile = await this.getAdminProfile();
      
      const { data, error } = await this.supabase.rpc(
        'admin_create_notification_trigger',
        {
          p_name: trigger.name,
          p_description: trigger.description,
          p_event_type: trigger.event_type,
          p_template_id: trigger.template_id,
          p_conditions: trigger.conditions,
          p_is_active: trigger.is_active,
          p_admin_user_id: adminProfile.id
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification trigger:', error);
      throw error;
    }
  }

  // Update a notification trigger
  async updateNotificationTrigger(id, trigger) {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase
        .from('notification_triggers')
        .update({
          name: trigger.name,
          description: trigger.description,
          event_type: trigger.event_type,
          template_id: trigger.template_id,
          conditions: trigger.conditions,
          is_active: trigger.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating notification trigger:', error);
      throw error;
    }
  }

  // Delete a notification trigger
  async deleteNotificationTrigger(id) {
    try {
      this._checkInitialized();
      
      const { error } = await this.supabase
        .from('notification_triggers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification trigger:', error);
      throw error;
    }
  }

  // Get notification delivery stats
  async getNotificationDeliveryStats(campaignId) {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase
        .from('notification_deliveries')
        .select('*')
        .eq('campaign_id', campaignId);

      if (error) throw error;
      
      // Calculate stats
      const total = data.length;
      const delivered = data.filter(d => d.delivery_status === 'delivered').length;
      const failed = data.filter(d => d.delivery_status === 'failed').length;
      const opened = data.filter(d => d.opened_at !== null).length;
      const clicked = data.filter(d => d.clicked_at !== null).length;
      
      return {
        total,
        delivered,
        failed,
        opened,
        clicked,
        deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
        openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
        clickRate: opened > 0 ? (clicked / opened) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching notification delivery stats:', error);
      throw error;
    }
  }

  // Get all users
  async getAllUsers() {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase
        .from('admin_user_notification_stats')
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Send direct notification to specific user
  async sendDirectNotification(userId, notification) {
    try {
      this._checkInitialized();
      
      const { data, error } = await this.supabase.rpc(
        'create_notification',
        {
          p_user_id: userId,
          p_title: notification.title,
          p_message: notification.message,
          p_type: notification.type || 'system',
          p_action_url: notification.action_url || null,
          p_metadata: notification.metadata || {}
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending direct notification:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const supabaseNotificationService = new SupabaseNotificationService();
export default supabaseNotificationService; 