import type { Firestore, CollectionReference } from 'firebase/firestore';
import { 
  doc, 
  updateDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  increment,
  runTransaction,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db as firebaseDb } from './firebase/config';
import {
  MainWallet,
  SubWallet,
  BonusBalance,
  CreateBonusInput,
  PlatformId,
  WalletTransaction,
  GiftCardNotification
} from '../types/wallet';

// Assert db is initialized and properly typed
const db = firebaseDb as Firestore;
if (!db) {
  throw new Error('Firestore must be initialized');
}

// Constants for wallet tiers
export const WALLET_TIERS = {
  STARTER: {
    name: 'Starter',
    minAmount: 0,
    threshold: 20,
    reward: 5
  },
  PRO: {
    name: 'Pro',
    minAmount: 20,
    threshold: 100,
    reward: 25
  },
  ELITE: {
    name: 'Elite',
    minAmount: 100,
    threshold: 400,
    reward: 100
  }
} as const;

// Constants for gift card eligibility
export const GIFT_CARD_ELIGIBLE_PLATFORMS = [
  'betmgm',
  'betrivers',
  'fanduel',
  'draftkings',
  'parx',
  'hardrock'
] as const;

export const BONUS_THRESHOLDS = {
  MIN: 20, // Minimum amount for gift card eligibility
  MAX: 500 // Maximum bonus balance allowed
} as const;

// Platform names and logos
const PLATFORM_INFO: Record<PlatformId, { name: string; logo: string }> = {
  betmgm: { name: 'BetMGM', logo: '/images/betmgm.png' },
  draftkings: { name: 'DraftKings', logo: '/images/draftkings.png' },
  fanduel: { name: 'FanDuel', logo: '/images/fanduel.png' },
  underdog: { name: 'Underdog', logo: '/images/underdog.png' },
  prizepicks: { name: 'PrizePicks', logo: '/images/prizepicks.png' },
  betrivers: { name: 'BetRivers', logo: '/images/betrivers.png' },
  parx: { name: 'Parx', logo: '/images/parx.png' },
  hardrock: { name: 'Hard Rock', logo: '/images/hardrock.png' },
  caesars: { name: 'Caesars', logo: '/images/caesars.png' },
  myprize: { name: 'MyPrize', logo: '/images/myprize.png' },
  global: { name: 'Global', logo: '/images/global.png' }
};

class BonusWalletService {
  private db: Firestore;
  private walletsRef: CollectionReference;
  private transactionsRef: CollectionReference;
  private notificationsRef: CollectionReference;

  constructor() {
    this.db = db;
    this.walletsRef = collection(this.db, 'wallets');
    this.transactionsRef = collection(this.db, 'wallet_transactions');
    this.notificationsRef = collection(this.db, 'gift_card_notifications');
  }

  // Check if a platform is eligible for gift cards
  isGiftCardEligible(platformId: PlatformId): boolean {
    return GIFT_CARD_ELIGIBLE_PLATFORMS.includes(platformId as typeof GIFT_CARD_ELIGIBLE_PLATFORMS[number]);
  }

  // Check if a wallet is eligible for a specific tier reward
  async isEligibleForTierReward(
    userId: string,
    platformId: PlatformId,
    tier: keyof typeof WALLET_TIERS
  ): Promise<boolean> {
    const walletDoc = await this.getOrCreateWallet(userId);
    const subWallet = walletDoc.subWallets[platformId];
    
    if (!subWallet) return false;

    const { minAmount, threshold } = WALLET_TIERS[tier];
    return subWallet.cashBalance >= threshold && subWallet.cashBalance >= minAmount;
  }

  // Claim a tier reward
  async claimTierReward(
    userId: string,
    platformId: PlatformId,
    tier: keyof typeof WALLET_TIERS
  ): Promise<BonusBalance> {
    const isEligible = await this.isEligibleForTierReward(userId, platformId, tier);
    if (!isEligible) {
      throw new Error(`Not eligible for ${tier} tier reward`);
    }

    const reward = WALLET_TIERS[tier].reward;
    const input: CreateBonusInput = {
      platformId,
      amount: reward,
      description: `${WALLET_TIERS[tier].name} Tier Reward`,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry
    };

    return this.createBonus(userId, input);
  }

  // Create a new bonus balance with threshold checking
  async createBonus(userId: string, input: CreateBonusInput): Promise<BonusBalance> {
    try {
      // Validate bonus amount against maximum threshold
      if (input.amount > BONUS_THRESHOLDS.MAX) {
        throw new Error(`Bonus amount exceeds maximum limit of $${BONUS_THRESHOLDS.MAX}`);
      }

      const walletDoc = await this.getOrCreateWallet(userId);
      const bonus = await this.processBonus(userId, input);
      
      // Check if platform is eligible for gift card and meets minimum threshold
      if (this.isGiftCardEligible(input.platformId) && input.amount >= BONUS_THRESHOLDS.MIN) {
        await this.createGiftCardNotification(userId, input.platformId, input.amount);
      }

      return bonus;
    } catch (error) {
      console.error('Error creating bonus:', error);
      throw error;
    }
  }

