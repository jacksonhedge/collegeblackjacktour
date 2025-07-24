import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { DollarSign, RefreshCw } from 'lucide-react';
import { db } from '../../services/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function DwollaBalanceWidget() {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchBalance = async () => {
    if (!currentUser?.uid) {
      setError('No user found');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get user document from Firebase
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setBalance(userData.dwollaBalance || 0);
        setLastUpdated(userData.lastBalanceUpdate?.toDate() || new Date());
      } else {
        setError('User data not found');
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  // Only fetch balance on initial load
  useEffect(() => {
    fetchBalance();
  }, [currentUser?.uid]);

  if (!currentUser?.uid) {
    return null;
  }

  return (
    <Card className="bg-gray-900/40 border-purple-500/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white font-medium">Bankroll Balance</CardTitle>
        <button
          onClick={fetchBalance}
          disabled={isLoading}
          className="p-2 hover:bg-purple-900/30 rounded-full transition-colors"
          aria-label="Refresh balance"
        >
          <RefreshCw 
            className={`h-4 w-4 text-purple-200 ${isLoading ? 'animate-spin' : ''}`} 
          />
        </button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div>
            {isLoading ? (
              <div className="text-2xl font-bold text-white animate-pulse">
                Loading...
              </div>
            ) : error ? (
              <div className="text-sm text-red-400">
                {error}
              </div>
            ) : (
              <div className="text-2xl font-bold text-white">
                ${(balance || 0).toFixed(2)}
              </div>
            )}
            {lastUpdated && !error && (
              <div className="text-xs text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
