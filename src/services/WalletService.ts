import { db } from '../services/firebase/config';
import { doc, updateDoc, getDoc, setDoc, Firestore, increment, Timestamp, runTransaction } from 'firebase/firestore';
import { PlatformId, SubWallet, BonusBalance, toDate, MainWallet } from '../types/wallet';
import PlatformImageService from './firebase/PlatformImageService';
import StorageService from './firebase/StorageService';

// Platform mapping with standardized IDs
export const PLATFORMS = {
  fanduel: {
    id: 'fanduel',
    name: 'FanDuel',
    logo: 'fanduel.png'
  },
  draftkings: {
    id: 'draftkings',
    name: 'DraftKings',
    logo: 'draftkingsFantasy.png'
  },
  underdog: {
    id: 'underdog',
    name: 'Underdog',
    logo: 'underdog.jpeg'
  },
  sleeper: {
    id: 'sleeper',
    name: 'Sleeper',
    logo: 'sleeperFantasy.png'
  },
  cbs: {
    id: 'cbs',
    name: 'CBS',
    logo: 'CBS Sports.png'
  },
  yahoo: {
    id: 'yahoo',
    name: 'Yahoo',
    logo: 'yahoofantasy.png'
  },
  espnbet: {
    id: 'espnbet',
    name: 'ESPNBet',
    logo: 'espnbet.png'
  },
  espnfantasy: {
    id: 'espnfantasy',
    name: 'ESPN Fantasy',
    logo: 'espnFantasy.png'
  },
  fanatics: {
    id: 'fanatics',
    name: 'Fanatics',
    logo: 'fanatics.png'
  },
  betmgm: {
    id: 'betmgm',
    name: 'BetMGM',
    logo: 'betmgm.png'
  },
  caesars: {
    id: 'caesars',
    name: 'Caesars',
    logo: 'caesars.png'
  },
  pokerstars: {
    id: 'pokerstars',
    name: 'PokerStars',
    logo: 'pokerstars.png'
  },
  betr: {
    id: 'betr',
    name: 'Betr',
    logo: 'betrFantasy.png'
  },
  prizepicks: {
    id: 'prizepicks',
    name: 'PrizePicks',
    logo: 'prizepicks.png'  // Keep original PrizePicks
  },
  myprize: {
    id: 'myprize',
    name: 'MyPrize',
    logo: 'MyPrize.png'  // Separate MyPrize platform
  },
  dwolla: {
    id: 'dwolla',
    name: 'Dwolla Balance',
    logo: 'BankrollLogoTransparent.png'
  }
} as const;

const DEFAULT_LOGO = '/images/default.png';

class WalletService {
  private firestore: Firestore;

  constructor() {
    if (!db) {
      throw new Error('Firestore must be initialized before using WalletService');
    }
    this.firestore = db;
    // Clear the storage URL cache on initialization
    StorageService.clearCache();
  }

  private validatePlatformId(platformId: string): platformId is PlatformId {
    return platformId in PLATFORMS;
  }

  private async getPlatformInfo(platformId: string) {
    if (this.validatePlatformId(platformId)) {
      const platform = PLATFORMS[platformId];
      try {
        const logoUrl = await PlatformImageService.getImageUrl(platform.logo);
        return {
          id: platform.id,
          name: platform.name,
          logo: logoUrl || DEFAULT_LOGO
        };
      } catch (error) {
        console.error('Error loading platform logo:', error);
        return {
          id: platform.id,
          name: platform.name,
          logo: DEFAULT_LOGO
        };
      }
    }
    return {
      id: platformId,
      name: `Platform ${platformId}`,
      logo: DEFAULT_LOGO
    };
  }

  private calculateTotalBonusBalance(bonusBalances: BonusBalance[] = []): number {
    return bonusBalances
      .filter(bonus => 
        bonus.status === 'active' && 
        (!bonus.dateExpires || toDate(bonus.dateExpires) > new Date())
      )
      .reduce((total, bonus) => total + (bonus.amount || 0), 0);
  }

  private async createInitialSubWallet(platformId: string): Promise<SubWallet> {
    const platform = await this.getPlatformInfo(platformId);
    return {
      platformId: platform.id as PlatformId,
      name: platform.name,
      logo: platform.logo,
      cashBalance: 0,
      bonusBalances: [],
      totalBonusBalance: 0,
      lastUpdated: Timestamp.now(),
      status: 'active',
      connected: true,
      created: true,
      loading: false,
      notifiedRedeemable: false
    };
  }

