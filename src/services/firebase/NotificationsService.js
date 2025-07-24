import { getFirestore, collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from './config';

// Try to import Firebase messaging, but handle if it's not supported
let messagingModule;
try {
  messagingModule = import('firebase/messaging');
} catch (error) {
  console.warn('Firebase messaging is not supported in this browser:', error);
  messagingModule = null;
}

class NotificationsService {
  constructor() {
    this.db = getFirestore(app);
    this.baseUrl = 'https://us-central1-bankroll-2ccb4.cloudfunctions.net';
    
    // Initialize messaging only if it's supported
    this.messagingSupported = false;
    this.messaging = null;
    this.initMessaging();
  }
  
  async initMessaging() {
    if (!messagingModule) return;
    
    try {
      const { getMessaging } = await messagingModule;
      this.messaging = getMessaging(app);
      this.messagingSupported = true;
    } catch (error) {
      console.warn('Failed to initialize Firebase messaging:', error);
      this.messagingSupported = false;
    }
  }

  // Initialize push notifications
  async initializePushNotifications() {
    try {
      // Check if Firebase messaging is supported in this browser
      if (!this.messagingSupported || !this.messaging) {
        console.log('Firebase messaging is not supported in this browser, skipping push notifications setup');
        return null;
      }
      
      // Import necessary Firebase messaging functions dynamically
      const { getToken, onMessage } = await messagingModule;
      
      // Check if we already have permission
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return null;
      }
      
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        console.log('Notification permission not granted');
        return null;
      }

      // Get current user first
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.log('User must be authenticated to initialize push notifications');
        return null;
      }

      // Skip FCM token generation if running in development or if vapidKey is invalid
      if (import.meta.env.DEV || !this.isValidVapidKey()) {
        console.log('Skipping FCM token generation in development or with invalid VAPID key');
        return null;
      }

      // Get FCM token with proper error handling
      try {
        const token = await getToken(this.messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });

        if (!token) {
          console.log('Failed to get FCM token');
          return null;
        }

        // Save the token to user preferences
        await this.saveNotificationPreferences(user.uid, {
          pushToken: token,
          inApp: true,
          email: true
        });

        // Set up token refresh listener if messaging supports onTokenRefresh
        if (this.messaging.onTokenRefresh) {
          this.messaging.onTokenRefresh(async () => {
            try {
              const refreshedToken = await getToken(this.messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
              });
              await this.saveNotificationPreferences(user.uid, {
                pushToken: refreshedToken
              });
            } catch (refreshError) {
              console.error('Error refreshing FCM token:', refreshError);
            }
          });
        }

        return token;
      } catch (fcmError) {
        console.error('FCM token error (non-critical):', fcmError);
        // Don't throw, just return null as this is non-critical
        return null;
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }
  
  // Helper to check if the VAPID key is valid
  isValidVapidKey() {
    // In development mode, always return false to skip FCM token generation
    if (import.meta.env.MODE === 'development') {
      return false;
    }
    
    const key = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    // Check if key exists and isn't just a placeholder (all Ps)
    return key && !/^B+P+$/.test(key) && key.length > 20;
  }

  // Save user notification preferences
  async saveNotificationPreferences(userId, preferences) {
    try {
      await setDoc(doc(this.db, 'userPreferences', userId), {
        notifications: {
          inApp: preferences.inApp ?? true,
          sms: preferences.sms ?? false,
          email: preferences.email ?? false,
          pushToken: preferences.pushToken
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      throw error;
    }
  }

  // Get user notification preferences
  async getNotificationPreferences(userId) {
    try {
      const docRef = doc(this.db, 'userPreferences', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().notifications;
      }
      return {
        inApp: true,
        sms: false,
        email: false,
        pushToken: null
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  // Send a notification
  async sendNotification(userId, notification) {
    try {
      // Get the current user's ID token
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to send notifications');
      }

      const idToken = await user.getIdToken(true); // Force token refresh

      const response = await fetch(`${this.baseUrl}/sendNotification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'Origin': window.location.origin
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          userId,
          notification
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Store in-app notification
  async storeInAppNotification(userId, notification) {
    try {
      await addDoc(collection(this.db, 'users', userId, 'notifications'), {
        ...notification,
        timestamp: new Date(),
        read: false
      });
    } catch (error) {
      console.error('Error storing in-app notification:', error);
      throw error;
    }
  }

  // Listen for incoming push notifications
  async onPushNotification(callback) {
    if (!this.messagingSupported || !this.messaging) {
      console.log('Push notifications are not supported in this browser');
      return () => {}; // Return a no-op unsubscribe function
    }
    
    try {
      const { onMessage } = await messagingModule;
      return onMessage(this.messaging, (payload) => {
        callback(payload);
      });
    } catch (error) {
      console.error('Error setting up push notification listener:', error);
      return () => {}; // Return a no-op unsubscribe function
    }
  }
}

export const notificationsService = new NotificationsService();
