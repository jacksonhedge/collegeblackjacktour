import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, Filter, Plus, ArrowRight, Trash2, Edit, X, 
  Mail, MessageSquare, CheckCircle, AlertCircle, Settings, RefreshCw 
} from 'lucide-react';
import { adminSettingsService } from '../../services/firebase/AdminSettingsService';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [notificationRules, setNotificationRules] = useState([]);
  const [newNotification, setNewNotification] = useState({
    title: '',
    body: '',
    type: 'email',
    recipientType: 'individual',
    recipientIds: [],
    sendAt: new Date().toISOString().slice(0, 16),
    scheduled: false
  });
  const [userSearchTerm, setUserSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch notifications history
        const notificationsData = await adminSettingsService.getNotificationsHistory();
        setNotifications(notificationsData);
        
        // Fetch users for recipient selection
        const userData = await adminSettingsService.getAllUsers();
        setUsers(userData);
        
        // Fetch notification rules
        const rulesData = await adminSettingsService.getNotificationRules();
        setNotificationRules(rulesData);
        
      } catch (error) {
        console.error('Error fetching notification data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCreateNotification = async () => {
    try {
      setLoading(true);
      
      // Ensure required fields are set
      if (!newNotification.title || !newNotification.body) {
        alert('Please fill in all required fields');
        return;
      }
      
      // For individual recipients, ensure at least one recipient is selected
      if (newNotification.recipientType === 'individual' && newNotification.recipientIds.length === 0) {
        alert('Please select at least one recipient');
        return;
      }
      
      // Create the notification
      await adminSettingsService.createNotification(newNotification);
      
      // Refresh the notifications list
      const updatedNotifications = await adminSettingsService.getNotificationsHistory();
      setNotifications(updatedNotifications);
      
      // Reset the form and close the modal
      setNewNotification({
        title: '',
        body: '',
        type: 'email',
        recipientType: 'individual',
        recipientIds: [],
        sendAt: new Date().toISOString().slice(0, 16),
        scheduled: false
      });
      
      setShowModal(false);
    } catch (error) {
      console.error('Error creating notification:', error);
      alert(`Failed to create notification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      setLoading(true);
      
      // Validate required fields for the rule
      if (!selectedRule.event || !selectedRule.notificationType) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Create or update the rule
      if (selectedRule.id) {
        await adminSettingsService.updateNotificationRule(selectedRule.id, selectedRule);
      } else {
        await adminSettingsService.createNotificationRule(selectedRule);
      }
      
      // Refresh the rules list
      const updatedRules = await adminSettingsService.getNotificationRules();
      setNotificationRules(updatedRules);
      
      // Reset form and close modal
      setSelectedRule(null);
      setShowRulesModal(false);
    } catch (error) {
      console.error('Error managing notification rule:', error);
      alert(`Failed to save notification rule: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this notification rule?')) {
      try {
        setLoading(true);
        await adminSettingsService.deleteNotificationRule(ruleId);
        
        // Refresh the rules list
        const updatedRules = await adminSettingsService.getNotificationRules();
        setNotificationRules(updatedRules);
      } catch (error) {
        console.error('Error deleting notification rule:', error);
        alert(`Failed to delete rule: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    // Apply search term filter
    const matchesSearch = 
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipientName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply notification type filter
    const matchesType = 
      filterType === 'all' || 
      notification.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="text-xl font-bold mb-4 md:mb-0">Notification Management</h2>
          <div className="flex flex-col md:flex-row gap-2">
            <button 
              onClick={() => setShowRulesModal(true)}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>Notification Rules</span>
            </button>
            <button 
              onClick={() => {
                setNewNotification({
                  title: '',
                  body: '',
                  type: 'email',
                  recipientType: 'individual',
                  recipientIds: [],
                  sendAt: new Date().toISOString().slice(0, 16),
                  scheduled: false
                });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Notification</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Notification List */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-2 text-gray-500">No notifications found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title & Content
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                      {getNotificationTypeIcon(notification.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{notification.body}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {notification.recipientName || (notification.recipientType === 'all' ? 'All Users' : 'Multiple Users')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {notification.recipientType === 'individual' ? 'Individual' : notification.recipientType === 'group' ? 'Group' : 'Broadcast'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(notification.status)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{notification.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(notification.sentAt || notification.scheduledFor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Create Notification Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            // Close modal when clicking on the backdrop
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Notification</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notification Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="email"
                      checked={newNotification.type === 'email'}
                      onChange={() => setNewNotification({...newNotification, type: 'email'})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Email</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="sms"
                      checked={newNotification.type === 'sms'}
                      onChange={() => setNewNotification({...newNotification, type: 'sms'})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">SMS</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="push"
                      checked={newNotification.type === 'push'}
                      onChange={() => setNewNotification({...newNotification, type: 'push'})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Push Notification</span>
                  </label>
                </div>
              </div>
              
              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipients
                </label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="individual"
                      checked={newNotification.recipientType === 'individual'}
                      onChange={() => setNewNotification({...newNotification, recipientType: 'individual'})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Specific Users</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="all"
                      checked={newNotification.recipientType === 'all'}
                      onChange={() => setNewNotification({...newNotification, recipientType: 'all'})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">All Users</span>
                  </label>
                </div>
                
                {newNotification.recipientType === 'individual' && (
                  <div className="border border-gray-300 rounded-md p-2 mt-2">
                    <div className="mb-2">
                      <div className="border border-gray-300 rounded-md p-2 h-40 overflow-y-auto">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">Select Recipients</div>
                          <div className="space-x-2">
                            <button 
                              onClick={() => setNewNotification({...newNotification, recipientIds: users.map(u => u.id)})}
                              type="button"
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                            >
                              Select All
                            </button>
                            <button 
                              onClick={() => setNewNotification({...newNotification, recipientIds: []})}
                              type="button"
                              className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        <div className="relative mb-2">
                          <input 
                            type="text"
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                          />
                          {userSearchTerm && (
                            <button
                              onClick={() => setUserSearchTerm('')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {users
                            .filter(user => {
                              if (!userSearchTerm) return true;
                              const searchLower = userSearchTerm.toLowerCase();
                              return (
                                (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
                                (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
                                (user.email && user.email.toLowerCase().includes(searchLower))
                              );
                            })
                            .map(user => (
                            <div key={user.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`user-${user.id}`}
                                checked={newNotification.recipientIds.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewNotification({
                                      ...newNotification, 
                                      recipientIds: [...newNotification.recipientIds, user.id]
                                    });
                                  } else {
                                    setNewNotification({
                                      ...newNotification, 
                                      recipientIds: newNotification.recipientIds.filter(id => id !== user.id)
                                    });
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                              <label 
                                htmlFor={`user-${user.id}`} 
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                              >
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName} (${user.email})`
                                  : user.email}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Selected {newNotification.recipientIds.length} recipients
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notification Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                  placeholder="Notification title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  value={newNotification.body}
                  onChange={(e) => setNewNotification({...newNotification, body: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 h-24 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                  placeholder="Enter your notification message here..."
                />
              </div>
              
              {/* Scheduling */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="scheduleCheckbox"
                    checked={newNotification.scheduled}
                    onChange={(e) => setNewNotification({...newNotification, scheduled: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="scheduleCheckbox" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Schedule for later
                  </label>
                </div>
                
                {newNotification.scheduled && (
                  <div className="mt-2">
                    <input
                      type="datetime-local"
                      value={newNotification.sendAt}
                      onChange={(e) => setNewNotification({...newNotification, sendAt: e.target.value})}
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNotification}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    <span>Send Notification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Rules Modal */}
      {showRulesModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            // Close modal when clicking on the backdrop
            if (e.target === e.currentTarget) setShowRulesModal(false);
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notification Rules</h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            
            {/* Current Rules List */}
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Current Rules</h4>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {notificationRules.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notification rules defined yet
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notification Type
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Template
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notificationRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{rule.event}</div>
                            <div className="text-xs text-gray-500">{rule.description}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              {getNotificationTypeIcon(rule.notificationType)}
                              <span className="ml-2 capitalize">{rule.notificationType}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {rule.templateName || 'Default Template'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedRule(rule);
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteRule(rule.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              <div className="mt-4">
                <button 
                  onClick={() => {
                    setSelectedRule({
                      event: '',
                      notificationType: 'email',
                      templateName: '',
                      description: '',
                      active: true
                    });
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Rule</span>
                </button>
              </div>
            </div>
            
            {/* Edit Rule Form */}
            {selectedRule && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                  {selectedRule.id ? 'Edit Rule' : 'Create New Rule'}
                </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Event
                      </label>
                      <select
                        value={selectedRule.event}
                        onChange={(e) => setSelectedRule({...selectedRule, event: e.target.value})}
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                      >
                        <option value="">Select Event</option>
                        <option value="gift_card_assigned">Gift Card Assigned</option>
                        <option value="gift_card_expired">Gift Card Expired</option>
                        <option value="new_user_signup">New User Signup</option>
                        <option value="account_verified">Account Verified</option>
                        <option value="bet_placed">Bet Placed</option>
                        <option value="bet_won">Bet Won</option>
                        <option value="password_reset">Password Reset</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notification Type
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            value="email"
                            checked={selectedRule.notificationType === 'email'}
                            onChange={() => setSelectedRule({...selectedRule, notificationType: 'email'})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Email</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            value="sms"
                            checked={selectedRule.notificationType === 'sms'}
                            onChange={() => setSelectedRule({...selectedRule, notificationType: 'sms'})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">SMS</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            value="push"
                            checked={selectedRule.notificationType === 'push'}
                            onChange={() => setSelectedRule({...selectedRule, notificationType: 'push'})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Push</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={selectedRule.description}
                      onChange={(e) => setSelectedRule({...selectedRule, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                      placeholder="Brief description of this rule"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={selectedRule.templateName}
                      onChange={(e) => setSelectedRule({...selectedRule, templateName: e.target.value})}
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                      placeholder="Template to use for this notification (optional)"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activeCheckbox"
                      checked={selectedRule.active}
                      onChange={(e) => setSelectedRule({...selectedRule, active: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="activeCheckbox" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rule Active
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedRule(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRule}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {loading ? 'Saving...' : 'Save Rule'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;