import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare,
  DollarSign,
  Users,
  Shield,
  Gift,
  TrendingUp,
  Moon,
  Clock,
  Save,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { notificationService } from '../services/supabase/NotificationService';
import { motion, AnimatePresence } from 'framer-motion';
import TestEmailButton from '../components/TestEmailButton';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchPreferences();
    }
  }, [currentUser]);

  const fetchPreferences = async () => {
    try {
      const data = await notificationService.getPreferences(currentUser.id);
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationService.updatePreferences(currentUser.id, preferences);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600" />
      </div>
    );
  }

  const categories = [
    {
      id: 'transactions',
      name: 'Transactions',
      description: 'Money sent, received, deposits, and withdrawals',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600 bg-green-100',
      subcategories: [
        { id: 'deposit_initiated', name: 'Deposit Initiated' },
        { id: 'deposit_completed', name: 'Deposit Completed' },
        { id: 'withdrawal_initiated', name: 'Withdrawal Initiated' },
        { id: 'withdrawal_completed', name: 'Withdrawal Completed' },
        { id: 'money_received', name: 'Money Received' },
        { id: 'money_sent', name: 'Money Sent' }
      ]
    },
    {
      id: 'social',
      name: 'Social',
      description: 'Friend requests, group invites, and social activity',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-100',
      subcategories: [
        { id: 'group_invite', name: 'Group Invitations' },
        { id: 'friend_request', name: 'Friend Requests' },
        { id: 'group_activity', name: 'Group Activity' }
      ]
    },
    {
      id: 'rewards',
      name: 'Rewards & Bonuses',
      description: 'Daily spins, jackpots, and bonus opportunities',
      icon: <Gift className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-100',
      subcategories: [
        { id: 'daily_spin', name: 'Daily Spin Available' },
        { id: 'jackpot_won', name: 'Jackpot Won' },
        { id: 'bonus_earned', name: 'Bonus Earned' }
      ]
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Account activity and security updates',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-red-600 bg-red-100',
      subcategories: [
        { id: 'new_login', name: 'New Login Alert' },
        { id: 'password_changed', name: 'Password Changed' },
        { id: 'suspicious_activity', name: 'Suspicious Activity' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Promotions, new features, and product updates',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-orange-600 bg-orange-100',
      subcategories: [
        { id: 'promotions', name: 'Promotions & Offers' },
        { id: 'new_features', name: 'New Features' },
        { id: 'product_updates', name: 'Product Updates' }
      ]
    }
  ];

  const channels = [
    { id: 'email', name: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'push', name: 'Push', icon: <Bell className="w-4 h-4" /> },
    { id: 'in_app', name: 'In-App', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">Notification Settings</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Settings saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Master Toggles */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Notification Channels</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences?.email_enabled || false}
                onChange={() => handleToggle('email_enabled')}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences?.push_enabled || false}
                onChange={() => handleToggle('push_enabled')}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">In-App Notifications</p>
                  <p className="text-sm text-gray-600">See notifications within the app</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences?.in_app_enabled || false}
                onChange={() => handleToggle('in_app_enabled')}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Critical security alerts only</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences?.sms_enabled || false}
                onChange={() => handleToggle('sms_enabled')}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        {/* Category Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Notification Categories</h2>
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category.id} className="border-b last:border-0 pb-6 last:pb-0">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {channels.map(channel => {
                      const masterKey = `${category.id}_${channel.id}`;
                      const isEnabled = preferences?.[masterKey] !== false;
                      const channelEnabled = preferences?.[`${channel.id}_enabled`];
                      
                      return (
                        <label
                          key={channel.id}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md cursor-pointer transition-colors ${
                            isEnabled && channelEnabled
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-500'
                          } ${!channelEnabled ? 'opacity-50' : ''}`}
                          title={`Toggle all ${category.name} ${channel.name} notifications`}
                        >
                          <input
                            type="checkbox"
                            checked={isEnabled && channelEnabled}
                            onChange={() => handleToggle(masterKey)}
                            disabled={!channelEnabled}
                            className="sr-only"
                          />
                          {channel.icon}
                          <span>{channel.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                
                {category.subcategories && (
                  <div className="ml-11 space-y-3">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{subcategory.name}</span>
                        <div className="flex gap-3">
                          {channels.map(channel => {
                            const key = `${subcategory.id}_${channel.id}`;
                            const isEnabled = preferences?.[key] !== false;
                            const channelEnabled = preferences?.[`${channel.id}_enabled`];
                            const masterEnabled = preferences?.[`${category.id}_${channel.id}`] !== false;
                            
                            return (
                              <label
                                key={channel.id}
                                className={`flex items-center gap-1 cursor-pointer ${
                                  !channelEnabled || !masterEnabled ? 'opacity-50' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isEnabled && channelEnabled && masterEnabled}
                                  onChange={() => handleToggle(key)}
                                  disabled={!channelEnabled || !masterEnabled}
                                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-xs text-gray-600">{channel.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Quiet Hours</h2>
          <label className="flex items-center justify-between cursor-pointer mb-4">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Enable Quiet Hours</p>
                <p className="text-sm text-gray-600">Pause non-critical notifications during set hours</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences?.quiet_hours_enabled || false}
              onChange={() => handleToggle('quiet_hours_enabled')}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
          </label>

          {preferences?.quiet_hours_enabled && (
            <div className="ml-8 space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm">
                  From:
                  <input
                    type="time"
                    value={preferences.quiet_hours_start || '22:00'}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      quiet_hours_start: e.target.value
                    }))}
                    className="ml-2 px-3 py-1 border rounded-lg"
                  />
                </label>
                <label className="text-sm">
                  To:
                  <input
                    type="time"
                    value={preferences.quiet_hours_end || '08:00'}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      quiet_hours_end: e.target.value
                    }))}
                    className="ml-2 px-3 py-1 border rounded-lg"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Critical security notifications will still be sent during quiet hours
              </p>
            </div>
          )}
        </div>

        {/* Digest Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Email Digests</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Weekly Summary</p>
                  <p className="text-sm text-gray-600">Receive a weekly summary of your activity</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences?.weekly_digest_enabled || false}
                onChange={() => handleToggle('weekly_digest_enabled')}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        {/* Test Email Section */}
        <TestEmailButton userEmail={currentUser?.email || 'jacksonfitzgerald25@gmail.com'} />
      </div>
    </div>
  );
};

export default NotificationSettings;
