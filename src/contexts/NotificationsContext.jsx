import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { requestPermission, initializeMessaging } from '../services/firebase/NotificationsService';

const NotificationsContext = createContext({
  notifications: [],
  loading: true,
  error: null,
  emailPreferences: {
    enabled: true,
    types: {
      marketing: true,
      updates: true,
      groupInvites: true,
    },
  },
  textPreferences: {
    enabled: false,
    types: {
      marketing: true,
      updates: true,
      groupInvites: true,
    },
  },
  markAsRead: async () => {},
  clearAll: async () => {},
  updateEmailPreferences: async () => {},
  updateTextPreferences: async () => {},
});

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}

export function NotificationsProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailPreferences, setEmailPreferences] = useState({
    enabled: true,
    types: {
      marketing: true,
      updates: true,
      groupInvites: true,
    },
  });
  const [textPreferences, setTextPreferences] = useState({
    enabled: false,
    types: {
      marketing: true,
      updates: true,
      groupInvites: true,
    },
  });

  // Effect for handling Firestore data
  useEffect(() => {
    let unsubscribe;

    const setupFirestoreListener = async () => {
      if (!currentUser?.uid) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setNotifications(userData.notifications || []);
            setEmailPreferences(userData.emailPreferences || {
              enabled: true,
              types: {
                marketing: true,
                updates: true,
                groupInvites: true,
              },
            });
            setTextPreferences(userData.textPreferences || {
              enabled: false,
              types: {
                marketing: true,
                updates: true,
                groupInvites: true,
              },
            });
          } else {
            setNotifications([]);
          }
          setLoading(false);
        }, (err) => {
          console.error('Error in notifications listener:', err);
          setError('Failed to load notifications');
          setLoading(false);
        });
      } catch (error) {
        console.error('Error setting up Firestore listener:', error);
        setError('Failed to initialize notifications');
        setLoading(false);
      }
    };

    setupFirestoreListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Separate effect for FCM initialization with delay
  useEffect(() => {
    let timeoutId;
    
    const setupFCM = async () => {
      if (!currentUser) return;

      try {
        // Wait for auth token to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Initialize messaging first
        await initializeMessaging();

        // Then request permission and get FCM token
        const token = await requestPermission(currentUser.uid);
        if (token) {
          console.log('FCM setup completed successfully');
        }
      } catch (error) {
        // Ignore FCM errors in development or if permission is denied
        if (error.code === 'messaging/token-subscribe-failed' || 
            error.code === 'messaging/permission-blocked' ||
            import.meta.env.DEV) {
          console.log('FCM setup skipped:', error.message);
          return;
        }
        console.error('Error setting up FCM:', error);
      }
    };

    if (currentUser) {
      timeoutId = setTimeout(setupFCM, 1000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedNotifications = userData.notifications.map((notification) => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        );

        await updateDoc(userRef, {
          notifications: updatedNotifications
        });
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const clearAll = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        notifications: []
      });
    } catch (err) {
      console.error('Error clearing notifications:', err);
      throw err;
    }
  };

  const updateEmailPreferences = async (preferences) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const newPreferences = {
        ...emailPreferences,
        ...preferences,
        types: {
          ...emailPreferences.types,
          ...preferences.types,
        },
      };

      await updateDoc(userRef, {
        emailPreferences: newPreferences
      });

      setEmailPreferences(newPreferences);
    } catch (err) {
      console.error('Error updating email preferences:', err);
      throw err;
    }
  };

  const updateTextPreferences = async (preferences) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const newPreferences = {
        ...textPreferences,
        ...preferences,
        types: {
          ...textPreferences.types,
          ...preferences.types,
        },
      };

      await updateDoc(userRef, {
        textPreferences: newPreferences
      });

      setTextPreferences(newPreferences);
    } catch (err) {
      console.error('Error updating text preferences:', err);
      throw err;
    }
  };

  const value = {
    notifications,
    loading,
    error,
    emailPreferences,
    textPreferences,
    markAsRead,
    clearAll,
    updateEmailPreferences,
    updateTextPreferences
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export default NotificationsContext;
