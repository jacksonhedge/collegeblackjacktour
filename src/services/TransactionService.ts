import { db } from '../services/firebase/config';
import { collection, query, where, orderBy, getDocs, Firestore } from 'firebase/firestore';

export interface Transaction {
  id: string;
  userId: string;
  type: string;
  status: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  platformId: string;
  platformName: string;
  timestamp: Date;
  description: string;
  bonusId?: string;
  metadata?: {
    platformLogo?: string;
    [key: string]: any;
  };
}

class TransactionService {
  private firestore: Firestore;

  constructor() {
    if (!db) {
      throw new Error('Firestore must be initialized before using TransactionService');
    }
    this.firestore = db;
  }

  async getWalletTransactions(userId: string, platformId: string): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(this.firestore, 'wallet_transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        where('platformId', '==', platformId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Transaction[];
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      throw error;
    }
  }

  async getAllUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(this.firestore, 'wallet_transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Transaction[];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
