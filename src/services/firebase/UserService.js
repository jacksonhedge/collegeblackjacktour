import { db, auth } from './config';
import { doc, updateDoc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

class UserService {
  static async getAllUsers() {
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('User must be authenticated to access admin data');
      }

      // Get the ID token result to check admin claim
      const tokenResult = await auth.currentUser.getIdTokenResult();
      if (!tokenResult.claims.admin) {
        throw new Error('User must be an admin to access this data');
      }

      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const users = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        try {
          const userData = docSnapshot.data();
          
          // Get user's balances from subwallets collection
          let totalCashBalance = 0;
          let totalBonusBalance = 0;
          const subwalletsRef = collection(db, "users", docSnapshot.id, "subwallets");
          const subwalletsSnapshot = await getDocs(subwalletsRef);
          
          subwalletsSnapshot.forEach(subwallet => {
            const { balance = 0, bonusBalance = 0 } = subwallet.data();
            totalCashBalance += Number(balance) || 0;
            totalBonusBalance += Number(bonusBalance) || 0;
          });

          // Get user's leagues from all providers
          let leagues = [];
          // Sleeper leagues
          const sleeperLeaguesRef = collection(db, "users", docSnapshot.id, "sleeper_leagues");
          const sleeperLeaguesSnapshot = await getDocs(sleeperLeaguesRef);
          leagues = leagues.concat(sleeperLeaguesSnapshot.docs.map(doc => doc.data()));
          
          // ESPN leagues
          const espnLeaguesRef = collection(db, "users", docSnapshot.id, "espn_leagues");
          const espnLeaguesSnapshot = await getDocs(espnLeaguesRef);
          leagues = leagues.concat(espnLeaguesSnapshot.docs.map(doc => doc.data()));
          
          // Yahoo leagues
          const yahooLeaguesRef = collection(db, "users", docSnapshot.id, "yahoo_leagues");
          const yahooLeaguesSnapshot = await getDocs(yahooLeaguesRef);
          leagues = leagues.concat(yahooLeaguesSnapshot.docs.map(doc => doc.data()));

          // Get user's friends
          const friendsRef = collection(db, "users", docSnapshot.id, "friends");
          const friendsSnapshot = await getDocs(friendsRef);
          const friends = friendsSnapshot.docs.map(doc => doc.data());

          // Get user's referrals
          const referralsRef = collection(db, "users", docSnapshot.id, "referrals");
          const referralsSnapshot = await getDocs(referralsRef);
          const referrals = referralsSnapshot.docs.map(doc => doc.data());

          users.push({
            id: docSnapshot.id,
            ...userData,
            totalCashBalance,
            totalBonusBalance,
            leagues,
            friends,
            referrals
          });
        } catch (error) {
          console.error(`Error processing user ${docSnapshot.id}:`, error);
          // Continue with next user instead of breaking the entire loop
          continue;
        }
      }
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  static async updateMeldCustomerId(userId, meldCustomerId) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        meldCustomerId,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating Meld customer ID:', error);
      throw error;
    }
  }

  static async initializeUserIfNeeded(userId) {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          createdAt: new Date().toISOString(),
          lastSpinTime: null
        });
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  }

  static async updateLastSpinTime(userId) {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await this.initializeUserIfNeeded(userId);
      }
      
      await updateDoc(userRef, {
        lastSpinTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating last spin time:', error);
      throw error;
    }
  }

  static async getLastSpinTime(userId) {
    try {
      await this.initializeUserIfNeeded(userId);
      
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data().lastSpinTime;
      }
      return null;
    } catch (error) {
      console.error('Error getting last spin time:', error);
      throw error;
    }
  }

  static canUserSpin(lastSpinTime) {
    if (!lastSpinTime) return true;
    
    const lastSpin = new Date(lastSpinTime);
    const now = new Date();
    const hoursSinceLastSpin = (now - lastSpin) / (1000 * 60 * 60);
    
    return hoursSinceLastSpin >= 24;
  }

  static async searchUsers(query) {
    try {
      const lowercaseQuery = query.toLowerCase();
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const user = {
          uid: doc.id,
          ...userData
        };
        
        // Search by displayName, email, or phone number
        const displayNameMatch = user.displayName?.toLowerCase().includes(lowercaseQuery);
        const emailMatch = user.email?.toLowerCase().includes(lowercaseQuery);
        const phoneMatch = user.phoneNumber?.includes(query); // Phone numbers might have formatting
        
        if (displayNameMatch || emailMatch || phoneMatch) {
          users.push(user);
        }
      });
      
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
}

export default UserService;
