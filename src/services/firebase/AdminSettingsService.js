import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  limit, 
  addDoc, 
  serverTimestamp, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './config';

const ADMIN_SETTINGS_COLLECTION = 'adminSettings';
const NOTIFICATIONS_COLLECTION = 'notifications';
const NOTIFICATION_RULES_COLLECTION = 'notificationRules';

export const adminSettingsService = {
  // Save admin settings for a specific user
  saveAdminSettings: async (userId, settings) => {
    try {
      const userSettingsRef = doc(db, ADMIN_SETTINGS_COLLECTION, userId);
      await setDoc(userSettingsRef, settings, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error saving admin settings:', error);
      throw error;
    }
  },

  // Get admin settings for a specific user
  getAdminSettings: async (userId) => {
    try {
      const userSettingsRef = doc(db, ADMIN_SETTINGS_COLLECTION, userId);
      const settingsDoc = await getDoc(userSettingsRef);
      return settingsDoc.exists() ? settingsDoc.data() : {};
    } catch (error) {
      console.error('Error getting admin settings:', error);
      throw error;
    }
  },

  // Get all users (for admin panel)
  getAllUsers: async () => {
    try {
      console.log('Fetching all users for admin panel');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.(),
          lastSeen: data.lastSeen instanceof Date ? data.lastSeen : data.lastSeen?.toDate?.()
        };
      });
    } catch (error) {
      console.error('Error fetching users for admin panel:', error);
      throw error;
    }
  },

  // Get users with pagination and filtering
  getUsers: async (options = {}) => {
    try {
      const { sortBy = 'createdAt', sortDirection = 'desc', limit: userLimit = 50, filter = null } = options;
      
      const usersRef = collection(db, 'users');
      let q = query(usersRef, orderBy(sortBy, sortDirection), limit(userLimit));
      
      // Apply additional filters if provided
      if (filter && filter.field && filter.value) {
        q = query(q, where(filter.field, filter.operator || '==', filter.value));
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.(),
          lastSeen: data.lastSeen instanceof Date ? data.lastSeen : data.lastSeen?.toDate?.()
        };
      });
    } catch (error) {
      console.error('Error fetching filtered users:', error);
      throw error;
    }
  },

  // Get admin dashboard stats
  getAdminStats: async () => {
    try {
      // Get all users
      const users = await adminSettingsService.getAllUsers();
      
      // Calculate stats from users data
      const stats = {
        totalUsers: users.length,
        totalReferrals: users.reduce((acc, user) => acc + (user.referrals?.length || 0), 0),
        totalLeagues: users.reduce((acc, user) => acc + (user.leagues?.length || 0), 0),
        emailSubscribed: users.filter(user => user.emailSubscribed).length,
        activePlatforms: {}
      };
      
      // Calculate platform connections
      users.forEach(user => {
        if (user.platformConnections) {
          Object.keys(user.platformConnections).forEach(platform => {
            if (!stats.activePlatforms[platform]) {
              stats.activePlatforms[platform] = 0;
            }
            stats.activePlatforms[platform]++;
          });
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw error;
    }
  },
  
  // Notification Management
  
  // Get notifications history
  getNotificationsHistory: async (options = {}) => {
    try {
      const { limit: notificationLimit = 100, type = null } = options;
      
      const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
      let q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(notificationLimit));
      
      // Filter by notification type if specified
      if (type) {
        q = query(q, where('type', '==', type));
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.(),
          sentAt: data.sentAt?.toDate?.(),
          scheduledFor: data.scheduledFor?.toDate?.()
        };
      });
    } catch (error) {
      console.error('Error fetching notifications history:', error);
      return []; // Return empty array instead of throwing
    }
  },
  
  // Create a new notification
  createNotification: async (notificationData) => {
    try {
      const { title, body, type, recipientType, recipientIds, scheduled, sendAt } = notificationData;
      
      // Basic validation
      if (!title || !body || !type) {
        throw new Error('Missing required notification fields');
      }
      
      // Create notification document
      const notificationDoc = {
        title,
        body,
        type,
        recipientType,
        status: scheduled ? 'scheduled' : 'pending',
        createdAt: serverTimestamp()
      };
      
      // Add recipient info
      if (recipientType === 'individual') {
        notificationDoc.recipientIds = recipientIds || [];
      }
      
      // Add scheduling info if applicable
      if (scheduled && sendAt) {
        notificationDoc.scheduled = true;
        notificationDoc.scheduledFor = new Date(sendAt);
      } else {
        // If not scheduled, mark as ready to send
        notificationDoc.scheduledFor = serverTimestamp();
      }
      
      // Add to notifications collection
      const notificationRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationDoc);
      
      // If not scheduled, trigger immediate sending (this would be handled by a Cloud Function)
      if (!scheduled) {
        // For now, just update the status - in a real implementation, this would call the notification sending service
        await updateDoc(notificationRef, {
          status: 'sent',
          sentAt: serverTimestamp()
        });
      }
      
      return { 
        id: notificationRef.id,
        ...notificationDoc
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
  
  // Notification Rules Management
  
  // Get all notification rules
  getNotificationRules: async () => {
    try {
      const rulesRef = collection(db, NOTIFICATION_RULES_COLLECTION);
      const q = query(rulesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.(),
        updatedAt: doc.data().updatedAt?.toDate?.()
      }));
    } catch (error) {
      console.error('Error fetching notification rules:', error);
      return []; // Return empty array instead of throwing
    }
  },
  
  // Create a new notification rule
  createNotificationRule: async (ruleData) => {
    try {
      const { event, notificationType, templateName, description, active = true } = ruleData;
      
      // Basic validation
      if (!event || !notificationType) {
        throw new Error('Missing required rule fields');
      }
      
      // Create rule document
      const ruleDoc = {
        event,
        notificationType,
        templateName: templateName || null,
        description: description || `Send ${notificationType} notifications for ${event} events`,
        active,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add to rules collection
      const ruleRef = await addDoc(collection(db, NOTIFICATION_RULES_COLLECTION), ruleDoc);
      
      return { 
        id: ruleRef.id,
        ...ruleDoc
      };
    } catch (error) {
      console.error('Error creating notification rule:', error);
      throw error;
    }
  },
  
  // Update an existing notification rule
  updateNotificationRule: async (ruleId, ruleData) => {
    try {
      const ruleRef = doc(db, NOTIFICATION_RULES_COLLECTION, ruleId);
      
      // Remove id field if present
      const { id, ...ruleDataWithoutId } = ruleData;
      
      // Always update the updatedAt timestamp
      const updateData = {
        ...ruleDataWithoutId,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(ruleRef, updateData);
      
      return {
        id: ruleId,
        ...updateData
      };
    } catch (error) {
      console.error(`Error updating notification rule ${ruleId}:`, error);
      throw error;
    }
  },
  
  // Delete a notification rule
  deleteNotificationRule: async (ruleId) => {
    try {
      const ruleRef = doc(db, NOTIFICATION_RULES_COLLECTION, ruleId);
      await deleteDoc(ruleRef);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting notification rule ${ruleId}:`, error);
      throw error;
    }
  }
};

// For backwards compatibility
export const saveAdminSettings = adminSettingsService.saveAdminSettings;
export const getAdminSettings = adminSettingsService.getAdminSettings;