  // Create notification for gift card eligibility
  private async createGiftCardNotification(
    userId: string,
    platformId: PlatformId,
    bonusAmount: number
  ): Promise<void> {
    const notification: GiftCardNotification = {
      userId,
      platformId,
      bonusAmount,
      timestamp: new Date(),
      status: 'pending'
    };

    await addDoc(this.notificationsRef, notification);
  }

  // Process bonus creation with platform-specific logic
  private async processBonus(
    userId: string,
    input: CreateBonusInput
  ): Promise<BonusBalance> {
    const bonus: BonusBalance = {
      id: crypto.randomUUID(),
      amount: input.amount,
      initialAmount: input.amount,
      dateGranted: new Date(),
      dateExpires: input.expiryDate,
      restrictions: input.restrictions?.map(r => ({
        platformId: input.platformId,
        ...r
      })) || [{
        platformId: input.platformId
      }],
      status: 'active',
      description: input.description,
      rolloverProgress: 0
    };

    await runTransaction(this.db, async (transaction) => {
      const walletRef = doc(this.walletsRef, userId);
      const walletSnap = await transaction.get(walletRef);
      const wallet = walletSnap.data() as MainWallet;

      // Initialize or update sub-wallet
      if (!wallet.subWallets[input.platformId]) {
        wallet.subWallets[input.platformId] = this.createEmptySubWallet(input.platformId);
      }

      const subWallet = wallet.subWallets[input.platformId];
      
      // Check if adding this bonus would exceed the maximum threshold
      const newTotalBonus = subWallet.totalBonusBalance + input.amount;
      if (newTotalBonus > BONUS_THRESHOLDS.MAX) {
        throw new Error(`Adding this bonus would exceed the maximum limit of $${BONUS_THRESHOLDS.MAX}`);
      }

      // Update balances
      subWallet.bonusBalances.push(bonus);
      subWallet.totalBonusBalance = newTotalBonus;
      subWallet.lastUpdated = new Date();

      // Update main wallet totals
      wallet.totalBonusBalance += input.amount;
      wallet.lastUpdated = new Date();

      // Update wallet in database
      transaction.update(walletRef, {
        subWallets: wallet.subWallets,
        totalBonusBalance: wallet.totalBonusBalance,
        lastUpdated: serverTimestamp()
      });

      // Record transaction
      const transactionData: WalletTransaction = {
        id: crypto.randomUUID(),
        walletId: userId,
        platformId: input.platformId,
        type: 'bonus_grant',
        amount: input.amount,
        bonusId: bonus.id,
        timestamp: new Date(),
        status: 'completed',
        metadata: {
          description: input.description,
        }
      };

      transaction.set(doc(this.transactionsRef, transactionData.id), transactionData);
    });

    return bonus;
  }

  // Get or create a user's wallet
  async getOrCreateWallet(userId: string): Promise<MainWallet> {
    const walletQuery = query(this.walletsRef, where('userId', '==', userId));
    const walletSnap = await getDocs(walletQuery);

    if (walletSnap.empty) {
      // Create new wallet if none exists
      const emptySubWallet = this.createEmptySubWallet('global');

      const initialSubWallets: Record<PlatformId, SubWallet> = Object.keys(PLATFORM_INFO).reduce((acc, key) => {
        const platformId = key as PlatformId;
        acc[platformId] = {
          ...this.createEmptySubWallet(platformId),
          name: PLATFORM_INFO[platformId].name,
          logo: PLATFORM_INFO[platformId].logo,
          connected: false
        };
        return acc;
      }, {} as Record<PlatformId, SubWallet>);

      const newWallet: MainWallet = {
        id: crypto.randomUUID(),
        userId,
        totalCashBalance: 0,
        totalBonusBalance: 0,
        availableWithdrawal: 0,
        investableBalance: 0,
        subWallets: initialSubWallets,
        bankroll: {
          balance: 0,
          logo: '/images/bankroll-logo.png'
        },
        lastUpdated: new Date()
      };

      await addDoc(this.walletsRef, newWallet);
      return newWallet;
    }

    return { id: walletSnap.docs[0].id, ...walletSnap.docs[0].data() } as MainWallet;
  }

  // Helper method to create empty sub-wallet
  private createEmptySubWallet(platformId: PlatformId): SubWallet {
    return {
      platformId,
      name: PLATFORM_INFO[platformId].name,
      logo: PLATFORM_INFO[platformId].logo,
      cashBalance: 0,
      bonusBalances: [],
      totalBonusBalance: 0,
      lastUpdated: new Date(),
      status: 'active',
      connected: false
    };
  }

  // Get pending gift card notifications
  async getPendingGiftCardNotifications(): Promise<GiftCardNotification[]> {
    const q = query(this.notificationsRef, where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
      processedAt: doc.data().processedAt?.toDate()
    })) as GiftCardNotification[];
  }

  // Update gift card notification status
  async updateGiftCardNotificationStatus(
    notificationId: string,
    status: 'processed' | 'failed'
  ): Promise<void> {
    const notificationRef = doc(this.notificationsRef, notificationId);
    await updateDoc(notificationRef, {
      status,
      processedAt: serverTimestamp()
    });
  }
}

export const bonusWalletService = new BonusWalletService();
