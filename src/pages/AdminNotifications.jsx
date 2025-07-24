import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Send, 
  Users, 
  Mail, 
  MessageSquare,
  Shield,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Filter,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { notificationService } from '../services/supabase/NotificationService';
import { supabase } from '../services/supabase/client';
import { format } from 'date-fns';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('send');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalPending: 0,
    totalFailed: 0,
    totalUsers: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  // Fetch stats
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get notification stats
      const { data: notifications } = await supabase
        .from('notifications')
        .select('status', { count: 'exact' });

      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const sent = notifications?.filter(n => n.status === 'sent').length || 0;
      const pending = notifications?.filter(n => n.status === 'pending').length || 0;
      const failed = notifications?.filter(n => n.status === 'failed').length || 0;

      setStats({
        totalSent: sent,
        totalPending: pending,
        totalFailed: failed,
        totalUsers: totalUsers || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const tabs = [
    { id: 'send', label: 'Send Notification', icon: <Send className="w-4 h-4" /> },
    { id: 'templates', label: 'Templates', icon: <Mail className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold">Notifications Admin</h1>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalSent}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600/20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalPending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600/20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalFailed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600/20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'send' && <SendNotificationTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
};

// Send Notification Tab Component
const SendNotificationTab = () => {
  const [formData, setFormData] = useState({
    recipient: 'all',
    specificUsers: '',
    template: '',
    customSubject: '',
    customBody: '',
    channels: ['email', 'in_app'],
    scheduledFor: ''
  });
  const [templates, setTemplates] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true)
        .order('category');
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      let userIds = [];
      
      // Determine recipients
      if (formData.recipient === 'all') {
        const { data: users } = await supabase
          .from('users')
          .select('id');
        userIds = users.map(u => u.id);
      } else if (formData.recipient === 'specific') {
        // Parse comma-separated user IDs or emails
        const inputs = formData.specificUsers.split(',').map(s => s.trim());
        
        // Look up users by email if needed
        const { data: users } = await supabase
          .from('users')
          .select('id, email')
          .in('email', inputs);
        
        userIds = users.map(u => u.id);
      }

      // Get template data
      const template = templates.find(t => t.id === formData.template);
      
      if (!template && !formData.customSubject) {
        alert('Please select a template or provide custom content');
        return;
      }

      // Send notifications
      const promises = userIds.map(userId => {
        if (template) {
          // Use template
          return notificationService.sendNotification(
            userId,
            template.name,
            {}, // You can add template variables here
            {
              channels: formData.channels,
              scheduledFor: formData.scheduledFor || undefined
            }
          );
        } else {
          // Custom notification
          return supabase
            .from('notifications')
            .insert(formData.channels.map(channel => ({
              user_id: userId,
              channel,
              status: 'pending',
              data: {
                subject: formData.customSubject,
                body: formData.customBody
              },
              scheduled_for: formData.scheduledFor || new Date().toISOString()
            })));
        }
      });

      await Promise.allSettled(promises);
      
      // Trigger processing for immediate notifications
      if (!formData.scheduledFor) {
        await notificationService.triggerNotificationProcessing();
      }

      alert(`Successfully queued notifications for ${userIds.length} users`);
      
      // Reset form
      setFormData({
        recipient: 'all',
        specificUsers: '',
        template: '',
        customSubject: '',
        customBody: '',
        channels: ['email', 'in_app'],
        scheduledFor: ''
      });
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">Send Notification</h2>
      
      <div className="space-y-6">
        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipients
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="all"
                checked={formData.recipient === 'all'}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="text-purple-600"
              />
              <span>All Users</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="specific"
                checked={formData.recipient === 'specific'}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="text-purple-600"
              />
              <span>Specific Users</span>
            </label>
          </div>
          
          {formData.recipient === 'specific' && (
            <input
              type="text"
              value={formData.specificUsers}
              onChange={(e) => setFormData({ ...formData, specificUsers: e.target.value })}
              placeholder="Enter user emails, comma separated"
              className="mt-2 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
        </div>

        {/* Template or Custom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Content
          </label>
          <select
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Custom Message</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.category} - {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Content */}
        {!formData.template && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.customSubject}
                onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                placeholder="Notification subject"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.customBody}
                onChange={(e) => setFormData({ ...formData, customBody: e.target.value })}
                placeholder="Write your message here..."
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </>
        )}

        {/* Channels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Channels
          </label>
          <div className="space-y-2">
            {['email', 'in_app', 'push'].map(channel => (
              <label key={channel} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={channel}
                  checked={formData.channels.includes(channel)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, channels: [...formData.channels, channel] });
                    } else {
                      setFormData({ ...formData, channels: formData.channels.filter(c => c !== channel) });
                    }
                  }}
                  className="text-purple-600"
                />
                <span className="capitalize">{channel.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule (Optional)
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledFor}
            onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send Notification'}
        </button>
      </div>
    </div>
  );
};

// Templates Tab Component
const TemplatesTab = () => {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await supabase
        .from('notification_templates')
        .select('*')
        .order('category');
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleToggleActive = async (templateId, currentStatus) => {
    try {
      await supabase
        .from('notification_templates')
        .update({ is_active: !currentStatus })
        .eq('id', templateId);
      
      fetchTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Notification Templates</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          Add Template
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Priority</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(template => (
              <tr key={template.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-gray-600 truncate max-w-xs">
                      {template.subject || template.body_template}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                    {template.category}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="capitalize">{template.type}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    template.priority <= 2 ? 'bg-red-100 text-red-700' :
                    template.priority === 3 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    P{template.priority}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggleActive(template.id, template.is_active)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      template.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {template.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// History Tab Component
const HistoryTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          users(email, username),
          notification_templates(name, category)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'read':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Notification History</h2>
        
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="read">Read</option>
          </select>
          
          <button
            onClick={fetchNotifications}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Recipient</th>
                <th className="text-left py-3 px-4">Notification</th>
                <th className="text-left py-3 px-4">Channel</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(notification => (
                <tr key={notification.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{notification.users?.email}</p>
                      <p className="text-sm text-gray-600">{notification.users?.username}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm">
                      {notification.notification_templates?.name || 'Custom'}
                    </p>
                    {notification.notification_templates?.category && (
                      <span className="text-xs text-gray-500">
                        {notification.notification_templates.category}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize">{notification.channel}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(notification.status)}`}>
                      {notification.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {notification.sent_at 
                      ? format(new Date(notification.sent_at), 'MMM d, h:mm a')
                      : format(new Date(notification.created_at), 'MMM d, h:mm a')
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = () => {
  const [analytics, setAnalytics] = useState({
    byCategory: [],
    byChannel: [],
    byHour: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch notifications with templates
      const { data: notifications } = await supabase
        .from('notifications')
        .select(`
          *,
          notification_templates(category)
        `)
        .eq('status', 'sent')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Process analytics
      const byCategory = {};
      const byChannel = {};
      const byHour = Array(24).fill(0);

      notifications?.forEach(notif => {
        // By category
        const category = notif.notification_templates?.category || 'custom';
        byCategory[category] = (byCategory[category] || 0) + 1;

        // By channel
        byChannel[notif.channel] = (byChannel[notif.channel] || 0) + 1;

        // By hour
        const hour = new Date(notif.created_at).getHours();
        byHour[hour]++;
      });

      setAnalytics({
        byCategory: Object.entries(byCategory).map(([name, count]) => ({ name, count })),
        byChannel: Object.entries(byChannel).map(([name, count]) => ({ name, count })),
        byHour: byHour.map((count, hour) => ({ hour, count }))
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* By Category */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Notifications by Category (Last 30 days)</h3>
        <div className="space-y-3">
          {analytics.byCategory.map(cat => (
            <div key={cat.name} className="flex items-center gap-3">
              <span className="w-24 text-sm capitalize">{cat.name}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                <div 
                  className="absolute left-0 top-0 h-full bg-purple-600 rounded-full flex items-center justify-end px-3"
                  style={{ width: `${(cat.count / Math.max(...analytics.byCategory.map(c => c.count))) * 100}%` }}
                >
                  <span className="text-white text-sm font-medium">{cat.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Channel */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Notifications by Channel</h3>
        <div className="grid grid-cols-3 gap-4">
          {analytics.byChannel.map(channel => (
            <div key={channel.name} className="text-center">
              <div className="text-3xl font-bold text-purple-600">{channel.count}</div>
              <div className="text-sm text-gray-600 capitalize">{channel.name.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* By Hour */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Notifications by Hour of Day</h3>
        <div className="h-48 flex items-end gap-1">
          {analytics.byHour.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-purple-600 rounded-t transition-all hover:bg-purple-700"
                style={{ 
                  height: `${(data.count / Math.max(...analytics.byHour.map(h => h.count))) * 100}%`,
                  minHeight: data.count > 0 ? '4px' : '0'
                }}
              />
              {index % 3 === 0 && (
                <span className="text-xs text-gray-600 mt-1">{index}:00</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;