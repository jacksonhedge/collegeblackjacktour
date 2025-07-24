import { db } from './config.js';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

class SleeperLeagueService {
  constructor() {
    this.sleeperLeaguesCollection = collection(db, 'sleeper_leagues');
  }

  async storeLeague(userId, league, users) {
    try {
      console.log('Storing league with data:', {
        userId,
        leagueId: league.league_id,
        totalUsers: users.length
      });

      const commissioner = users.find(u => u.is_owner);
      console.log('Found commissioner:', commissioner);
      
      // Create commissioner data with null checks
      const commissionerData = commissioner ? {
        userId: commissioner.user_id || null,
        displayName: commissioner.display_name || null,
        username: commissioner.username || null,
        avatar: commissioner.avatar || null
      } : null;
      console.log('Formatted commissioner data:', commissionerData);

      // Create user data with null checks
      const userData = users.map(user => {
        const formattedUser = {
          userId: user.user_id || null,
          displayName: user.display_name || null,
          username: user.username || null,
          avatar: user.avatar || null,
          isCommissioner: Boolean(user.is_owner)
        };
        console.log('Formatted user data:', formattedUser);
        return formattedUser;
      });
      
      // Store in Firebase with additional metadata
      const leagueData = {
        userId: userId,
        leagueId: league.league_id,
        name: league.name || null,
        season: league.season || null,
        totalRosters: league.total_rosters || 0,
        avatar: league.avatar || null,
        commissioner: commissionerData,
        users: userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Final league data to store:', leagueData);

      // Use league_id as document ID
      const docRef = doc(this.sleeperLeaguesCollection, league.league_id.toString());
      await setDoc(docRef, leagueData);
      
      console.log('Successfully stored league:', league.league_id);
      return leagueData;
    } catch (error) {
      console.error('Error storing Sleeper league:', error);
      console.error('Error details:', {
        error: error.message,
        code: error.code,
        userId,
        leagueId: league?.league_id,
        usersLength: users?.length
      });
      throw error;
    }
  }

  async getLeaguesByUserId(userId) {
    try {
      console.log('Fetching leagues for user:', userId);
      const q = query(
        this.sleeperLeaguesCollection, 
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const leagues = querySnapshot.docs.map(doc => doc.data());
      console.log('Found leagues:', leagues.length);
      return leagues;
    } catch (error) {
      console.error('Error getting Sleeper leagues:', error);
      throw error;
    }
  }

  async getLeague(leagueId) {
    try {
      console.log('Fetching league:', leagueId);
      const docRef = doc(this.sleeperLeaguesCollection, leagueId.toString());
      const leagueDoc = await getDoc(docRef);
      if (!leagueDoc.exists()) {
        console.log('League not found:', leagueId);
        return null;
      }
      console.log('Found league:', leagueId);
      return leagueDoc.data();
    } catch (error) {
      console.error('Error getting Sleeper league:', error);
      throw error;
    }
  }
}

export const sleeperLeagueService = new SleeperLeagueService();
