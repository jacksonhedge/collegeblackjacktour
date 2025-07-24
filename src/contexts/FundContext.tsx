import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase/config';
import { useFunds } from '../hooks/useFunds';
import { 
  UserFunds, 
  FundTransaction,
  FundType,
  DepositRequest,
  WithdrawalRequest,
  TransferRequest,
  BetRequest,
  FundOperationResult
} from '../types/funds';

interface FundContextType {
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
  // Utility functions
  getAvailableFunds: (fundType: FundType) => number;
  getTotalAvailable: () => number;
  canAfford: (amount: number, fundTypes?: FundType[]) => boolean;
}

const FundContext = createContext<FundContextType | null>(null);

interface FundProviderProps {
  children: ReactNode;
}

export function FundProvider({ children }: FundProviderProps) {
  const [user] = useAuthState(auth);
  const funds = useFunds(user?.uid || null);

  // Utility function to get available funds for a specific type
  const getAvailableFunds = (fundType: FundType): number => {
    if (!funds.userFunds) return 0;
    return funds.userFunds.balances[fundType].available;
  };

  // Utility function to get total available across all fund types
  const getTotalAvailable = (): number => {
    if (!funds.userFunds) return 0;
    return funds.userFunds.totalAvailable;
  };

  // Utility function to check if user can afford an amount
  const canAfford = (amount: number, fundTypes?: FundType[]): boolean => {
    if (!funds.userFunds) return false;
    
    // If no specific fund types specified, check total available
    if (!fundTypes || fundTypes.length === 0) {
      return getTotalAvailable() >= amount;
    }
    
    // Check if specified fund types have enough combined
    const availableInTypes = fundTypes.reduce((sum, type) => {
      return sum + getAvailableFunds(type);
    }, 0);
    
    return availableInTypes >= amount;
  };

  const contextValue: FundContextType = {
    ...funds,
    getAvailableFunds,
    getTotalAvailable,
    canAfford
  };

  return (
    <FundContext.Provider value={contextValue}>
      {children}
    </FundContext.Provider>
  );
}

export function useFundContext() {
  const context = useContext(FundContext);
  if (!context) {
    throw new Error('useFundContext must be used within a FundProvider');
  }
  return context;
}