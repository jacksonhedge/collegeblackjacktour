import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase/config';
import { doc, getDoc, updateDoc, Firestore, onSnapshot, increment, arrayUnion, serverTimestamp, runTransaction } from 'firebase/firestore';
import { PlatformId, MainWallet, BonusBalance, SubWallet } from '../types/wallet';
import notificationsService from '../services/firebase/NotificationsService';
import { BONUS_THRESHOLDS } from '../services/BonusWalletService';
import { bonusWalletService } from '../services/BonusWalletService';
import { walletService } from '../services/WalletService';

interface WalletContextType {
  wallets: MainWallet | null;
  loading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
  connectWallet: (wallet: { platformId: PlatformId; name: string; logo: string }) => Promise<void>;
  disconnectWallet: (wallet: { platformId: PlatformId }) => Promise<void>;
  transferBonusToSubWallet: (platformId: PlatformId, amount: number) => Promise<void>;
}

interface WalletProviderProps {
  children: ReactNode;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Platform mapping with standardized IDs and legacy numeric IDs
const PLATFORM_INFO: Record<string, { name: string; logo: string; legacyId: string }> = {
  'fanduel': { name: 'FanDuel', logo: '/images/fanduel.png', legacyId: '0' },
  'draftkings': { name: 'DraftKings', logo: '/images/draftkingsFantasy.png', legacyId: '1' },
  'betmgm': { name: 'BetMGM', logo: '/images/betmgm.png', legacyId: '2' },
  'underdog': { name: 'Underdog', logo: '/images/underdog.jpeg', legacyId: '3' },
  'prizepicks': { name: 'PrizePicks', logo: '/images/prizepicks.png', legacyId: '4' },
  'betrivers': { name: 'BetRivers', logo: '/images/betRivers.png', legacyId: '5' },
  'parx': { name: 'Parx', logo: '/images/parx.png', legacyId: '6' },
  'hardrock': { name: 'Hard Rock', logo: '/images/hardrock.png', legacyId: '7' },
  'caesars': { name: 'Caesars', logo: '/images/caesars.png', legacyId: '8' },
  'myprize': { name: 'MyPrize', logo: '/images/MyPrize.jpg', legacyId: '9' },
  'global': { name: 'Global', logo: '/images/BankrollLogoTransparent.png', legacyId: '10' }
};

// Reverse mapping from legacy IDs to standard IDs
const LEGACY_TO_STANDARD_ID: Record<string, string> = Object.entries(PLATFORM_INFO).reduce(
  (acc, [standardId, info]) => ({
    ...acc,
    [info.legacyId]: standardId
  }), 
  {}
);

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallets, setWallets] = useState<MainWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  if (!db) {
    throw new Error('Firestore must be initialized before using WalletContext');
  }

  const firestore: Firestore = db;

  const transformWalletData = (userData: any): MainWallet => {
    console.log('Transforming wallet data:', userData);

    // Get subWallets from user document
    const rawSubWallets = userData.subWallets || [];
    console.log('Raw subWallets:', rawSubWallets);

    // Transform subWallets into standardized format
    const transformedSubWallets: Record<PlatformId, SubWallet> = {};

    if (Array.isArray(rawSubWallets)) {
      // Handle array-style wallets (legacy format)
      rawSubWallets.forEach((walletData: any, index: number) => {
        if (walletData) {
          const legacyId = String(index);
          const standardId = LEGACY_TO_STANDARD_ID[legacyId];
          if (standardId) {
            transformedSubWallets[standardId] = transformSubWallet(standardId, walletData);
          }
        }
      });
    } else {
      // Handle object-style wallets
      Object.entries(rawSubWallets).forEach(([platformId, walletData]: [string, any]) => {
        if (walletData) {
          // Convert legacy IDs to standard IDs if needed
          const standardId = LEGACY_TO_STANDARD_ID[platformId] || platformId;
          transformedSubWallets[standardId] = transformSubWallet(standardId, walletData);
        }
      });
    }

    console.log('Transformed subWallets:', transformedSubWallets);

    // Create wallet structure
    const wallet: MainWallet = {
      id: userData.id || crypto.randomUUID(),
      userId: currentUser?.uid || '',
      totalCashBalance: userData.totalCashBalance || 0,
      totalBonusBalance: userData.bonusBalance || 0,
      availableWithdrawal: userData.availableWithdrawal || 0,
      investableBalance: userData.investableBalance || 0,
      subWallets: transformedSubWallets,
      bankroll: {
        balance: userData.bankrollBalance || 0,
        logo: '/images/BankrollLogoTransparent.png'
      },
      lastUpdated: userData.lastUpdated?.toDate() || new Date()
    };

    console.log('Final transformed wallet:', wallet);
    return wallet;
  };

  const transformSubWallet = (platformId: string, walletData: any): SubWallet => {
    console.log(`Transforming subwallet for platform ${platformId}:`, walletData);

    // Get platform info
    const platform = PLATFORM_INFO[platformId];

    // Ensure bonusBalances is an array
    const bonusBalances = Array.isArray(walletData.bonusBalances) 
      ? walletData.bonusBalances 
      : [];

    // Calculate total bonus balance
    const totalBonusBalance = bonusBalances
      .filter((bonus: BonusBalance) => bonus.status === 'active')
      .reduce((total: number, bonus: BonusBalance) => total + (bonus.amount || 0), 0);

    const subWallet: SubWallet = {
      platformId,
      name: platform?.name || walletData.name || `Platform ${platformId}`,
      logo: platform?.logo || walletData.logo || '/images/default.png',
      cashBalance: walletData.cashBalance || walletData.balance || 0,
      bonusBalances,
      totalBonusBalance,
      lastUpdated: walletData.lastUpdated || new Date(),
      status: walletData.status || 'active',
      connected: walletData.connected || false,
      created: walletData.created || false,
      loading: walletData.loading || false
    };

    console.log(`Transformed subwallet for ${platformId}:`, subWallet);
    return subWallet;
  };

  useEffect(() => {
    if (!currentUser?.uid) {
      setWallets(null);
      setLoading(false);
      return;
    }

    // Initialize wallet structure if needed
    const initializeWallet = async () => {
      try {
        await walletService.initializeUserWallet(currentUser.uid);
      } catch (error) {
        console.error('Error initializing wallet:', error);
      }
    };
    initializeWallet();

    // Set up real-time listener for user document
    const userRef = doc(firestore, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        console.log('=== WalletContext Debug ===');
        console.log('Raw user data:', userData);

        const transformedWallet = transformWalletData(userData);
        setWallets(transformedWallet);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error in wallet listener:', error);
      setError('Failed to listen to wallet updates');
      setLoading(false);
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [currentUser?.uid]);

  const refreshWallet = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      // Initialize wallet if needed
      await walletService.initializeUserWallet(currentUser.uid);
      
      // Get user document
      const userRef = doc(firestore, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('=== RefreshWallet Debug ===');
        console.log('Raw refreshed user data:', userData);
        
        const transformedWallet = transformWalletData(userData);
        setWallets(transformedWallet);
      }
    } catch (err) {
      console.error('Error refreshing wallet:', err);
      setError('Failed to refresh wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const transferBonusToSubWallet = async (platformId: PlatformId, amount: number) => {
    if (!currentUser?.uid) throw new Error('User not authenticated');
    
    try {
      setLoading(true);

      // Initialize wallet if needed
      await walletService.initializeUserWallet(currentUser.uid);

      // Create subWallet if it doesn't exist
      if (!wallets?.subWallets?.[platformId]) {
        console.log('SubWallet not found, creating it first');
        await walletService.createSubWallet(currentUser.uid, platformId);
        await refreshWallet(); // Refresh to get the new wallet structure
      }

      // Now transfer the bonus
      await bonusWalletService.transferBonusToSubWallet(currentUser.uid, platformId, amount);
      
      // Refresh wallet data after transfer
      await refreshWallet();
      
      console.log('Successfully transferred bonus:', {
        platformId,
        amount,
        updatedWallet: wallets?.subWallets?.[platformId]
      });
    } catch (error) {
      console.error('Error in transferBonusToSubWallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async (wallet: { platformId: PlatformId; name: string; logo: string }) => {
    // Connection functionality disabled
    return;
  };

  const disconnectWallet = async (wallet: { platformId: PlatformId }) => {
    // Connection functionality disabled
    return;
  };

  const value: WalletContextType = {
    wallets,
    loading,
    error,
    refreshWallet,
    connectWallet,
    disconnectWallet,
    transferBonusToSubWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
