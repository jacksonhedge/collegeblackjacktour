import React, { createContext, useContext, useState, useEffect } from 'react';
import { SleeperService } from '../services/sleeper/SleeperService';

const SleeperContext = createContext();

export const useSleeperContext = () => {
  const context = useContext(SleeperContext);
  if (!context) {
    throw new Error('useSleeperContext must be used within a SleeperProvider');
  }
  return context;
};

export const SleeperProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sleeperUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [leagues, setLeagues] = useState(() => {
    const savedLeagues = localStorage.getItem('sleeperLeagues');
    return savedLeagues ? JSON.parse(savedLeagues) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Save user and leagues to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem('sleeperUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('sleeperUser');
    }
  }, [user]);

  useEffect(() => {
    if (leagues.length > 0) {
      localStorage.setItem('sleeperLeagues', JSON.stringify(leagues));
    } else {
      localStorage.removeItem('sleeperLeagues');
    }
  }, [leagues]);

  const fetchUser = async (username) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const userData = await SleeperService.getUser(username);
      setUser(userData);
      // After fetching user, get their leagues
      const leaguesData = await SleeperService.getUserLeagues(userData.user_id);
      setLeagues(leaguesData);
    } catch (error) {
      setErrorMessage('Failed to find Sleeper user');
      console.error('Error fetching Sleeper user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectSleeper = () => {
    setUser(null);
    setLeagues([]);
    localStorage.removeItem('sleeperUser');
    localStorage.removeItem('sleeperLeagues');
  };

  const value = {
    user,
    leagues,
    isLoading,
    errorMessage,
    fetchUser,
    disconnectSleeper
  };

  return (
    <SleeperContext.Provider value={value}>
      {children}
    </SleeperContext.Provider>
  );
};

export default SleeperProvider;
