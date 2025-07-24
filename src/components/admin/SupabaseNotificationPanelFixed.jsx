import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import NotificationTemplates from './notifications/NotificationTemplates';
import NotificationCampaigns from './notifications/NotificationCampaigns';
import NotificationStats from './notifications/NotificationStats';
import NotificationSegments from './notifications/NotificationSegments';
import NotificationTriggers from './notifications/NotificationTriggers';
import AutomaticTriggersEnhanced from './notifications/AutomaticTriggersEnhanced';
import supabaseNotificationService from '../../services/SupabaseNotificationService';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const SupabaseNotificationPanelFixed = ({ mode = 'full' }) => {
  // Set default tab based on mode
  const getDefaultTab = () => {
    if (mode === 'automatic') return 'triggers';
    if (mode === 'manual') return 'campaigns';
    return 'campaigns';
  };
  
  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const { currentUser, isAdmin } = useAuth();

  // Fetch admin profile on mount - with better error handling
  useEffect(() => {
    const getAdminProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First check if user is logged in via Supabase
        if (!currentUser) {
          setError('Please log in with a Supabase account to access the notification system.');
          setLoading(false);
          return;
        }

        // Check if user is in the admin emails list
        if (!isAdmin(currentUser)) {
          setError(`User ${currentUser.email} is not authorized as an admin. Please contact system administrator.`);
          setLoading(false);
          return;
        }

        // Check if Supabase service is initialized
        if (!supabaseNotificationService.isInitialized) {
          console.warn('Supabase service not initialized, using compatibility mode');
          setAdminProfile({
            id: 'mock-admin',
            userId: currentUser.id,
            role: {
              name: 'super_admin',
              permissions: {
                notifications: { create: true, read: true, update: true, delete: true, send: true },
                users: { read: true, update: true },
                templates: { create: true, read: true, update: true, delete: true },
                segments: { create: true, read: true, update: true, delete: true },
                analytics: { read: true }
              }
            },
            isActive: true
          });
        } else {
          try {
            // Try to get admin profile from Supabase
            const profile = await supabaseNotificationService.getAdminProfile();
            setAdminProfile(profile);
          } catch (profileError) {
            console.warn('Admin profile not found in Supabase, using fallback admin mode');
            // If no admin profile exists in Supabase, create a mock admin profile
            // This allows existing admin users to use the system
            setAdminProfile({
              id: 'mock-admin',
              userId: currentUser.id,
              role: {
                name: 'super_admin',
                permissions: {
                  notifications: { create: true, read: true, update: true, delete: true, send: true },
                  users: { read: true, update: true },
                  templates: { create: true, read: true, update: true, delete: true },
                  segments: { create: true, read: true, update: true, delete: true },
                  analytics: { read: true }
                }
              },
              isActive: true
            });
          }
        }
      } catch (err) {
        console.error('Error in admin panel setup:', err);
        setError('An error occurred while setting up the admin panel. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getAdminProfile();
  }, [currentUser, isAdmin]);

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
        <div className="mt-4 space-y-2 text-sm">
          <p><strong>To access the notification system:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Log in with a Supabase account (not just the admin panel password)</li>
            <li>Ensure your email is in the admin list (jackson@bankroll.com, jackson@hedgepay.co, or admin@bankroll.com)</li>
            <li>If you need admin access, contact your system administrator</li>
          </ol>
        </div>
        {!currentUser && (
          <div className="mt-4">
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
          </div>
        )}
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

  // Determine which tabs to show based on mode
  const getVisibleTabs = () => {
    if (mode === 'automatic') {
      return ['triggers', 'templates', 'stats'];
    }
    if (mode === 'manual') {
      return ['campaigns', 'templates', 'segments', 'stats'];
    }
    return ['campaigns', 'templates', 'segments', 'triggers', 'stats']; // full mode
  };

  const visibleTabs = getVisibleTabs();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold">
          {mode === 'automatic' && 'Automatic Notification Triggers'}
          {mode === 'manual' && 'Manual Notification Management'}
          {mode === 'full' && 'Supabase Notification Management'}
        </h2>
        <p className="text-gray-500 mt-1">
          {mode === 'automatic' && 'Configure automated notifications based on user actions and events'}
          {mode === 'manual' && 'Send targeted campaigns and manage notification templates'}
          {mode === 'full' && 'Manage push notifications, email campaigns, and notification templates'}
        </p>
        {adminProfile.id === 'mock-admin' && (
          <p className="text-yellow-600 text-sm mt-2">
            Note: Running in compatibility mode. Some features may be limited.
          </p>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="border-b border-gray-200">
          <TabsList className="flex">
            {visibleTabs.includes('campaigns') && (
              <TabsTrigger 
                value="campaigns" 
                className="px-4 py-2 text-sm font-medium"
                disabled={!canManageNotifications}
              >
                Campaigns
              </TabsTrigger>
            )}
            {visibleTabs.includes('templates') && (
              <TabsTrigger 
                value="templates" 
                className="px-4 py-2 text-sm font-medium"
                disabled={!canManageNotifications}
              >
                Templates
              </TabsTrigger>
            )}
            {visibleTabs.includes('segments') && (
              <TabsTrigger 
                value="segments" 
                className="px-4 py-2 text-sm font-medium"
                disabled={!canManageNotifications}
              >
                User Segments
              </TabsTrigger>
            )}
            {visibleTabs.includes('triggers') && (
              <TabsTrigger 
                value="triggers" 
                className="px-4 py-2 text-sm font-medium"
                disabled={!canManageNotifications}
              >
                {mode === 'automatic' ? 'Trigger Rules' : 'Automations'}
              </TabsTrigger>
            )}
            {visibleTabs.includes('stats') && (
              <TabsTrigger 
                value="stats" 
                className="px-4 py-2 text-sm font-medium"
                disabled={!canViewAnalytics}
              >
                Analytics
              </TabsTrigger>
            )}
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
          {mode === 'automatic' ? (
            <AutomaticTriggersEnhanced 
              adminProfile={adminProfile}
              refreshData={refreshData}
            />
          ) : (
            <NotificationTriggers 
              adminProfile={adminProfile}
              refreshData={refreshData}
            />
          )}
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

export default SupabaseNotificationPanelFixed;