  async createSubWallet(userId: string, platformId: string): Promise<void> {
    if (!this.validatePlatformId(platformId)) {
      throw new Error(`Invalid platform ID: ${platformId}`);
    }

    const userRef = doc(this.firestore, 'users', userId);

    try {
      await runTransaction(this.firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('User document not found');
        }

        const userData = userDoc.data();
        const subWallets = userData.subWallets || {};

        // Check if subWallet already exists
        if (subWallets[platformId]) {
          console.log('SubWallet already exists:', platformId);
          return;
        }

        // Create the subWallet with proper structure
        const subWallet: SubWallet = await this.createInitialSubWallet(platformId);
        subWallet.bonusBalances = [];
        subWallet.totalBonusBalance = 0;
        subWallet.created = true;
        subWallet.connected = true;

        // Update the document
        transaction.update(userRef, {
          [`subWallets.${platformId}`]: subWallet,
          lastUpdated: Timestamp.now()
        });

        console.log('Creating subWallet:', {
          platformId,
          subWallet
        });
      });

      // Verify the update
      const updatedDoc = await getDoc(userRef);
      const updatedData = updatedDoc.data();
      const updatedSubWallet = updatedData?.subWallets?.[platformId];
      
      console.log('Created subWallet in Firebase:', {
        platformId,
        subWallet: updatedSubWallet
      });

      if (!updatedSubWallet) {
        throw new Error('Failed to verify wallet creation');
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  async initializeUserWallet(userId: string): Promise<void> {
    const userRef = doc(this.firestore, 'users', userId);

    try {
      // Clear the storage URL cache before initializing
      StorageService.clearCache();

      await runTransaction(this.firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);

        const bankrollLogoUrl = await PlatformImageService.getImageUrl('BankrollLogoTransparent.png');

        // Create initial wallet structure with typed subWallets
        const initialData: Omit<MainWallet, 'userId'> & { id: string } = {
          id: userId,
          totalCashBalance: 0,
          totalBonusBalance: 0,
          availableWithdrawal: 0,
          investableBalance: 0,
          subWallets: {} as Record<PlatformId, SubWallet>,
          bankroll: {
            balance: 0,
            logo: bankrollLogoUrl || DEFAULT_LOGO
          },
          lastUpdated: Timestamp.now()
        };

        // Initialize all platform wallets
        for (const platformId of Object.keys(PLATFORMS) as PlatformId[]) {
          initialData.subWallets[platformId] = await this.createInitialSubWallet(platformId);
        }

        if (!userDoc.exists()) {
          // Create new user document with complete wallet structure
          await transaction.set(userRef, initialData);
          console.log('Initializing new user wallet:', initialData);
        } else {
          // Update existing user document to ensure all wallets exist
          const userData = userDoc.data();
          const currentSubWallets = userData.subWallets || {};
          
          // Only add missing wallets
          for (const platformId of Object.keys(PLATFORMS) as PlatformId[]) {
            if (!currentSubWallets[platformId]) {
              currentSubWallets[platformId] = await this.createInitialSubWallet(platformId);
            }
          }

          await transaction.update(userRef, {
            subWallets: currentSubWallets,
            lastUpdated: Timestamp.now()
          });
        }

        console.log('Initialized wallet structure:', {
          userId,
          subWallets: initialData.subWallets
        });
      });

      // Verify the initialization
      const verifyDoc = await getDoc(userRef);
      if (!verifyDoc.exists()) {
        throw new Error('Failed to verify wallet initialization - document not found');
      }

      const verifyData = verifyDoc.data();
      if (!verifyData.subWallets) {
        throw new Error('Failed to verify wallet initialization - subWallets not found');
      }

      // Verify each platform wallet exists
      (Object.keys(PLATFORMS) as PlatformId[]).forEach(platformId => {
        if (!verifyData.subWallets[platformId]) {
          throw new Error(`Failed to verify wallet initialization - ${platformId} wallet not found`);
        }
      });

      console.log('Successfully verified wallet initialization');
    } catch (error) {
      console.error('Error initializing wallet:', error);
      throw error;
    }
  }
}

export const walletService = new WalletService();
