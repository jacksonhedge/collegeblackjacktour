import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { yahooLeagueService } from '../services/firebase/YahooLeagueService';
import { userPlatformsService } from '../services/firebase/UserPlatformsService';

const YahooContext = createContext();

export const useYahoo = () => {
  const context = useContext(YahooContext);
  if (!context) {
    throw new Error('useYahoo must be used within a YahooProvider');
  }
  return context;
};

export const YahooProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yahooConnection, setYahooConnection] = useState(null);

  // Fetch Yahoo connection details
  useEffect(() => {
    if (!currentUser) {
      setYahooConnection(null);
      return;
    }

    const fetchYahooConnection = async () => {
      try {
        const connection = await userPlatformsService.getPlatformConnection(currentUser.uid, 'yahoo');
        setYahooConnection(connection);
      } catch (err) {
        console.error('Error fetching Yahoo connection:', err);
      }
    };

    fetchYahooConnection();
  }, [currentUser]);

  // Fetch leagues when we have Yahoo connection
  useEffect(() => {
    if (!currentUser || !yahooConnection?.userId) {
      setLeagues([]);
      setLoading(false);
      return;
    }

    const fetchLeagues = async () => {
      try {
        setError(null);
        setLoading(true);
        const userLeagues = await yahooLeagueService.getUserLeagues(currentUser.uid);
        setLeagues(userLeagues);
      } catch (err) {
        console.error('Error fetching Yahoo leagues:', err);
        setError('Failed to load leagues');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [currentUser, yahooConnection]);

  const connectYahoo = async (yahooId, accessToken) => {
    try {
      // Save the connection details
      await userPlatformsService.savePlatformConnection(currentUser.uid, 'yahoo', {
        userId: yahooId,
        accessToken: accessToken,
        connectedAt: new Date().toISOString()
      });

      // Update local state
      setYahooConnection({
        userId: yahooId,
        accessToken: accessToken,
        connectedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error connecting Yahoo account:', error);
      throw error;
    }
  };

  const value = {
    leagues,
    loading,
    error,
    yahooConnection,
    connectYahoo
  };

  return (
    <YahooContext.Provider value={value}>
      {children}
    </YahooContext.Provider>
  );
};

export default YahooContext;
