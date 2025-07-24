import { Timestamp } from 'firebase/firestore';
import { PLATFORMS } from '../services/WalletService';

export type PlatformId = keyof typeof PLATFORMS;

export { PlatformId };

export interface BonusRestriction {
  platformId: PlatformId;
}

export interface BonusBalance {
  id: string;
  amount: number;
  initialAmount: number;
  dateGranted: Date | Timestamp;
  dateExpires?: Date | Timestamp;
  restrictions: BonusRestriction[];
  status: 'active' | 'expired' | 'used';
  description: string;
}

export interface SubWallet {
  platformId: PlatformId;
  name: string;
  logo: string;
  cashBalance: number;
  bonusBalances: BonusBalance[];
  totalBonusBalance: number;
  lastUpdated: Date | Timestamp;
  status: 'active' | 'inactive';
  connected: boolean;
  created: boolean;
  loading?: boolean;
  notifiedRedeemable?: boolean;
}

export interface MainWallet {
  id: string;
  userId: string;
  totalCashBalance: number;
  totalBonusBalance: number;
  availableWithdrawal: number;
  investableBalance: number;
  subWallets: Record<PlatformId, SubWallet>;
  bankroll: {
    balance: number;
    logo: string;
  };
  lastUpdated: Date | Timestamp;
}

// Helper function to convert Timestamp or Date to Date
export function toDate(date: Date | Timestamp | undefined): Date {
  if (!date) {
    return new Date();
  }
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  return date;
}

// Helper function to format a date for display
export function formatDate(date: Date | Timestamp): string {
  return toDate(date).toLocaleDateString();
}

// Helper function to calculate total bonus balance
export function calculateTotalBonusBalance(bonusBalances: BonusBalance[]): number {
  if (!bonusBalances || bonusBalances.length === 0) return 0;
  
  const now = new Date();
  return bonusBalances
    .filter(bonus => 
      bonus.status === 'active' && 
      (!bonus.dateExpires || toDate(bonus.dateExpires) > now)
    )
    .reduce((total, bonus) => total + (bonus.amount || 0), 0);
}

// Helper function to create an empty sub wallet
export function createEmptySubWallet(
  platformId: PlatformId,
  name: string,
  logo: string
): SubWallet {
  return {
    platformId,
    name,
    logo,
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
}

// Helper function to create an empty main wallet
export function createEmptyMainWallet(userId: string): MainWallet {
  return {
    id: crypto.randomUUID(),
    userId,
    totalCashBalance: 0,
    totalBonusBalance: 0,
    availableWithdrawal: 0,
    investableBalance: 0,
    subWallets: {} as Record<PlatformId, SubWallet>,
    bankroll: {
      balance: 0,
      logo: '/images/BankrollLogoTransparent.png'
    },
    lastUpdated: new Date()
  };
}

// Helper function to convert a Date to a Firestore Timestamp
export function toTimestamp(date: Date | Timestamp): Timestamp {
  if (date instanceof Timestamp) {
    return date;
  }
  return Timestamp.fromDate(date);
}

// Helper function to compare dates (handles both Date and Timestamp)
export function compareDates(a: Date | Timestamp, b: Date | Timestamp): number {
  const dateA = toDate(a);
  const dateB = toDate(b);
  return dateA.getTime() - dateB.getTime();
}
