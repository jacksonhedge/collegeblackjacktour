import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';

class AdminDataService {
  static async fetchAllUsers(onProgress = () => {}) {
    try {
      onProgress('Fetching user list...');
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      
      const totalUsers = querySnapshot.docs.length;
      onProgress(`Found ${totalUsers} users. Processing data...`);
      
      // Process all users in parallel
      const userPromises = querySnapshot.docs.map(async (doc, index) => {
        try {
          const userDoc = doc.data();
          const user = {
            ...userDoc,
            id: doc.id,
            totalCashBalance: 0,
            totalBonusBalance: userDoc.bonusBalance || 0, // Include main bonus balance
            leagues: [],
            friends: [],
            referrals: [],
            signupDate: userDoc.createdAt ? 
              (typeof userDoc.createdAt.toDate === 'function' ? 
                userDoc.createdAt.toDate().toLocaleString() : 
                new Date(userDoc.createdAt).toLocaleString()) : 'N/A',
            lastLoginDate: userDoc.lastLoginAt ? 
              (typeof userDoc.lastLoginAt.toDate === 'function' ? 
                userDoc.lastLoginAt.toDate().toLocaleString() : 
                new Date(userDoc.lastLoginAt).toLocaleString()) : 'N/A'
          };

          // Get subwallets
          try {
            // Get subwallets from the user document directly since they're stored in a map
            const subwallets = userDoc.subWallets || {};
            Object.values(subwallets).forEach(subwallet => {
              const { balance = 0, totalBonusBalance = 0 } = subwallet;
              user.totalCashBalance += Number(balance) || 0;
              user.totalBonusBalance += Number(totalBonusBalance) || 0; // Add subwallet bonus balance
            });
          } catch (error) {
            console.warn(`Error fetching subwallets for user ${doc.id}:`, error);
          }

          // Fetch leagues, friends, and referrals in parallel
          const [leagues, friends, referrals] = await Promise.all([
            // Get leagues from all sources in parallel
            Promise.all(['sleeper_leagues', 'espn_leagues', 'yahoo_leagues'].map(async (type) => {
              try {
                const leaguesRef = collection(db, "users", doc.id, type);
                const leaguesSnapshot = await getDocs(leaguesRef);
                return leaguesSnapshot.docs.map(doc => doc.data());
              } catch (error) {
                console.warn(`Error fetching ${type} for user ${doc.id}:`, error);
                return [];
              }
            })).then(leagueArrays => leagueArrays.flat()),
            
            // Get friends
            (async () => {
              try {
                const friendsRef = collection(db, "users", doc.id, "friends");
                const friendsSnapshot = await getDocs(friendsRef);
                return friendsSnapshot.docs.map(doc => doc.data());
              } catch (error) {
                console.warn(`Error fetching friends for user ${doc.id}:`, error);
                return [];
              }
            })(),
            
            // Get referrals
            (async () => {
              try {
                const referralsRef = collection(db, "users", doc.id, "referrals");
                const referralsSnapshot = await getDocs(referralsRef);
                return referralsSnapshot.docs.map(doc => doc.data());
              } catch (error) {
                console.warn(`Error fetching referrals for user ${doc.id}:`, error);
                return [];
              }
            })()
          ]);

          user.leagues = leagues;
          user.friends = friends;
          user.referrals = referrals;

          onProgress(`Processing user ${index + 1} of ${totalUsers}`);
          return user;
        } catch (error) {
          console.error(`Error processing user ${doc.id}:`, error);
          // Return user with basic data if there's an error
          const errorUserDoc = doc.data();
          return {
            ...errorUserDoc,
            id: doc.id,
            totalCashBalance: 0,
            totalBonusBalance: 0,
            leagues: [],
            friends: [],
            referrals: [],
            signupDate: errorUserDoc.createdAt ? 
              (typeof errorUserDoc.createdAt.toDate === 'function' ? 
                errorUserDoc.createdAt.toDate().toLocaleString() : 
                new Date(errorUserDoc.createdAt).toLocaleString()) : 'N/A',
            lastLoginDate: errorUserDoc.lastLoginAt ? 
              (typeof errorUserDoc.lastLoginAt.toDate === 'function' ? 
                errorUserDoc.lastLoginAt.toDate().toLocaleString() : 
                new Date(errorUserDoc.lastLoginAt).toLocaleString()) : 'N/A'
          };
        }
      });

      onProgress('Finalizing user data...');
      const users = await Promise.all(userPromises);
      
      // Sort users by join date (most recent first)
      // First, separate users with valid and invalid dates
      const validUsers = [];
      const invalidUsers = [];
      
      users.forEach(user => {
        const getTimestamp = (user) => {
          if (!user.createdAt) return null;
          try {
            // Handle Firestore Timestamp
            if (typeof user.createdAt.toDate === 'function') {
              return user.createdAt.toDate().getTime();
            }
            // Handle seconds timestamp
            if (user.createdAt.seconds) {
              return user.createdAt.seconds * 1000;
            }
            // Handle ISO string or other date format
            const date = new Date(user.createdAt);
            return isNaN(date.getTime()) ? null : date.getTime();
          } catch (error) {
            return null;
          }
        };

        const timestamp = getTimestamp(user);
        if (timestamp === null) {
          invalidUsers.push(user);
        } else {
          validUsers.push({ ...user, _timestamp: timestamp });
        }
      });

      // Sort valid users by timestamp (most recent first)
      const sortedValidUsers = validUsers.sort((a, b) => b._timestamp - a._timestamp);

      // Remove the temporary _timestamp field
      sortedValidUsers.forEach(user => delete user._timestamp);

      // Combine sorted valid users with invalid users at the bottom
      const sortedUsers = [...sortedValidUsers, ...invalidUsers];

      onProgress('Sorting users by join date...');
      console.log(`Successfully processed ${sortedUsers.length} users`);
      return sortedUsers;
    } catch (error) {
      console.error('Error in fetchAllUsers:', error);
      throw new Error('Failed to fetch user data. Please try again.');
    }
  }
}

export default AdminDataService;
