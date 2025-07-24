import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { pushNotificationService } from '../../services/PushNotificationService';
import { notificationService } from '../../services/supabase/NotificationService';

const NotificationPermissionBanner = () => {
  const { currentUser } = useAuth();
  const [show, setShow] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, [currentUser]);

  const checkPermissionStatus = async () => {
    if (!currentUser) return;

    const status = pushNotificationService.getPermissionStatus();
    setPermissionStatus(status);

    // Show banner if permission hasn't been granted and user is logged in
    if (status === 'default' && currentUser) {
      // Check if user has dismissed the banner recently
      const dismissedAt = localStorage.getItem('bankroll_notification_banner_dismissed');
      if (!dismissedAt || Date.now() - parseInt(dismissedAt) > 7 * 24 * 60 * 60 * 1000) {
        setTimeout(() => setShow(true), 3000); // Show after 3 seconds
      }
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      await pushNotificationService.init();
      await pushNotificationService.requestPermission(currentUser.id);
      
      // Update user preferences
      await notificationService.updatePreferences(currentUser.id, {
        push_enabled: true
      });

      setSuccess(true);
      setPermissionStatus('granted');
      
      // Show success message
      setTimeout(() => {
        setShow(false);
      }, 2000);

      // Send a test notification
      setTimeout(() => {
        pushNotificationService.showLocalNotification(
          'Notifications Enabled! 🎉',
          {
            body: 'You\'ll now receive important updates from Bankroll',
            tag: 'welcome-notification'
          }
        );
      }, 1000);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      if (error.message.includes('denied')) {
        setPermissionStatus('denied');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('bankroll_notification_banner_dismissed', Date.now().toString());
  };

  if (!show || permissionStatus !== 'default') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40"
      >
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {success ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-green-50 border-b border-green-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">Notifications Enabled!</h3>
                  <p className="text-sm text-green-700">You're all set to receive updates</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Stay Updated with Notifications
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Get instant alerts for money received, rewards, and important updates
                    </p>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50">
                <div className="flex gap-3">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={handleEnable}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Enabling...</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        <span>Enable</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPermissionBanner;