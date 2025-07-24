import { Timestamp } from 'firebase/firestore';

// Fund type enumeration
export enum FundType {
  PROMO = 'promo',
  CASH = 'cash',
  SENDABLE = 'sendable'
}

// Fund rules interface
export interface FundRules {
  withdrawable: boolean;
  transferable: boolean;
  convertible: boolean;
  usableForBets: boolean;
  usableForGames: boolean;
  expirable: boolean;
}

// Fund type definitions with their rules
export const FUND_TYPE_RULES: Record<FundType, FundRules> = {
  [FundType.PROMO]: {
    withdrawable: false,
    transferable: false,
    convertible: true, // Can be converted to cash after meeting requirements
    usableForBets: true,
    usableForGames: true,
    expirable: true
  },
  [FundType.CASH]: {
    withdrawable: true,
    transferable: true,
    convertible: false,
    usableForBets: true,
    usableForGames: true,
    expirable: false
  },
  [FundType.SENDABLE]: {
    withdrawable: false,
    transferable: true,
    convertible: false,
    usableForBets: true,
    usableForGames: true,
    expirable: false
  }
};

// Fund balance interface
export interface FundBalance {
  type: FundType;
  amount: number;
  available: number; // Amount available after pending transactions
  locked: number; // Amount locked in pending operations
  lastUpdated: Date | Timestamp;
}

// User funds interface
export interface UserFunds {
  userId: string;
  balances: Record<FundType, FundBalance>;
  totalBalance: number;
  totalAvailable: number;
  lastUpdated: Date | Timestamp;
}

// Fund transaction types
export enum FundTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  BET_PLACED = 'bet_placed',
  BET_WON = 'bet_won',
  BET_LOST = 'bet_lost',
  GAME_SPENT = 'game_spent',
  GAME_WON = 'game_won',
  PROMO_GRANTED = 'promo_granted',
  PROMO_EXPIRED = 'promo_expired',
  PROMO_CONVERTED = 'promo_converted',
  FEE = 'fee',
  REFUND = 'refund'
}

// Fund transaction status
export enum FundTransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed'
}

// Fund transaction interface
export interface FundTransaction {
  id: string;
  userId: string;
  type: FundTransactionType;
  fundType: FundType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: FundTransactionStatus;
  description: string;
  metadata?: {
    fromUserId?: string;
    toUserId?: string;
    platformId?: string;
    betId?: string;
    gameId?: string;
    promoId?: string;
    conversionRate?: number;
    expirationDate?: Date | Timestamp;
    [key: string]: any;
  };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  completedAt?: Date | Timestamp;
  failureReason?: string;
}

// Promo fund details
export interface PromoFund {
  id: string;
  amount: number;
  originalAmount: number;
  remainingAmount: number;
  grantedAt: Date | Timestamp;
  expiresAt?: Date | Timestamp;
  source: string; // e.g., 'signup_bonus', 'daily_reward', 'referral'
  requirements?: {
    wageringMultiplier?: number; // e.g., 10x wagering requirement
    wageredAmount?: number;
    minOdds?: number;
    eligiblePlatforms?: string[];
    maxWinnings?: number;
  };
  status: 'active' | 'expired' | 'converted' | 'used';
}

// Fund operation request interfaces
export interface DepositRequest {
  userId: string;
  amount: number;
  fundType: FundType.CASH | FundType.SENDABLE;
  paymentMethodId: string;
  metadata?: Record<string, any>;
}

export interface WithdrawalRequest {
  userId: string;
  amount: number;
  withdrawalMethodId: string;
  metadata?: Record<string, any>;
}

export interface TransferRequest {
  fromUserId: string;
  toUserId: string;
  amount: number;
  fundType: FundType.CASH | FundType.SENDABLE;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PromoGrantRequest {
  userId: string;
  amount: number;
  source: string;
  expiresInDays?: number;
  requirements?: PromoFund['requirements'];
  metadata?: Record<string, any>;
}

export interface BetRequest {
  userId: string;
  amount: number;
  platformId: string;
  betId: string;
  fundPriority?: FundType[]; // Order of funds to use
  metadata?: Record<string, any>;
}

// Fund allocation result
export interface FundAllocation {
  fundType: FundType;
  amount: number;
}

// Fund operation result
export interface FundOperationResult {
  success: boolean;
  transactionId?: string;
  allocations?: FundAllocation[];
  newBalances?: Record<FundType, number>;
  error?: string;
  errorCode?: string;
}

// Fund validation errors
export enum FundErrorCode {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_FUND_TYPE = 'INVALID_FUND_TYPE',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  WITHDRAWAL_LIMIT_EXCEEDED = 'WITHDRAWAL_LIMIT_EXCEEDED',
  TRANSFER_LIMIT_EXCEEDED = 'TRANSFER_LIMIT_EXCEEDED',
  PROMO_EXPIRED = 'PROMO_EXPIRED',
  REQUIREMENTS_NOT_MET = 'REQUIREMENTS_NOT_MET',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

// Helper functions
export function getFundRules(fundType: FundType): FundRules {
  return FUND_TYPE_RULES[fundType];
}

export function canWithdraw(fundType: FundType): boolean {
  return FUND_TYPE_RULES[fundType].withdrawable;
}

export function canTransfer(fundType: FundType): boolean {
  return FUND_TYPE_RULES[fundType].transferable;
}

export function canUseForBets(fundType: FundType): boolean {
  return FUND_TYPE_RULES[fundType].usableForBets;
}

export function canUseForGames(fundType: FundType): boolean {
  return FUND_TYPE_RULES[fundType].usableForGames;
}

export function createEmptyFundBalance(type: FundType): FundBalance {
  return {
    type,
    amount: 0,
    available: 0,
    locked: 0,
    lastUpdated: new Date()
  };
}

export function createEmptyUserFunds(userId: string): UserFunds {
  return {
    userId,
    balances: {
      [FundType.PROMO]: createEmptyFundBalance(FundType.PROMO),
      [FundType.CASH]: createEmptyFundBalance(FundType.CASH),
      [FundType.SENDABLE]: createEmptyFundBalance(FundType.SENDABLE)
    },
    totalBalance: 0,
    totalAvailable: 0,
    lastUpdated: new Date()
  };
}