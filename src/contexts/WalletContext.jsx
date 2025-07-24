import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { calculateTotalBonusBalance } from '../types/wallet';
import { PLATFORMS } from '../services/WalletService';
import PlatformImageService from '../services/firebase/PlatformImageService';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

const DEFAULT_LOGO = '/images/default.png';

// Create initial state with default logo values
const createInitialState = () => ({
  bankroll: {
    balance: 0,
    logo: DEFAULT_LOGO
  },
  subWallets: Object.keys(PLATFORMS).reduce((acc, platformId) => {
    acc[platformId] = {
      platformId,
      name: PLATFORMS[platformId].name,
      logo: DEFAULT_LOGO,
      cashBalance: 0,
      bonusBalances: [],
      totalBonusBalance: 0,
      lastUpdated: new Date(),
      status: 'active',
      connected: false,
      created: false,
      loading: false,
      notifiedRedeemable: false
    };
    return acc;
  }, {}),
  lastUpdated: new Date()
});

export const WalletProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [wallets, setWallets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load images from Firebase Storage only when we have a user
  useEffect(() => {
    if (!currentUser || imagesLoaded) return;

    const loadImages = async () => {
      try {
        const bankrollLogo = await PlatformImageService.getImageUrl('BankrollLogoTransparent.png');
        
        const logoPromises = Object.entries(PLATFORMS).map(async ([platformId, platform]) => {
          try {
            const logoUrl = await PlatformImageService.getImageUrl(platform.logo);
            return [platformId, logoUrl || DEFAULT_LOGO];
          } catch (error) {
            console.error(`Error loading logo for ${platformId}:`, error);
            return [platformId, DEFAULT_LOGO];
          }
        });

        const logoResults = await Promise.all(logoPromises);
        const logoMap = Object.fromEntries(logoResults);

        setWallets(prev => {
          if (!prev) return createInitialState();

          const updatedSubWallets = { ...prev.subWallets };
          Object.entries(updatedSubWallets).forEach(([platformId, wallet]) => {
            updatedSubWallets[platformId] = {
              ...wallet,
              logo: logoMap[platformId] || DEFAULT_LOGO
            };
          });

          return {
            ...prev,
            bankroll: {
              ...prev.bankroll,
              logo: bankrollLogo || DEFAULT_LOGO
            },
            subWallets: updatedSubWallets
          };
        });

        setImagesLoaded(true);
      } catch (error) {
        console.error('Error loading wallet images:', error);
        setWallets(prev => {
          if (!prev) return createInitialState();

          return {
            ...prev,
            bankroll: {
              ...prev.bankroll,
              logo: DEFAULT_LOGO
            },
            subWallets: Object.entries(prev.subWallets).reduce((acc, [id, wallet]) => ({
              ...acc,
              [id]: { ...wallet, logo: DEFAULT_LOGO }
            }), {})
          };
        });
        setImagesLoaded(true);
      }
    };

    loadImages();
  }, [currentUser, imagesLoaded]);

  // Subscribe to user document changes only when we have a user
  useEffect(() => {
    if (!currentUser) {
      setWallets(null);
      setLoading(false);
      setImagesLoaded(false);
      return;
    }

    setLoading(true);
    // Get the user ID (Supabase uses 'id' instead of 'uid')
    const userId = currentUser.uid || currentUser.id;
    if (!userId) {
      console.warn('No user ID found for current user');
      setWallets(createInitialState());
      setLoading(false);
      return;
    }
    
    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        
        setWallets(prev => {
          const updatedSubWallets = { ...prev?.subWallets || {} };
          
          Object.entries(userData.subWallets || {}).forEach(([platformId, wallet]) => {
            updatedSubWallets[platformId] = {
              ...prev?.subWallets?.[platformId] || {},
              ...wallet,
              logo: prev?.subWallets?.[platformId]?.logo || DEFAULT_LOGO,
              bonusBalances: wallet.bonusBalances || [],
              totalBonusBalance: calculateTotalBonusBalance(wallet.bonusBalances || [])
            };
          });

          return {
            ...userData,
            bankroll: {
              ...userData.bankroll,
              logo: prev?.bankroll?.logo || DEFAULT_LOGO
            },
            subWallets: updatedSubWallets
          };
        });
      } else {
        setWallets(createInitialState());
      }
      setLoading(false);
    }, (error) => {
      console.error('Error in wallet listener:', error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const refreshWallet = async () => {
    // No need to manually refresh as we're using onSnapshot
    return Promise.resolve();
  };

  const value = {
    wallets,
    loading,
    refreshWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;
