import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsService } from '../services/firebase/NotificationsService';
import { auth } from '../services/firebase/config';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    inApp: true,
    email: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        if (!auth.currentUser) {
          navigate('/login');
          return;
        }

        const userPrefs = await notificationsService.getNotificationPreferences(auth.currentUser.uid);
        setPreferences(userPrefs);
        setLoading(false);
      } catch (err) {
        setError('Failed to load notification preferences');
        setLoading(false);
      }
    };

    loadPreferences();
  }, [navigate]);

  const handleToggle = async (type) => {
    try {
      const newPreferences = {
        ...preferences,
        [type]: !preferences[type]
      };
      
      setPreferences(newPreferences);
      await notificationsService.saveNotificationPreferences(auth.currentUser.uid, newPreferences);
      
      if (type === 'inApp' && newPreferences.inApp) {
        const token = await notificationsService.initializePushNotifications();
        if (token) {
          await notificationsService.saveNotificationPreferences(auth.currentUser.uid, {
            ...newPreferences,
            pushToken: token
          });
        }
      }
    } catch (err) {
      setError('Failed to update preferences');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Notification Settings</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
          <div>
            <h3 className="font-semibold">In-App Notifications</h3>
            <p className="text-sm text-gray-600">Receive notifications within the app and browser push notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={preferences.inApp}
              onChange={() => handleToggle('inApp')}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
          <div>
            <h3 className="font-semibold">Email Notifications</h3>
            <p className="text-sm text-gray-600">Receive important updates via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={preferences.email}
              onChange={() => handleToggle('email')}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">About Notifications</h4>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>In-app notifications appear in your notification center and as browser push notifications</li>
            <li>Email notifications are sent to your registered email address for important updates</li>
            <li>You can change these settings at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
