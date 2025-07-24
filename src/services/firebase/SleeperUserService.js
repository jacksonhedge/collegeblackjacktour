import { db } from './config.js';
import { collection, doc, setDoc, getDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { sleeperService } from '../sleeper/SleeperService';
import { getAuth } from 'firebase/auth';

class SleeperUserService {
  constructor() {
    this.auth = getAuth();
    this.sleeperUsersCollection = collection(db, 'sleeper_users');
  }

  async storeSleeperUser(userId, sleeperUsername) {
    try {
      // Check authentication
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to store Sleeper data');
      }

      // Verify the user is storing their own data
      if (currentUser.uid !== userId) {
        throw new Error('User can only store their own Sleeper data');
      }

      // First get the Sleeper user data
      const sleeperUser = await sleeperService.getUser(sleeperUsername);
      
      // Store in Firebase with additional metadata
      const sleeperUserData = {
        userId: userId,
        sleeperUsername: sleeperUsername,
        sleeperId: sleeperUser.user_id,
        displayName: sleeperUser.display_name,
        avatarId: sleeperUser.avatar,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(this.sleeperUsersCollection, userId), sleeperUserData);
      return sleeperUserData;
    } catch (error) {
      console.error('Error storing Sleeper user:', error);
      throw error;
    }
  }

  async getSleeperUser(userId) {
    try {
      // Check authentication
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to get Sleeper data');
      }

      // Users can only access their own data unless they're an admin
      // Admin check would go here if needed

      const userDoc = await getDoc(doc(this.sleeperUsersCollection, userId));
      if (!userDoc.exists()) {
        return null;
      }
      return userDoc.data();
    } catch (error) {
      console.error('Error getting Sleeper user:', error);
      throw error;
    }
  }

  async findBySleeperUsername(sleeperUsername) {
    try {
      // Check authentication
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to search Sleeper data');
      }

      const q = query(
        this.sleeperUsersCollection, 
        where('sleeperUsername', '==', sleeperUsername)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }
      return querySnapshot.docs[0].data();
    } catch (error) {
      console.error('Error finding Sleeper user:', error);
      throw error;
    }
  }

  async deleteSleeperUser(userId) {
    try {
      // Check authentication
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to delete Sleeper data');
      }

      // Verify the user is deleting their own data
      if (currentUser.uid !== userId) {
        throw new Error('User can only delete their own Sleeper data');
      }

      await deleteDoc(doc(this.sleeperUsersCollection, userId));
    } catch (error) {
      console.error('Error deleting Sleeper user:', error);
      throw error;
    }
  }
}

export const sleeperUserService = new SleeperUserService();
