import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

class UserPlatformsService {
  async saveSelectedPlatforms(userId, platforms) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          id: userId,
          selectedPlatforms: [],
          platformConnections: {},
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      }

      // Get current user data
      const currentData = userDoc.exists() ? userDoc.data() : {};

      // Update only the selectedPlatforms field and lastUpdated timestamp
      await updateDoc(userRef, {
        selectedPlatforms: platforms.map(platform => ({
          id: platform.id,
          name: platform.name,
          logo: platform.logo,
          value: platform.value
        })),
        lastUpdated: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error saving selected platforms:', error);
      throw error;
    }
  }

  async getSelectedPlatforms(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.selectedPlatforms || [];
      }

      // If user document doesn't exist, create it with empty platforms
      await setDoc(userRef, {
        id: userId,
        selectedPlatforms: [],
        platformConnections: {},
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      
      return [];
    } catch (error) {
      console.error('Error getting selected platforms:', error);
      throw error;
    }
  }

  async savePlatformConnection(userId, platform, connectionDetails) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          id: userId,
          selectedPlatforms: [],
          platformConnections: {
            [platform]: connectionDetails
          },
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
        return;
      }

      const userData = userDoc.data();
      await updateDoc(userRef, {
        platformConnections: {
          ...(userData.platformConnections || {}),
          [platform]: connectionDetails
        },
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving platform connection:', error);
      throw error;
    }
  }

  async getPlatformConnection(userId, platform) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return userData.platformConnections?.[platform] || null;
    } catch (error) {
      console.error('Error getting platform connection:', error);
      throw error;
    }
  }
}

// Export an instance of the service
export const userPlatformsService = new UserPlatformsService();
