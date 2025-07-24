import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Users,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, limit, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { notificationHub } from '../../services/NotificationHub';

const FirebaseNotificationPanel = () => {
  const [activeTab, setActiveTab] = useState('send');
  const [loading, setLoading] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [testMode, setTestMode] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    channels: ['push'],
    recipientType: 'all',
    specificRecipients: '',
    testRecipients: {
      email: '',
      phone: ''
    }
  });

  // Stats
  const [stats, setStats] = useState({
    totalSent: 0,
    successRate: 0,
    pendingCount: 0,
    failedCount: 0
  });

  useEffect(() => {
    loadNotificationHistory();
    loadUsers();
    loadStats();
  }, []);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadNotificationHistory = async () => {
    try {
      const q = query(
        collection(db, 'notificationHistory'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotificationHistory(history);
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'notificationHistory'));
      const notifications = snapshot.docs.map(doc => doc.data());
      
      const total = notifications.length;
      const successful = notifications.filter(n => n.status === 'sent' || n.status === 'delivered').length;
      const pending = notifications.filter(n => n.status === 'pending').length;
      const failed = notifications.filter(n => n.status === 'failed').length;

      setStats({
        totalSent: total,
        successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
        pendingCount: pending,
        failedCount: failed
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recipients = getRecipients();
      
      if (recipients.length === 0) {
        alert('No recipients selected');
        setLoading(false);
        return;
      }

      // Send to each channel
      for (const channel of formData.channels) {
        for (const recipient of recipients) {
          let result;
          
          if (testMode) {
            // Simulate sending in test mode
            await new Promise(resolve => setTimeout(resolve, 500));
            result = {
              success: Math.random() > 0.1, // 90% success rate in test
              channel,
              recipient: recipient.email || recipient.phoneNumber || recipient.id,
              messageId: `test_${Date.now()}_${Math.random()}`
            };
          } else {
            // Real sending
            switch (channel) {
              case 'email':
                if (recipient.email) {
                  result = await notificationHub.sendEmail(
                    recipient.email,
                    formData.title,
                    formData.message
                  );
                }
                break;
              case 'sms':
                if (recipient.phoneNumber) {
                  result = await notificationHub.sendSMS(
                    recipient.phoneNumber,
                    formData.message
                  );
                }
                break;
              case 'push':
                result = await notificationHub.sendPushNotification(
                  recipient.id,
                  formData.title,
                  formData.message
                );
                break;
            }
          }

          // Save to history
          await addDoc(collection(db, 'notificationHistory'), {
            title: formData.title,
            message: formData.message,
            channel,
            recipientId: recipient.id,
            recipientEmail: recipient.email,
            recipientPhone: recipient.phoneNumber,
            status: result?.success ? 'sent' : 'failed',
            testMode,
            createdAt: serverTimestamp(),
            metadata: result
          });
        }
      }

      // Reset form
      setFormData({
        ...formData,
        title: '',
        message: '',
        specificRecipients: ''
      });

      // Reload history and stats
      await loadNotificationHistory();
      await loadStats();

      alert('Notifications sent successfully!');
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('Error sending notifications: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecipients = () => {
    if (formData.recipientType === 'all') {
      return allUsers;
    } else if (formData.recipientType === 'selected') {
      return selectedUsers;
    } else if (formData.recipientType === 'test') {
      const recipients = [];
      if (formData.testRecipients.email) {
        recipients.push({
          id: 'test-email',
          email: formData.testRecipients.email
        });
      }
      if (formData.testRecipients.phone) {
        recipients.push({
          id: 'test-phone',
          phoneNumber: formData.testRecipients.phone
        });
      }
      return recipients;
    }
    return [];
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Center</h2>
          <p className="text-gray-600 mt-1">Send and manage notifications to your users</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="rounded"
            />
            <span>Test Mode</span>
          </label>
          {testMode && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
              Notifications will be simulated
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
            </div>
            <Send className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failedCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('send')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'send'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Send Notification
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'history'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'send' ? (
            <form onSubmit={handleSendNotification} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter your message here..."
                  required
                />
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Channels
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('push')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, channels: [...formData.channels, 'push'] });
                        } else {
                          setFormData({ ...formData, channels: formData.channels.filter(c => c !== 'push') });
                        }
                      }}
                      className="rounded"
                    />
                    <Smartphone className="h-4 w-4" />
                    <span>Push Notification</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('email')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, channels: [...formData.channels, 'email'] });
                        } else {
                          setFormData({ ...formData, channels: formData.channels.filter(c => c !== 'email') });
                        }
                      }}
                      className="rounded"
                    />
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('sms')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, channels: [...formData.channels, 'sms'] });
                        } else {
                          setFormData({ ...formData, channels: formData.channels.filter(c => c !== 'sms') });
                        }
                      }}
                      className="rounded"
                    />
                    <MessageSquare className="h-4 w-4" />
                    <span>SMS</span>
                  </label>
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="recipientType"
                      value="all"
                      checked={formData.recipientType === 'all'}
                      onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                    />
                    <Users className="h-4 w-4" />
                    <span>All Users ({allUsers.length})</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="recipientType"
                      value="test"
                      checked={formData.recipientType === 'test'}
                      onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                    />
                    <User className="h-4 w-4" />
                    <span>Test Recipients</span>
                  </label>
                </div>
              </div>

              {/* Test Recipients */}
              {formData.recipientType === 'test' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Email
                    </label>
                    <input
                      type="email"
                      value={formData.testRecipients.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        testRecipients: { ...formData.testRecipients, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="test@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.testRecipients.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        testRecipients: { ...formData.testRecipients, phone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || formData.channels.length === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* History Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Notification History</h3>
                <button
                  onClick={loadNotificationHistory}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Channel
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Recipient
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mode
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {notificationHistory.map((notification) => (
                      <tr key={notification.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(notification.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {notification.title || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            notification.channel === 'email' ? 'bg-blue-100 text-blue-800' :
                            notification.channel === 'sms' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {notification.channel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {notification.recipientEmail || notification.recipientPhone || 'User'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center gap-1 ${
                            notification.status === 'sent' || notification.status === 'delivered' 
                              ? 'text-green-600' 
                              : notification.status === 'failed' 
                              ? 'text-red-600' 
                              : 'text-orange-600'
                          }`}>
                            {notification.status === 'sent' || notification.status === 'delivered' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : notification.status === 'failed' ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                            {notification.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {notification.testMode && (
                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                              Test
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {notificationHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications sent yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirebaseNotificationPanel;