import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { dwollaService } from '../services/DwollaService';

const DwollaContext = createContext(null);

export const DwollaProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Changed initial state to false
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchDwollaBalance = async (silent = false) => {
    // Don't fetch if no user or no Dwolla ID
    if (!currentUser?.dwollaCustomerId) {
      if (!silent) {
        setError('No Dwolla account connected');
      }
      setBalance(0);
      setLoading(false);
      return;
    }

    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      
      const { balance: newBalance, error: balanceError } = await dwollaService.fetchBalance(currentUser.dwollaCustomerId);
      
      if (balanceError) {
        setError(balanceError);
        // Keep the previous balance if there's an error
      } else {
        setBalance(newBalance);
        setError(null);
      }
    } catch (error) {
      console.error('Error in DwollaContext:', error);
      setError('Unable to load balance');
      // Keep the previous balance on error
    } finally {
      setLoading(false);
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }
  };

  // Initial fetch when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      fetchDwollaBalance(true); // Silent initial fetch
    } else {
      setBalance(0);
      setError(null);
      setLoading(false);
      setIsInitialized(true);
    }
  }, [currentUser?.dwollaCustomerId]);

  // Set up periodic balance refresh (every 30 seconds)
  useEffect(() => {
    if (!currentUser?.dwollaCustomerId) return;

    const intervalId = setInterval(() => {
      fetchDwollaBalance(true); // Silent periodic fetch
    }, 30000);

    return () => clearInterval(intervalId);
  }, [currentUser?.dwollaCustomerId]);

  const value = {
    balance,
    error,
    loading,
    isInitialized,
    refreshBalance: () => fetchDwollaBalance(false), // Non-silent manual refresh
    clearError: () => setError(null)
  };

  return (
    <DwollaContext.Provider value={value}>
      {children}
    </DwollaContext.Provider>
  );
};

export const useDwolla = () => {
  const context = useContext(DwollaContext);
  if (!context) {
    throw new Error('useDwolla must be used within a DwollaProvider');
  }
  return context;
};

export default DwollaContext;
