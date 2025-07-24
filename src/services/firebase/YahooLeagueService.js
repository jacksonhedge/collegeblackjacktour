import { db } from './config.js';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

class YahooLeagueService {
  constructor() {
    this.yahooLeaguesCollection = collection(db, 'yahoo_leagues');
  }

  async storeLeague(userId, league) {
    try {
      console.log('Storing Yahoo league with data:', {
        userId,
        leagueId: league.id,
        leagueSize: league.leagueSize
      });
      
      // Store in Firebase with metadata
      const leagueData = {
        id: league.id.toString(), // Ensure id is a string
        userId: userId,
        leagueId: league.id.toString(),
        name: league.name || 'Yahoo Fantasy League',
        season: '2023', // Can be made dynamic later
        leagueSize: league.leagueSize || 0,
        isCommissioner: league.isCommissioner || false,
        buyInAmount: league.buyInAmount || 0,
        payouts: {
          first: league.payouts?.first || 0,
          second: league.payouts?.second || 0,
          third: league.payouts?.third || 0,
          fourth: league.payouts?.fourth || 0
        },
        wantToInvest: league.wantToInvest || false,
        convertToSleeper: league.convertToSleeper || false,
        bountyToLeaguePot: league.bountyToLeaguePot || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Final Yahoo league data to store:', leagueData);

      // Use league id as document ID
      const docRef = doc(this.yahooLeaguesCollection, league.id.toString());
      await setDoc(docRef, leagueData);
      
      console.log('Successfully stored Yahoo league:', league.id);
      return leagueData;
    } catch (error) {
      console.error('Error storing Yahoo league:', error);
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
      console.log('Fetching Yahoo leagues for user:', userId);
      const q = query(
        this.yahooLeaguesCollection, 
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const leagues = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id, // Ensure id is set from the document id
          leagueId: doc.id, // Also set leagueId for consistency
          name: data.name || 'Yahoo Fantasy League',
          leagueSize: data.leagueSize || 0,
          buyInAmount: data.buyInAmount || 0,
          payouts: {
            first: data.payouts?.first || 0,
            second: data.payouts?.second || 0,
            third: data.payouts?.third || 0,
            fourth: data.payouts?.fourth || 0
          },
          wantToInvest: data.wantToInvest || false,
          convertToSleeper: data.convertToSleeper || false,
          bountyToLeaguePot: data.bountyToLeaguePot || false
        };
      });
      console.log('Found Yahoo leagues:', leagues.length);
      return leagues;
    } catch (error) {
      console.error('Error getting Yahoo leagues:', error);
      throw error;
    }
  }

  async getLeague(leagueId) {
    try {
      console.log('Fetching Yahoo league:', leagueId);
      const docRef = doc(this.yahooLeaguesCollection, leagueId.toString());
      const leagueDoc = await getDoc(docRef);
      if (!leagueDoc.exists()) {
        console.log('Yahoo league not found:', leagueId);
        return null;
      }
      const data = leagueDoc.data();
      console.log('Found Yahoo league:', leagueId);
      return {
        ...data,
        id: leagueDoc.id, // Ensure id is set from the document id
        leagueId: leagueDoc.id, // Also set leagueId for consistency
        name: data.name || 'Yahoo Fantasy League',
        leagueSize: data.leagueSize || 0,
        buyInAmount: data.buyInAmount || 0,
        payouts: {
          first: data.payouts?.first || 0,
          second: data.payouts?.second || 0,
          third: data.payouts?.third || 0,
          fourth: data.payouts?.fourth || 0
        },
        wantToInvest: data.wantToInvest || false,
        convertToSleeper: data.convertToSleeper || false,
        bountyToLeaguePot: data.bountyToLeaguePot || false
      };
    } catch (error) {
      console.error('Error getting Yahoo league:', error);
      throw error;
    }
  }
}

export const yahooLeagueService = new YahooLeagueService();
