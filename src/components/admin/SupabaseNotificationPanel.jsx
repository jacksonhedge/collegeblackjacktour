import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import NotificationTemplates from './notifications/NotificationTemplates';
import NotificationCampaigns from './notifications/NotificationCampaigns';
import NotificationStats from './notifications/NotificationStats';
import NotificationSegments from './notifications/NotificationSegments';
import NotificationTriggers from './notifications/NotificationTriggers';
import supabaseNotificationService from '../../services/SupabaseNotificationService';

const SupabaseNotificationPanel = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);

  // Fetch admin profile on mount
  useEffect(() => {
    const getAdminProfile = async () => {
      try {
        setLoading(true);
        const profile = await supabaseNotificationService.getAdminProfile();
        setAdminProfile(profile);
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        setError('You do not have admin access to the notification system.');
      } finally {
        setLoading(false);
      }
    };

    getAdminProfile();
  }, []);

  // Handle refresh data after operations
  const refreshData = useCallback(async () => {
    // This is a placeholder that will be implemented in child components
    // Each tab will handle its own data refresh logic
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-500">Loading notification admin panel...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Access Error</h3>
        <p>{error}</p>
        <p className="mt-2 text-sm">
          To access this section, you need admin privileges. Please contact your administrator.
        </p>
      </div>
    );
  }

  if (!adminProfile) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
        <p>Please sign in with an admin account to access the notification dashboard.</p>
      </div>
    );
  }

  // Check if user has appropriate permissions
  const canManageNotifications = adminProfile.role?.permissions?.notifications?.create;
  const canViewAnalytics = adminProfile.role?.permissions?.analytics?.read;

  if (!canManageNotifications && !canViewAnalytics) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Insufficient Permissions</h3>
        <p>You don't have the required permissions to access the notification management system.</p>
        <p className="mt-2 text-sm">
          Required permissions: notifications.create or analytics.read
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold">Supabase Notification Management</h2>
        <p className="text-gray-500 mt-1">
          Manage push notifications, email campaigns, and notification templates
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="border-b border-gray-200">
          <TabsList className="flex">
            <TabsTrigger 
              value="campaigns" 
              className="px-4 py-2 text-sm font-medium"
              disabled={!canManageNotifications}
            >
              Campaigns
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="px-4 py-2 text-sm font-medium"
              disabled={!canManageNotifications}
            >
              Templates
            </TabsTrigger>
            <TabsTrigger 
              value="segments" 
              className="px-4 py-2 text-sm font-medium"
              disabled={!canManageNotifications}
            >
              User Segments
            </TabsTrigger>
            <TabsTrigger 
              value="triggers" 
              className="px-4 py-2 text-sm font-medium"
              disabled={!canManageNotifications}
            >
              Automations
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="px-4 py-2 text-sm font-medium"
              disabled={!canViewAnalytics}
            >
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="campaigns" className="p-4">
          <NotificationCampaigns 
            adminProfile={adminProfile}
            refreshData={refreshData}
          />
        </TabsContent>
        
        <TabsContent value="templates" className="p-4">
          <NotificationTemplates 
            adminProfile={adminProfile}
            refreshData={refreshData}
          />
        </TabsContent>
        
        <TabsContent value="segments" className="p-4">
          <NotificationSegments 
            adminProfile={adminProfile}
            refreshData={refreshData}
          />
        </TabsContent>
        
        <TabsContent value="triggers" className="p-4">
          <NotificationTriggers 
            adminProfile={adminProfile}
            refreshData={refreshData}
          />
        </TabsContent>
        
        <TabsContent value="stats" className="p-4">
          <NotificationStats 
            adminProfile={adminProfile}
            refreshData={refreshData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupabaseNotificationPanel; 