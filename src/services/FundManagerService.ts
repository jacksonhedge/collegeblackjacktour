import { db } from './firebase/config';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  runTransaction, 
  Timestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import {
  FundType,
  UserFunds,
  FundBalance,
  FundTransaction,
  FundTransactionType,
  FundTransactionStatus,
  FundOperationResult,
  FundAllocation,
  FundErrorCode,
  DepositRequest,
  WithdrawalRequest,
  TransferRequest,
  PromoGrantRequest,
  BetRequest,
  PromoFund,
  createEmptyUserFunds,
  canWithdraw,
  canTransfer,
  canUseForBets
} from '../types/funds';

export class FundManagerService {
  private static instance: FundManagerService;

  private constructor() {}

  static getInstance(): FundManagerService {
    if (!FundManagerService.instance) {
      FundManagerService.instance = new FundManagerService();
    }
    return FundManagerService.instance;
  }

  /**
   * Initialize user funds if they don't exist
   */
  async initializeUserFunds(userId: string): Promise<void> {
    const fundsRef = doc(db, 'user_funds', userId);
    
    await runTransaction(db, async (transaction) => {
      const fundsDoc = await transaction.get(fundsRef);
      
      if (!fundsDoc.exists()) {
        const initialFunds = createEmptyUserFunds(userId);
        transaction.set(fundsRef, {
          ...initialFunds,
          lastUpdated: serverTimestamp()
        });
      }
    });
  }

  /**
   * Get user funds
   */
  async getUserFunds(userId: string): Promise<UserFunds | null> {
    const fundsRef = doc(db, 'user_funds', userId);
    const fundsDoc = await getDoc(fundsRef);
    
    if (!fundsDoc.exists()) {
      return null;
    }
    
    return fundsDoc.data() as UserFunds;
  }

  /**
   * Process a deposit
   */
  async deposit(request: DepositRequest): Promise<FundOperationResult> {
    try {
      // Validate request
      if (request.amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount',
          errorCode: FundErrorCode.INVALID_AMOUNT
        };
      }

      if (request.fundType !== FundType.CASH && request.fundType !== FundType.SENDABLE) {
        return {
          success: false,
          error: 'Can only deposit to cash or sendable funds',
          errorCode: FundErrorCode.INVALID_FUND_TYPE
        };
      }

      const result = await runTransaction(db, async (transaction) => {
        const fundsRef = doc(db, 'user_funds', request.userId);
        const fundsDoc = await transaction.get(fundsRef);

        if (!fundsDoc.exists()) {
          throw new Error('User funds not found');
        }

        const userFunds = fundsDoc.data() as UserFunds;
        const fundBalance = userFunds.balances[request.fundType];
        const balanceBefore = fundBalance.amount;
        const balanceAfter = balanceBefore + request.amount;

        // Update fund balance
        fundBalance.amount = balanceAfter;
        fundBalance.available = balanceAfter - fundBalance.locked;
        fundBalance.lastUpdated = Timestamp.now();

        // Update total balances
        userFunds.totalBalance = Object.values(userFunds.balances)
          .reduce((sum, balance) => sum + balance.amount, 0);
        userFunds.totalAvailable = Object.values(userFunds.balances)
          .reduce((sum, balance) => sum + balance.available, 0);
        userFunds.lastUpdated = Timestamp.now();

        // Update user funds
        transaction.update(fundsRef, userFunds);

        // Create transaction record
        const transactionData: Omit<FundTransaction, 'id'> = {
          userId: request.userId,
          type: FundTransactionType.DEPOSIT,
          fundType: request.fundType,
          amount: request.amount,
          balanceBefore,
          balanceAfter,
          status: FundTransactionStatus.COMPLETED,
          description: `Deposit to ${request.fundType} funds`,
          metadata: {
            ...request.metadata,
            paymentMethodId: request.paymentMethodId
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          completedAt: Timestamp.now()
        };

        const transactionRef = await addDoc(collection(db, 'fund_transactions'), transactionData);

        return {
          transactionId: transactionRef.id,
          newBalances: {
            [request.fundType]: balanceAfter
          }
        };
      });

      return {
        success: true,
        transactionId: result.transactionId,
        newBalances: result.newBalances
      };
    } catch (error) {
      console.error('Deposit error:', error);
      return {
        success: false,
        error: 'Failed to process deposit',
        errorCode: FundErrorCode.SYSTEM_ERROR
      };
    }
  }

  /**
   * Process a withdrawal (only from cash funds)
   */
  async withdraw(request: WithdrawalRequest): Promise<FundOperationResult> {
    try {
      // Validate request
      if (request.amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount',
          errorCode: FundErrorCode.INVALID_AMOUNT
        };
      }

      const result = await runTransaction(db, async (transaction) => {
        const fundsRef = doc(db, 'user_funds', request.userId);
        const fundsDoc = await transaction.get(fundsRef);

        if (!fundsDoc.exists()) {
          throw new Error('User funds not found');
        }

        const userFunds = fundsDoc.data() as UserFunds;
        const cashBalance = userFunds.balances[FundType.CASH];

        // Check if user has sufficient cash funds
        if (cashBalance.available < request.amount) {
          throw new Error('Insufficient cash funds');
        }

        const balanceBefore = cashBalance.amount;
        const balanceAfter = balanceBefore - request.amount;

        // Update cash balance
        cashBalance.amount = balanceAfter;
        cashBalance.available = balanceAfter - cashBalance.locked;
        cashBalance.lastUpdated = Timestamp.now();

        // Update total balances
        userFunds.totalBalance -= request.amount;
        userFunds.totalAvailable -= request.amount;
        userFunds.lastUpdated = Timestamp.now();

        // Update user funds
        transaction.update(fundsRef, userFunds);

        // Create transaction record
        const transactionData: Omit<FundTransaction, 'id'> = {
          userId: request.userId,
          type: FundTransactionType.WITHDRAWAL,
          fundType: FundType.CASH,
          amount: request.amount,
          balanceBefore,
          balanceAfter,
          status: FundTransactionStatus.PENDING,
          description: 'Cash withdrawal',
          metadata: {
            ...request.metadata,
            withdrawalMethodId: request.withdrawalMethodId
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        const transactionRef = await addDoc(collection(db, 'fund_transactions'), transactionData);

        return {
          transactionId: transactionRef.id,
          newBalances: {
            [FundType.CASH]: balanceAfter
          }
        };
      });

      return {
        success: true,
        transactionId: result.transactionId,
        newBalances: result.newBalances
      };
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      if (error.message === 'Insufficient cash funds') {
        return {
          success: false,
          error: 'Insufficient funds',
          errorCode: FundErrorCode.INSUFFICIENT_FUNDS
        };
      }
      return {
        success: false,
        error: 'Failed to process withdrawal',
        errorCode: FundErrorCode.SYSTEM_ERROR
      };
    }
  }

  /**
   * Transfer funds between users (cash and sendable funds only)
   */
  async transfer(request: TransferRequest): Promise<FundOperationResult> {
    try {
      // Validate request
      if (request.amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount',
          errorCode: FundErrorCode.INVALID_AMOUNT
        };
      }

      if (!canTransfer(request.fundType)) {
        return {
          success: false,
          error: 'This fund type cannot be transferred',
          errorCode: FundErrorCode.OPERATION_NOT_ALLOWED
        };
      }

      const result = await runTransaction(db, async (transaction) => {
        const fromFundsRef = doc(db, 'user_funds', request.fromUserId);
        const toFundsRef = doc(db, 'user_funds', request.toUserId);

        const [fromDoc, toDoc] = await Promise.all([
          transaction.get(fromFundsRef),
          transaction.get(toFundsRef)
        ]);

        if (!fromDoc.exists() || !toDoc.exists()) {
          throw new Error('User funds not found');
        }

        const fromFunds = fromDoc.data() as UserFunds;
        const toFunds = toDoc.data() as UserFunds;

        const fromBalance = fromFunds.balances[request.fundType];
        
        // Check sufficient funds
        if (fromBalance.available < request.amount) {
          throw new Error('Insufficient funds');
        }

        // Update sender
        const fromBalanceBefore = fromBalance.amount;
        const fromBalanceAfter = fromBalanceBefore - request.amount;
        fromBalance.amount = fromBalanceAfter;
        fromBalance.available = fromBalanceAfter - fromBalance.locked;
        fromBalance.lastUpdated = Timestamp.now();
        fromFunds.totalBalance -= request.amount;
        fromFunds.totalAvailable -= request.amount;
        fromFunds.lastUpdated = Timestamp.now();

        // Update recipient
        const toBalance = toFunds.balances[request.fundType];
        const toBalanceBefore = toBalance.amount;
        const toBalanceAfter = toBalanceBefore + request.amount;
        toBalance.amount = toBalanceAfter;
        toBalance.available = toBalanceAfter - toBalance.locked;
        toBalance.lastUpdated = Timestamp.now();
        toFunds.totalBalance += request.amount;
        toFunds.totalAvailable += request.amount;
        toFunds.lastUpdated = Timestamp.now();

        // Update both users
        transaction.update(fromFundsRef, fromFunds);
        transaction.update(toFundsRef, toFunds);

        // Create transaction records
        const timestamp = Timestamp.now();
        const baseMetadata = {
          ...request.metadata,
          description: request.description
        };

        // Sender transaction
        const fromTransaction: Omit<FundTransaction, 'id'> = {
          userId: request.fromUserId,
          type: FundTransactionType.TRANSFER_OUT,
          fundType: request.fundType,
          amount: request.amount,
          balanceBefore: fromBalanceBefore,
          balanceAfter: fromBalanceAfter,
          status: FundTransactionStatus.COMPLETED,
          description: request.description || `Transfer to user`,
          metadata: {
            ...baseMetadata,
            toUserId: request.toUserId
          },
          createdAt: timestamp,
          updatedAt: timestamp,
          completedAt: timestamp
        };

        // Recipient transaction
        const toTransaction: Omit<FundTransaction, 'id'> = {
          userId: request.toUserId,
          type: FundTransactionType.TRANSFER_IN,
          fundType: request.fundType,
          amount: request.amount,
          balanceBefore: toBalanceBefore,
          balanceAfter: toBalanceAfter,
          status: FundTransactionStatus.COMPLETED,
          description: request.description || `Transfer from user`,
          metadata: {
            ...baseMetadata,
            fromUserId: request.fromUserId
          },
          createdAt: timestamp,
          updatedAt: timestamp,
          completedAt: timestamp
        };

        const [fromTransRef, toTransRef] = await Promise.all([
          addDoc(collection(db, 'fund_transactions'), fromTransaction),
          addDoc(collection(db, 'fund_transactions'), toTransaction)
        ]);

        return {
          transactionId: fromTransRef.id,
          recipientTransactionId: toTransRef.id
        };
      });

      return {
        success: true,
        transactionId: result.transactionId
      };
    } catch (error: any) {
      console.error('Transfer error:', error);
      if (error.message === 'Insufficient funds') {
        return {
          success: false,
          error: 'Insufficient funds',
          errorCode: FundErrorCode.INSUFFICIENT_FUNDS
        };
      }
      return {
        success: false,
        error: 'Failed to process transfer',
        errorCode: FundErrorCode.SYSTEM_ERROR
      };
    }
  }

  /**
   * Grant promo funds to a user
   */
  async grantPromoFunds(request: PromoGrantRequest): Promise<FundOperationResult> {
    try {
      const result = await runTransaction(db, async (transaction) => {
        const fundsRef = doc(db, 'user_funds', request.userId);
        const fundsDoc = await transaction.get(fundsRef);

        if (!fundsDoc.exists()) {
          throw new Error('User funds not found');
        }

        const userFunds = fundsDoc.data() as UserFunds;
        const promoBalance = userFunds.balances[FundType.PROMO];
        const balanceBefore = promoBalance.amount;
        const balanceAfter = balanceBefore + request.amount;

        // Update promo balance
        promoBalance.amount = balanceAfter;
        promoBalance.available = balanceAfter - promoBalance.locked;
        promoBalance.lastUpdated = Timestamp.now();

        // Update total balances
        userFunds.totalBalance += request.amount;
        userFunds.totalAvailable += request.amount;
        userFunds.lastUpdated = Timestamp.now();

        // Update user funds
        transaction.update(fundsRef, userFunds);

        // Create promo fund record
        const promoFund: PromoFund = {
          id: crypto.randomUUID(),
          amount: request.amount,
          originalAmount: request.amount,
          remainingAmount: request.amount,
          grantedAt: Timestamp.now(),
          expiresAt: request.expiresInDays 
            ? Timestamp.fromDate(new Date(Date.now() + request.expiresInDays * 24 * 60 * 60 * 1000))
            : undefined,
          source: request.source,
          requirements: request.requirements,
          status: 'active'
        };

        // Store promo fund details
        const promoRef = doc(db, 'user_promo_funds', request.userId, promoFund.id);
        transaction.set(promoRef, promoFund);

        // Create transaction record
        const transactionData: Omit<FundTransaction, 'id'> = {
          userId: request.userId,
          type: FundTransactionType.PROMO_GRANTED,
          fundType: FundType.PROMO,
          amount: request.amount,
          balanceBefore,
          balanceAfter,
          status: FundTransactionStatus.COMPLETED,
          description: `Promo funds granted: ${request.source}`,
          metadata: {
            ...request.metadata,
            promoId: promoFund.id,
            source: request.source,
            expiresAt: promoFund.expiresAt
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          completedAt: Timestamp.now()
        };

        const transactionRef = await addDoc(collection(db, 'fund_transactions'), transactionData);

        return {
          transactionId: transactionRef.id,
          promoId: promoFund.id,
          newBalances: {
            [FundType.PROMO]: balanceAfter
          }
        };
      });

      return {
        success: true,
        transactionId: result.transactionId,
        newBalances: result.newBalances
      };
    } catch (error) {
      console.error('Grant promo funds error:', error);
      return {
        success: false,
        error: 'Failed to grant promo funds',
        errorCode: FundErrorCode.SYSTEM_ERROR
      };
    }
  }

  /**
   * Process a bet using available funds
   */
  async placeBet(request: BetRequest): Promise<FundOperationResult> {
    try {
      const fundPriority = request.fundPriority || [FundType.PROMO, FundType.SENDABLE, FundType.CASH];
      
      const result = await runTransaction(db, async (transaction) => {
        const fundsRef = doc(db, 'user_funds', request.userId);
        const fundsDoc = await transaction.get(fundsRef);

        if (!fundsDoc.exists()) {
          throw new Error('User funds not found');
        }

        const userFunds = fundsDoc.data() as UserFunds;
        let remainingAmount = request.amount;
        const allocations: FundAllocation[] = [];
        const transactions: Omit<FundTransaction, 'id'>[] = [];

        // Try to allocate from each fund type in priority order
        for (const fundType of fundPriority) {
          if (remainingAmount <= 0) break;
          if (!canUseForBets(fundType)) continue;

          const balance = userFunds.balances[fundType];
          if (balance.available <= 0) continue;

          const allocationAmount = Math.min(remainingAmount, balance.available);
          const balanceBefore = balance.amount;
          const balanceAfter = balanceBefore - allocationAmount;

          // Update balance
          balance.amount = balanceAfter;
          balance.available = balanceAfter - balance.locked;
          balance.lastUpdated = Timestamp.now();

          allocations.push({
            fundType,
            amount: allocationAmount
          });

          // Create transaction record
          transactions.push({
            userId: request.userId,
            type: FundTransactionType.BET_PLACED,
            fundType,
            amount: allocationAmount,
            balanceBefore,
            balanceAfter,
            status: FundTransactionStatus.COMPLETED,
            description: `Bet placed on ${request.platformId}`,
            metadata: {
              ...request.metadata,
              platformId: request.platformId,
              betId: request.betId,
              totalBetAmount: request.amount
            },
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            completedAt: Timestamp.now()
          });

          remainingAmount -= allocationAmount;
        }

        // Check if we have enough funds
        if (remainingAmount > 0) {
          throw new Error('Insufficient funds');
        }

        // Update total balances
        userFunds.totalBalance -= request.amount;
        userFunds.totalAvailable -= request.amount;
        userFunds.lastUpdated = Timestamp.now();

        // Update user funds
        transaction.update(fundsRef, userFunds);

        // Create all transaction records
        const transactionRefs = await Promise.all(
          transactions.map(trans => addDoc(collection(db, 'fund_transactions'), trans))
        );

        return {
          transactionId: transactionRefs[0].id,
          allocations,
          newBalances: Object.fromEntries(
            Object.entries(userFunds.balances).map(([type, balance]) => [type, balance.amount])
          ) as Record<FundType, number>
        };
      });

      return {
        success: true,
        transactionId: result.transactionId,
        allocations: result.allocations,
        newBalances: result.newBalances
      };
    } catch (error: any) {
      console.error('Place bet error:', error);
      if (error.message === 'Insufficient funds') {
        return {
          success: false,
          error: 'Insufficient funds',
          errorCode: FundErrorCode.INSUFFICIENT_FUNDS
        };
      }
      return {
        success: false,
        error: 'Failed to place bet',
        errorCode: FundErrorCode.SYSTEM_ERROR
      };
    }
  }

  /**
   * Get fund transactions for a user
   */
  async getFundTransactions(
    userId: string, 
    fundType?: FundType, 
    limit?: number
  ): Promise<FundTransaction[]> {
    let q = query(
      collection(db, 'fund_transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (fundType) {
      q = query(q, where('fundType', '==', fundType));
    }

    if (limit) {
      q = query(q, limit);
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FundTransaction));
  }

  /**
   * Convert promo funds to cash (after meeting requirements)
   */
  async convertPromoToCash(userId: string, promoId: string): Promise<FundOperationResult> {
    try {
      const result = await runTransaction(db, async (transaction) => {
        const fundsRef = doc(db, 'user_funds', userId);
        const promoRef = doc(db, 'user_promo_funds', userId, promoId);

        const [fundsDoc, promoDoc] = await Promise.all([
          transaction.get(fundsRef),
          transaction.get(promoRef)
        ]);

        if (!fundsDoc.exists() || !promoDoc.exists()) {
          throw new Error('User funds or promo not found');
        }

        const userFunds = fundsDoc.data() as UserFunds;
        const promoFund = promoDoc.data() as PromoFund;

        // Check if promo is eligible for conversion
        if (promoFund.status !== 'active') {
          throw new Error('Promo is not active');
        }

        // Check wagering requirements
        if (promoFund.requirements?.wageringMultiplier) {
          const requiredWagering = promoFund.originalAmount * promoFund.requirements.wageringMultiplier;
          const currentWagering = promoFund.requirements.wageredAmount || 0;
          if (currentWagering < requiredWagering) {
            throw new Error('Wagering requirements not met');
          }
        }

        const conversionAmount = promoFund.remainingAmount;

        // Update balances
        const promoBalance = userFunds.balances[FundType.PROMO];
        const cashBalance = userFunds.balances[FundType.CASH];

        promoBalance.amount -= conversionAmount;
        promoBalance.available = promoBalance.amount - promoBalance.locked;
        promoBalance.lastUpdated = Timestamp.now();

        cashBalance.amount += conversionAmount;
        cashBalance.available = cashBalance.amount - cashBalance.locked;
        cashBalance.lastUpdated = Timestamp.now();

        userFunds.lastUpdated = Timestamp.now();

        // Update promo status
        promoFund.status = 'converted';

        // Update documents
        transaction.update(fundsRef, userFunds);
        transaction.update(promoRef, promoFund);

        // Create transaction record
        const transactionData: Omit<FundTransaction, 'id'> = {
          userId,
          type: FundTransactionType.PROMO_CONVERTED,
          fundType: FundType.PROMO,
          amount: conversionAmount,
          balanceBefore: promoBalance.amount + conversionAmount,
          balanceAfter: promoBalance.amount,
          status: FundTransactionStatus.COMPLETED,
          description: 'Promo funds converted to cash',
          metadata: {
            promoId,
            conversionRate: 1,
            toCashAmount: conversionAmount
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          completedAt: Timestamp.now()
        };

        const transactionRef = await addDoc(collection(db, 'fund_transactions'), transactionData);

        return {
          transactionId: transactionRef.id,
          newBalances: {
            [FundType.PROMO]: promoBalance.amount,
            [FundType.CASH]: cashBalance.amount
          }
        };
      });

      return {
        success: true,
        transactionId: result.transactionId,
        newBalances: result.newBalances
      };
    } catch (error: any) {
      console.error('Convert promo error:', error);
      if (error.message === 'Wagering requirements not met') {
        return {
          success: false,
          error: 'Requirements not met',
          errorCode: FundErrorCode.REQUIREMENTS_NOT_MET
        };
      }
      return {
        success: false,
        error: 'Failed to convert promo funds',
        errorCode: FundErrorCode.SYSTEM_ERROR
      };
    }
  }

  /**
   * Lock funds for a pending operation
   */
  async lockFunds(userId: string, fundType: FundType, amount: number): Promise<boolean> {
    try {
      await runTransaction(db, async (transaction) => {
        const fundsRef = doc(db, 'user_funds', userId);
        const fundsDoc = await transaction.get(fundsRef);

        if (!fundsDoc.exists()) {
          throw new Error('User funds not found');
        }

        const userFunds = fundsDoc.data() as UserFunds;
        const balance = userFunds.balances[fundType];

        if (balance.available < amount) {
          throw new Error('Insufficient available funds');
        }

        balance.locked += amount;
        balance.available = balance.amount - balance.locked;
        balance.lastUpdated = Timestamp.now();

        userFunds.totalAvailable -= amount;
        userFunds.lastUpdated = Timestamp.now();

        transaction.update(fundsRef, userFunds);
      });

      return true;
    } catch (error) {
      console.error('Lock funds error:', error);
      return false;
    }
  }

  /**
   * Unlock funds after operation completion
   */
  async unlockFunds(userId: string, fundType: FundType, amount: number): Promise<boolean> {
    try {
      await runTransaction(db, async (transaction) => {
        const fundsRef = doc(db, 'user_funds', userId);
        const fundsDoc = await transaction.get(fundsRef);

        if (!fundsDoc.exists()) {
          throw new Error('User funds not found');
        }

        const userFunds = fundsDoc.data() as UserFunds;
        const balance = userFunds.balances[fundType];

        balance.locked = Math.max(0, balance.locked - amount);
        balance.available = balance.amount - balance.locked;
        balance.lastUpdated = Timestamp.now();

        userFunds.totalAvailable += amount;
        userFunds.lastUpdated = Timestamp.now();

        transaction.update(fundsRef, userFunds);
      });

      return true;
    } catch (error) {
      console.error('Unlock funds error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const fundManager = FundManagerService.getInstance();