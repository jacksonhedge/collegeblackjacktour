import React, { useState, useEffect } from 'react';
import { 
  Zap, Plus, Search, Edit, Trash, Clock, CheckCircle, XCircle, 
  DollarSign, Users, Trophy, Shield, Gift, TrendingUp, AlertCircle,
  Mail, MessageSquare, Smartphone, Bell
} from 'lucide-react';
import supabaseNotificationService from '../../../services/SupabaseNotificationService';

// Predefined trigger types based on the documentation
const TRIGGER_CATEGORIES = {
  transaction: {
    label: 'Transaction Triggers',
    icon: DollarSign,
    color: 'green',
    triggers: [
      { id: 'money_received', name: 'Money Received', description: 'When user receives money from another user' },
      { id: 'withdrawal_completed', name: 'Withdrawal Completed', description: 'When withdrawal is processed successfully' },
      { id: 'deposit_successful', name: 'Deposit Successful', description: 'When deposit is confirmed' },
      { id: 'low_balance', name: 'Low Balance Warning', description: 'When balance falls below threshold' },
      { id: 'large_transaction', name: 'Large Transaction Alert', description: 'For transactions over specified amount' }
    ]
  },
  social: {
    label: 'Social Triggers',
    icon: Users,
    color: 'blue',
    triggers: [
      { id: 'group_invite', name: 'Group Invitation', description: 'When invited to join a group' },
      { id: 'friend_request', name: 'Friend Request', description: 'When someone sends a friend request' },
      { id: 'friend_big_win', name: 'Friend Big Win', description: 'When a friend wins big' },
      { id: 'group_activity', name: 'Group Activity', description: 'Updates from user groups' },
      { id: 'friend_joined', name: 'Friend Joined Platform', description: 'When a contact joins Bankroll' }
    ]
  },
  rewards: {
    label: 'Rewards & Challenges',
    icon: Gift,
    color: 'purple',
    triggers: [
      { id: 'daily_spin_available', name: 'Daily Spin Available', description: 'Remind users about daily spin' },
      { id: 'reward_won', name: 'Reward Won', description: 'When user wins a reward' },
      { id: 'streak_milestone', name: 'Streak Milestone', description: 'When user reaches streak goals' },
      { id: 'unclaimed_reward', name: 'Unclaimed Reward', description: 'Reminder for unclaimed rewards' },
      { id: 'challenge_completed', name: 'Challenge Completed', description: 'When user completes a challenge' }
    ]
  },
  security: {
    label: 'Security Alerts',
    icon: Shield,
    color: 'red',
    triggers: [
      { id: 'new_device_login', name: 'New Device Login', description: 'Login from unrecognized device' },
      { id: 'password_changed', name: 'Password Changed', description: 'Password update confirmation' },
      { id: 'suspicious_activity', name: 'Suspicious Activity', description: 'Unusual account activity detected' },
      { id: '2fa_enabled', name: '2FA Enabled', description: 'Two-factor authentication activated' }
    ]
  },
  engagement: {
    label: 'User Engagement',
    icon: TrendingUp,
    color: 'yellow',
    triggers: [
      { id: 'inactive_reminder', name: 'Inactivity Reminder', description: 'Re-engage inactive users' },
      { id: 'weekly_summary', name: 'Weekly Summary', description: 'Weekly activity digest' },
      { id: 'milestone_reached', name: 'Milestone Reached', description: 'User achievements' },
      { id: 'feature_announcement', name: 'New Feature', description: 'Announce new features' }
    ]
  }
};

// Channel icons mapping
const CHANNEL_ICONS = {
  email: Mail,
  push: Bell,
  sms: Smartphone,
  in_app: MessageSquare
};

