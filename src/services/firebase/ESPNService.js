import { db, auth } from './config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc
} from 'firebase/firestore';

class ESPNService {
  constructor() {
    this.leaguesCollection = collection(db, 'espn_leagues');
  }

  async getLeaguesByUserId(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required to fetch leagues');
      }

      const q = query(
        this.leaguesCollection,
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting ESPN leagues:', error);
      throw error;
    }
  }

  async createLeague(leagueData) {
    try {
      // Wait for auth to be initialized
      await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      });

      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('User must be authenticated to create a league');
      }

      // Validate required fields
      if (!leagueData.name?.trim()) {
        throw new Error('League name is required');
      }

      // Log authentication state
      console.log('Current user:', auth.currentUser.uid);
      console.log('League data userId:', leagueData.userId);

      // Ensure userId matches the authenticated user
      if (leagueData.userId !== auth.currentUser.uid) {
        throw new Error('League userId must match authenticated user');
      }

      // Validate and format the data according to security rules
      const formattedData = {
        userId: auth.currentUser.uid,
        platform: 'espn',
        status: leagueData.status || 'pending',
        createdAt: new Date().toISOString(),
        name: leagueData.name.trim(),
        isCommissioner: Boolean(leagueData.isCommissioner),
        leagueSize: Number(leagueData.leagueSize),
        hasBuyIn: Boolean(leagueData.hasBuyIn),
        buyInAmount: Number(leagueData.buyInAmount || 0),
        payouts: {
          first: Number(leagueData.payouts?.first || 0),
          second: Number(leagueData.payouts?.second || 0),
          third: Number(leagueData.payouts?.third || 0),
          fourth: Number(leagueData.payouts?.fourth || 0)
        },
        hasWeeklyPayouts: Boolean(leagueData.hasWeeklyPayouts),
        weeklyPayoutDetails: leagueData.weeklyPayoutDetails || '',
        wantToInvest: Boolean(leagueData.wantToInvest),
        invitedUsers: Array.isArray(leagueData.invitedUsers) ? leagueData.invitedUsers : [],
        convertToSleeper: leagueData.convertToSleeper || false,
        bountyToLeaguePot: leagueData.bountyToLeaguePot || false
      };

      // Log the formatted data
      console.log('Creating league with formatted data:', formattedData);

      // Create the league document
      const docRef = await addDoc(this.leaguesCollection, formattedData);

      // Verify the document was created
      const newDoc = await getDoc(docRef);
      if (!newDoc.exists()) {
        throw new Error('Failed to create league document');
      }

      return {
        id: docRef.id,
        ...formattedData
      };
    } catch (error) {
      console.error('Error creating ESPN league:', error);
      // Add more detailed error information
      if (error.code === 'permission-denied') {
        console.error('Permission denied. Current auth state:', {
          isAuthenticated: !!auth.currentUser,
          userId: auth.currentUser?.uid,
          attemptedUserId: leagueData?.userId
        });
      }
      throw error;
    }
  }

  async updateLeague(leagueId, updateData) {
    try {
      if (!auth.currentUser) {
        throw new Error('User must be authenticated to update a league');
      }

      const leagueRef = doc(db, 'espn_leagues', leagueId);
      const leagueDoc = await getDoc(leagueRef);

      if (!leagueDoc.exists()) {
        throw new Error('League not found');
      }

      if (leagueDoc.data().userId !== auth.currentUser.uid) {
        throw new Error('You do not have permission to update this league');
      }

      const formattedUpdate = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(leagueRef, formattedUpdate);
      
      return {
        id: leagueId,
        ...leagueDoc.data(),
        ...formattedUpdate
      };
    } catch (error) {
      console.error('Error updating ESPN league:', error);
      throw error;
    }
  }

  async deleteLeague(leagueId) {
    try {
      if (!auth.currentUser) {
        throw new Error('User must be authenticated to delete a league');
      }

      const leagueRef = doc(db, 'espn_leagues', leagueId);
      const leagueDoc = await getDoc(leagueRef);

      if (!leagueDoc.exists()) {
        throw new Error('League not found');
      }

      if (leagueDoc.data().userId !== auth.currentUser.uid) {
        throw new Error('You do not have permission to delete this league');
      }

      await deleteDoc(leagueRef);
      return true;
    } catch (error) {
      console.error('Error deleting ESPN league:', error);
      throw error;
    }
  }
}

export const espnService = new ESPNService();
