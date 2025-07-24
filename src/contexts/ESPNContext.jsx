import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { espnLeagueService } from '../services/firebase/ESPNLeagueService';
import { userPlatformsService } from '../services/firebase/UserPlatformsService';

const ESPNContext = createContext();

export const useESPN = () => {
  const context = useContext(ESPNContext);
  if (!context) {
    throw new Error('useESPN must be used within an ESPNProvider');
  }
  return context;
};

export const ESPNProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [espnConnection, setESPNConnection] = useState(null);

  // Fetch ESPN connection details
  useEffect(() => {
    if (!currentUser) {
      setESPNConnection(null);
      return;
    }

    const fetchESPNConnection = async () => {
      try {
        const connection = await userPlatformsService.getPlatformConnection(currentUser.uid, 'espn');
        setESPNConnection(connection);
      } catch (err) {
        console.error('Error fetching ESPN connection:', err);
      }
    };

    fetchESPNConnection();
  }, [currentUser]);

  // Fetch leagues when we have ESPN connection
  useEffect(() => {
    if (!currentUser || !espnConnection?.userId) {
      setLeagues([]);
      setLoading(false);
      return;
    }

    const fetchLeagues = async () => {
      try {
        setError(null);
        setLoading(true);
        const userLeagues = await espnLeagueService.getLeaguesByUserId(currentUser.uid);
        setLeagues(userLeagues);
      } catch (err) {
        console.error('Error fetching ESPN leagues:', err);
        setError('Failed to load leagues');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [currentUser, espnConnection]);

  const connectESPN = async (espnId) => {
    try {
      // Save the connection details
      await userPlatformsService.savePlatformConnection(currentUser.uid, 'espn', {
        userId: espnId,
        connectedAt: new Date().toISOString()
      });

      // Update local state
      setESPNConnection({
        userId: espnId,
        connectedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error connecting ESPN account:', error);
      throw error;
    }
  };

  const value = {
    leagues,
    loading,
    error,
    espnConnection,
    connectESPN
  };

  return (
    <ESPNContext.Provider value={value}>
      {children}
    </ESPNContext.Provider>
  );
};

export default ESPNContext;
