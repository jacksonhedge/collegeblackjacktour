import { db } from './config.js';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

class ESPNLeagueService {
  constructor() {
    this.espnLeaguesCollection = collection(db, 'espn_leagues');
  }

  async storeLeague(userId, league) {
    try {
      console.log('Storing ESPN league with data:', {
        userId,
        leagueId: league.id,
        leagueSize: league.leagueSize
      });
      
      // Store in Firebase with metadata
      const leagueData = {
        userId: userId,
        leagueId: league.id,
        name: league.name || null,
        season: '2023', // Can be made dynamic later
        leagueSize: league.leagueSize || 0,
        isCommissioner: league.isCommissioner || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Final ESPN league data to store:', leagueData);

      // Use league id as document ID
      const docRef = doc(this.espnLeaguesCollection, league.id.toString());
      await setDoc(docRef, leagueData);
      
      console.log('Successfully stored ESPN league:', league.id);
      return leagueData;
    } catch (error) {
      console.error('Error storing ESPN league:', error);
      console.error('Error details:', {
        error: error.message,
        code: error.code,
        userId,
        leagueId: league?.id
      });
      throw error;
    }
  }

  async getLeaguesByUserId(userId) {
    try {
      console.log('Fetching ESPN leagues for user:', userId);
      const q = query(
        this.espnLeaguesCollection, 
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const leagues = querySnapshot.docs.map(doc => doc.data());
      console.log('Found ESPN leagues:', leagues.length);
      return leagues;
    } catch (error) {
      console.error('Error getting ESPN leagues:', error);
      throw error;
    }
  }

  async getLeague(leagueId) {
    try {
      console.log('Fetching ESPN league:', leagueId);
      const docRef = doc(this.espnLeaguesCollection, leagueId.toString());
      const leagueDoc = await getDoc(docRef);
      if (!leagueDoc.exists()) {
        console.log('ESPN league not found:', leagueId);
        return null;
      }
      console.log('Found ESPN league:', leagueId);
      return leagueDoc.data();
    } catch (error) {
      console.error('Error getting ESPN league:', error);
      throw error;
    }
  }
}

export const espnLeagueService = new ESPNLeagueService();
