import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, Users, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import supabaseNotificationService from '../../../services/SupabaseNotificationService';

const NotificationStats = ({ adminProfile }) => {
  const [stats, setStats] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Fetch notification stats and user stats in parallel
        const [notificationStats, userNotificationStats] = await Promise.all([
          supabaseNotificationService.getNotificationStats(),
          supabaseNotificationService.getUserNotificationStats()
        ]);
        
        setStats(notificationStats);
        setUserStats(userNotificationStats);
      } catch (error) {
        console.error('Error loading notification stats:', error);
        setError('Failed to load statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);
  
  // Calculate overall metrics
  const calculateOverallMetrics = () => {
    if (!stats.length) return { total: 0, delivered: 0, opened: 0, clicked: 0 };
    
    return stats.reduce((acc, campaign) => {
      return {
        total: acc.total + (campaign.total_sent || 0),
        delivered: acc.delivered + (campaign.total_delivered || 0),
        opened: acc.opened + (campaign.total_opened || 0),
        clicked: acc.clicked + (campaign.total_clicked || 0)
      };
    }, { total: 0, delivered: 0, opened: 0, clicked: 0 });
  };
  
  const metrics = calculateOverallMetrics();
  
  // Calculate rates
  const deliveryRate = metrics.total > 0 ? (metrics.delivered / metrics.total) * 100 : 0;
  const openRate = metrics.delivered > 0 ? (metrics.opened / metrics.delivered) * 100 : 0;
  const clickRate = metrics.opened > 0 ? (metrics.clicked / metrics.opened) * 100 : 0;
  
  // Get enabled users count
  const enabledUsersCount = userStats.filter(user => 
    user.push_enabled || user.email_enabled || user.sms_enabled
  ).length;
  
  const totalUsers = userStats.length;
  const optInRate = totalUsers > 0 ? (enabledUsersCount / totalUsers) * 100 : 0;
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-500">Loading statistics...</span>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Notification Analytics</h3>
        <p className="text-sm text-gray-500">
          Track the performance of your notification campaigns
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Notifications Sent</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <BarChart className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900">{deliveryRate.toFixed(1)}%</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <PieChart className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span className="text-gray-500">Delivered: {metrics.delivered.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">{openRate.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span className="text-gray-500">Opened: {metrics.opened.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">{clickRate.toFixed(1)}%</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <ArrowUp className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span className="text-gray-500">Clicked: {metrics.clicked.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Campaign Performance */}
      <div className="mb-8">
        <h4 className="text-md font-medium mb-4">Campaign Performance</h4>
        
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Click Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No campaign data available yet
                  </td>
                </tr>
              ) : (
                stats.map((campaign, index) => (
                  <tr key={campaign.campaign_id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {campaign.campaign_name || 'Unnamed Campaign'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.notification_type || 'system'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.total_sent || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.delivery_rate ? `${campaign.delivery_rate.toFixed(1)}%` : '0%'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.open_rate ? `${campaign.open_rate.toFixed(1)}%` : '0%'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.click_rate ? `${campaign.click_rate.toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* User Notification Preferences */}
      <div>
        <h4 className="text-md font-medium mb-4">User Notification Preferences</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Opt-in Rate</p>
                <p className="text-2xl font-bold text-gray-900">{optInRate.toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <ArrowUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-gray-500">{enabledUsersCount} users opted in</span>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex flex-col h-full justify-center">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Push Notifications</span>
                  <span className="text-sm font-medium">
                    {userStats.filter(u => u.push_enabled).length} users
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email Notifications</span>
                  <span className="text-sm font-medium">
                    {userStats.filter(u => u.email_enabled).length} users
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">SMS Notifications</span>
                  <span className="text-sm font-medium">
                    {userStats.filter(u => u.sms_enabled).length} users
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationStats; 