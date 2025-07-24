import { useState, useEffect, useCallback } from 'react';
import { 
  UserFunds, 
  FundTransaction,
  FundType,
  DepositRequest,
  WithdrawalRequest,
  TransferRequest,
  PromoGrantRequest,
  BetRequest,
  FundOperationResult
} from '../types/funds';
import { fundManager } from '../services/FundManagerService';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../services/firebase/config';

interface UseFundsReturn {
  userFunds: UserFunds | null;
  transactions: FundTransaction[];
  loading: boolean;
  error: string | null;
  deposit: (request: Omit<DepositRequest, 'userId'>) => Promise<FundOperationResult>;
  withdraw: (request: Omit<WithdrawalRequest, 'userId'>) => Promise<FundOperationResult>;
  transfer: (request: Omit<TransferRequest, 'fromUserId'>) => Promise<FundOperationResult>;
  placeBet: (request: Omit<BetRequest, 'userId'>) => Promise<FundOperationResult>;
  refreshFunds: () => Promise<void>;
  refreshTransactions: (fundType?: FundType, limit?: number) => Promise<void>;
}

export function useFunds(userId: string | null): UseFundsReturn {
  const [userFunds, setUserFunds] = useState<UserFunds | null>(null);
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and subscribe to user funds
  useEffect(() => {
    if (!userId) {
      setUserFunds(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Initialize funds if needed
    fundManager.initializeUserFunds(userId).catch(console.error);

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      doc(db, 'user_funds', userId),
      (snapshot) => {
        if (snapshot.exists()) {
          setUserFunds(snapshot.data() as UserFunds);
          setError(null);
        } else {
          setUserFunds(null);
          setError('User funds not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error subscribing to user funds:', err);
        setError('Failed to load funds');
        setLoading(false);
      }
    );

    // Load initial transactions
    loadTransactions(userId);

    return () => unsubscribe();
  }, [userId]);

  const loadTransactions = async (uid: string, fundType?: FundType, limit?: number) => {
    try {
      const data = await fundManager.getFundTransactions(uid, fundType, limit);
      setTransactions(data);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  const refreshFunds = useCallback(async () => {
    if (!userId) return;
    
    try {
      const funds = await fundManager.getUserFunds(userId);
      if (funds) {
        setUserFunds(funds);
      }
    } catch (err) {
      console.error('Error refreshing funds:', err);
      setError('Failed to refresh funds');
    }
  }, [userId]);

  const refreshTransactions = useCallback(async (fundType?: FundType, limit?: number) => {
    if (!userId) return;
    await loadTransactions(userId, fundType, limit);
  }, [userId]);

  const deposit = useCallback(async (
    request: Omit<DepositRequest, 'userId'>
  ): Promise<FundOperationResult> => {
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated',
        errorCode: 'USER_NOT_FOUND' as any
      };
    }

    const result = await fundManager.deposit({
      ...request,
      userId
    });

    if (result.success) {
      // Refresh transactions after successful deposit
      await refreshTransactions();
    }

    return result;
  }, [userId, refreshTransactions]);

  const withdraw = useCallback(async (
    request: Omit<WithdrawalRequest, 'userId'>
  ): Promise<FundOperationResult> => {
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated',
        errorCode: 'USER_NOT_FOUND' as any
      };
    }

    const result = await fundManager.withdraw({
      ...request,
      userId
    });

    if (result.success) {
      await refreshTransactions();
    }

    return result;
  }, [userId, refreshTransactions]);

  const transfer = useCallback(async (
    request: Omit<TransferRequest, 'fromUserId'>
  ): Promise<FundOperationResult> => {
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated',
        errorCode: 'USER_NOT_FOUND' as any
      };
    }

    const result = await fundManager.transfer({
      ...request,
      fromUserId: userId
    });

    if (result.success) {
      await refreshTransactions();
    }

    return result;
  }, [userId, refreshTransactions]);

  const placeBet = useCallback(async (
    request: Omit<BetRequest, 'userId'>
  ): Promise<FundOperationResult> => {
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated',
        errorCode: 'USER_NOT_FOUND' as any
      };
    }

    const result = await fundManager.placeBet({
      ...request,
      userId
    });

    if (result.success) {
      await refreshTransactions();
    }

    return result;
  }, [userId, refreshTransactions]);

  return {
    userFunds,
    transactions,
    loading,
    error,
    deposit,
    withdraw,
    transfer,
    placeBet,
    refreshFunds,
    refreshTransactions
  };
}