const AutomaticTriggersEnhanced = ({ adminProfile }) => {
  const [activeTriggers, setActiveTriggers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  
  // Configuration form state
  const [triggerConfig, setTriggerConfig] = useState({
    trigger_id: '',
    name: '',
    template_id: '',
    channels: ['in_app'],
    conditions: {
      threshold: null,
      delay_minutes: 0,
      max_frequency: 'daily'
    },
    priority: 3,
    is_active: true
  });

  // Load active triggers and templates
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [triggersData, templatesData] = await Promise.all([
          supabaseNotificationService.getNotificationTriggers(),
          supabaseNotificationService.getNotificationTemplates()
        ]);
        
        setActiveTriggers(triggersData);
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error loading triggers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get all available triggers flat list
  const getAllTriggers = () => {
    const allTriggers = [];
    Object.entries(TRIGGER_CATEGORIES).forEach(([category, data]) => {
      data.triggers.forEach(trigger => {
        allTriggers.push({
          ...trigger,
          category,
          categoryLabel: data.label,
          categoryIcon: data.icon,
          categoryColor: data.color
        });
      });
    });
    return allTriggers;
  };

  // Filter triggers based on category and search
  const getFilteredTriggers = () => {
    let triggers = getAllTriggers();
    
    if (selectedCategory !== 'all') {
      triggers = triggers.filter(t => t.category === selectedCategory);
    }
    
    if (searchTerm) {
      triggers = triggers.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return triggers;
  };

  // Check if a trigger is active
  const isTriggerActive = (triggerId) => {
    return activeTriggers.some(t => t.event_type === triggerId && t.is_active);
  };

  // Get active trigger config
  const getActiveTriggerConfig = (triggerId) => {
    return activeTriggers.find(t => t.event_type === triggerId);
  };

  // Handle trigger configuration
  const handleConfigureTrigger = (trigger) => {
    const existingConfig = getActiveTriggerConfig(trigger.id);
    
    setSelectedTrigger(trigger);
    setTriggerConfig({
      trigger_id: trigger.id,
      name: trigger.name,
      template_id: existingConfig?.template_id || '',
      channels: existingConfig?.channels || ['in_app'],
      conditions: existingConfig?.conditions || {
        threshold: null,
        delay_minutes: 0,
        max_frequency: 'daily'
      },
      priority: existingConfig?.priority || 3,
      is_active: existingConfig?.is_active ?? true
    });
    setShowConfigModal(true);
  };

  const filteredTriggers = getFilteredTriggers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Automatic Notification Triggers</h2>
            <p className="text-gray-500">Configure automated notifications based on user events and behaviors</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{activeTriggers.length}</div>
            <div className="text-sm text-gray-500">Active Triggers</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {activeTriggers.filter(t => t.last_triggered_at).length}
            </div>
            <div className="text-sm text-gray-500">Triggered Today</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
            <div className="text-sm text-gray-500">Templates Available</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(TRIGGER_CATEGORIES).length}
            </div>
            <div className="text-sm text-gray-500">Categories</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {Object.entries(TRIGGER_CATEGORIES).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === key
                      ? `bg-${category.color}-100 text-${category.color}-700`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search triggers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Triggers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTriggers.map((trigger) => {
          const isActive = isTriggerActive(trigger.id);
          const config = getActiveTriggerConfig(trigger.id);
          const CategoryIcon = trigger.categoryIcon;
          
          return (
            <div
              key={trigger.id}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                isActive ? 'border-green-500' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 bg-${trigger.categoryColor}-100 rounded-lg`}>
                      <CategoryIcon className={`h-5 w-5 text-${trigger.categoryColor}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{trigger.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{trigger.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-500">{trigger.categoryLabel}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConfigureTrigger(trigger)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {isActive && config && (
                  <div className="border-t pt-4 mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Template:</span>
                      <span className="font-medium">
                        {templates.find(t => t.id === config.template_id)?.name || 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Channels:</span>
                      <div className="flex gap-1">
                        {(config.channels || ['in_app']).map(channel => {
                          const ChannelIcon = CHANNEL_ICONS[channel];
                          return (
                            <div
                              key={channel}
                              className="p-1 bg-gray-100 rounded"
                              title={channel}
                            >
                              <ChannelIcon className="h-3 w-3 text-gray-600" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {config.last_triggered_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last triggered:</span>
                        <span className="font-medium">
                          {new Date(config.last_triggered_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedTrigger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Configure Trigger: {selectedTrigger.name}
            </h3>
            
            <div className="space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Template *
                </label>
                <select
                  value={triggerConfig.template_id}
                  onChange={(e) => setTriggerConfig({...triggerConfig, template_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Select a template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Channels
                </label>
                <div className="flex gap-3">
                  {Object.entries(CHANNEL_ICONS).map(([channel, Icon]) => (
                    <label key={channel} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={triggerConfig.channels.includes(channel)}
                        onChange={(e) => {
                          const channels = e.target.checked
                            ? [...triggerConfig.channels, channel]
                            : triggerConfig.channels.filter(c => c !== channel);
                          setTriggerConfig({...triggerConfig, channels});
                        }}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm capitalize">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conditions based on trigger type */}
              {selectedTrigger.id === 'low_balance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Balance Threshold ($)
                  </label>
                  <input
                    type="number"
                    value={triggerConfig.conditions.threshold || ''}
                    onChange={(e) => setTriggerConfig({
                      ...triggerConfig,
                      conditions: {
                        ...triggerConfig.conditions,
                        threshold: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="10.00"
                  />
                </div>
              )}

              {selectedTrigger.id === 'large_transaction' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Amount Threshold ($)
                  </label>
                  <input
                    type="number"
                    value={triggerConfig.conditions.threshold || ''}
                    onChange={(e) => setTriggerConfig({
                      ...triggerConfig,
                      conditions: {
                        ...triggerConfig.conditions,
                        threshold: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="100.00"
                  />
                </div>
              )}

              {/* Delay */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delay (minutes)
                </label>
                <input
                  type="number"
                  value={triggerConfig.conditions.delay_minutes}
                  onChange={(e) => setTriggerConfig({
                    ...triggerConfig,
                    conditions: {
                      ...triggerConfig.conditions,
                      delay_minutes: parseInt(e.target.value)
                    }
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Wait this many minutes before sending the notification
                </p>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Frequency
                </label>
                <select
                  value={triggerConfig.conditions.max_frequency}
                  onChange={(e) => setTriggerConfig({
                    ...triggerConfig,
                    conditions: {
                      ...triggerConfig.conditions,
                      max_frequency: e.target.value
                    }
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="always">No limit</option>
                  <option value="hourly">Once per hour</option>
                  <option value="daily">Once per day</option>
                  <option value="weekly">Once per week</option>
                  <option value="monthly">Once per month</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={triggerConfig.priority}
                  onChange={(e) => setTriggerConfig({
                    ...triggerConfig,
                    priority: parseInt(e.target.value)
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="1">1 - Highest (Immediate)</option>
                  <option value="2">2 - High (Within 5 min)</option>
                  <option value="3">3 - Normal (Within 1 hour)</option>
                  <option value="4">4 - Low (Daily digest)</option>
                  <option value="5">5 - Lowest (Weekly digest)</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={triggerConfig.is_active}
                  onChange={(e) => setTriggerConfig({...triggerConfig, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Enable this trigger
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Save configuration
                  setShowConfigModal(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomaticTriggersEnhanced;