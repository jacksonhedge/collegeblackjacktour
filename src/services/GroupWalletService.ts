import type { Firestore } from 'firebase/firestore';
import { doc, updateDoc, getDoc, collection, addDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db as firebaseDb } from './firebase/config';
import { GroupWallet, WalletTransaction, MainWallet } from '../types/wallet';

// Assert db is initialized and properly typed
const db = firebaseDb as Firestore;
if (!db) {
  throw new Error('Firestore must be initialized');
}

class GroupWalletService {
  private db: Firestore;

  constructor() {
    this.db = db;
  }

  // Create a new group wallet
  async createGroupWallet(groupId: string, ownerId: string): Promise<GroupWallet> {
    const groupWallet: GroupWallet = {
      platformId: `group_${groupId}` as const,
      groupId,
      ownerId,
      name: 'Group Wallet',
      logo: '/images/BankrollLogoTransparent.png',
      cashBalance: 0,
      bonusBalances: [],
      totalBonusBalance: 0,
      lastUpdated: new Date(),
      status: 'active',
      connected: true,
      memberBalances: {},
      expenses: []
    };

    // Add the wallet to the group document
    const groupRef = doc(this.db, 'groups', groupId);
    await updateDoc(groupRef, {
      wallet: groupWallet
    });

    // Add the group wallet as a sub-wallet to the owner's main wallet
    await this.addGroupWalletToUser(ownerId, groupWallet);

    return groupWallet;
  }

  // Add group wallet to user's main wallet
  private async addGroupWalletToUser(userId: string, groupWallet: GroupWallet) {
    const userRef = doc(this.db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (userData?.wallet) {
      const mainWallet = userData.wallet as MainWallet;
      mainWallet.subWallets[groupWallet.platformId] = groupWallet;

      await updateDoc(userRef, {
        'wallet.subWallets': mainWallet.subWallets
      });
    }
  }

  // Get a group's wallet
  async getGroupWallet(groupId: string): Promise<GroupWallet | null> {
    const groupRef = doc(this.db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);
    const groupData = groupDoc.data();

    return groupData?.wallet || null;
  }

  // Add funds to group wallet
  async addFunds(groupId: string, amount: number, userId: string): Promise<void> {
    await runTransaction(this.db, async (transaction) => {
      const groupRef = doc(this.db, 'groups', groupId);
      const groupDoc = await transaction.get(groupRef);
      const groupData = groupDoc.data();

      if (!groupData?.wallet) {
        throw new Error('Group wallet not found');
      }

      const wallet = groupData.wallet as GroupWallet;
      
      // Update wallet balance
      wallet.cashBalance += amount;
      wallet.lastUpdated = new Date();

      // Update member balance
      wallet.memberBalances[userId] = (wallet.memberBalances[userId] || 0) + amount;

      // Update the group document
      transaction.update(groupRef, {
        wallet: wallet
      });

      // Record the transaction
      const transactionData: WalletTransaction = {
        id: crypto.randomUUID(),
        walletId: groupId,
        platformId: wallet.platformId,
        type: 'deposit',
        amount,
        timestamp: new Date(),
        status: 'completed',
        metadata: {
          userId,
          description: 'Group wallet deposit'
        }
      };

      transaction.set(
        doc(this.db, 'wallet_transactions', transactionData.id),
        transactionData
      );
    });
  }

  // Add an expense to the group
  async addExpense(
    groupId: string,
    description: string,
    amount: number,
    paidBy: string,
    splitBetween: string[]
  ): Promise<void> {
    await runTransaction(this.db, async (transaction) => {
      const groupRef = doc(this.db, 'groups', groupId);
      const groupDoc = await transaction.get(groupRef);
      const groupData = groupDoc.data();

      if (!groupData?.wallet) {
        throw new Error('Group wallet not found');
      }

      const wallet = groupData.wallet as GroupWallet;

      // Create the expense
      const expense = {
        id: crypto.randomUUID(),
        description,
        amount,
        paidBy,
        splitBetween,
        timestamp: new Date(),
        status: 'completed' as const // Explicitly type as 'completed'
      };

      // Add expense to wallet
      wallet.expenses.push(expense);

      // Calculate split amount
      const splitAmount = amount / splitBetween.length;

      // Update member balances
      splitBetween.forEach(memberId => {
        if (memberId !== paidBy) {
          // Deduct from members who need to pay
          wallet.memberBalances[memberId] = (wallet.memberBalances[memberId] || 0) - splitAmount;
        }
      });

      // Add the full amount to the person who paid
      wallet.memberBalances[paidBy] = (wallet.memberBalances[paidBy] || 0) + amount;

      // Update the group document
      transaction.update(groupRef, {
        wallet: wallet
      });

      // Record the transaction
      const transactionData: WalletTransaction = {
        id: crypto.randomUUID(),
        walletId: groupId,
        platformId: wallet.platformId,
        type: 'group_expense',
        amount,
        timestamp: new Date(),
        status: 'completed',
        metadata: {
          expenseId: expense.id,
          paidBy,
          splitBetween,
          description
        }
      };

      transaction.set(
        doc(this.db, 'wallet_transactions', transactionData.id),
        transactionData
      );
    });
  }

  // Get member balance
  async getMemberBalance(groupId: string, userId: string): Promise<number> {
    const wallet = await this.getGroupWallet(groupId);
    if (!wallet) {
      throw new Error('Group wallet not found');
    }
    return wallet.memberBalances[userId] || 0;
  }

  // Get all expenses for a group
  async getExpenses(groupId: string) {
    const wallet = await this.getGroupWallet(groupId);
    if (!wallet) {
      throw new Error('Group wallet not found');
    }
    return wallet.expenses;
  }
}

export const groupWalletService = new GroupWalletService();
