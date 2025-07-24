import { db } from './firebase/config';
import { 
  doc, 
  collection,
  addDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  increment,
  Firestore,
  DocumentReference
} from 'firebase/firestore';

interface Transaction {
  id: string;
  amount: number;
  type: 'bonus' | 'deposit' | 'withdrawal';
  description: string;
  timestamp: Date;
}

interface SubWallet {
  id: string;
  userId: string;
  platformId: string;
  balance: number;
  dateCreated: Date;
  transactions: Transaction[];
  status: 'active' | 'inactive';
}

class SubWalletService {
  private db: Firestore;
  
  constructor() {
    if (!db) {
      throw new Error('Firestore must be initialized');
    }
    this.db = db;
  }

  async createSubWallet(userId: string, platformId: string): Promise<SubWallet> {
    const INITIAL_BONUS = 5; // Initial $5 bonus

    // Create the initial transaction for the $5 bonus
    const initialTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: INITIAL_BONUS,
      type: 'bonus',
      description: 'Welcome bonus for creating wallet',
      timestamp: new Date()
    };

    // Create the sub-wallet
    const subWallet: SubWallet = {
      id: crypto.randomUUID(),
      userId,
      platformId,
      balance: INITIAL_BONUS, // Initial $5 bonus
      dateCreated: new Date(),
      transactions: [initialTransaction],
      status: 'active'
    };

    // Add to Firebase
    const subWalletsRef = collection(this.db, 'subWallets');
    await addDoc(subWalletsRef, {
      ...subWallet,
      dateCreated: serverTimestamp(),
      timestamp: serverTimestamp()
    });

    // Update user's bonus balance
    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      bonusBalance: increment(INITIAL_BONUS),
      lastUpdated: serverTimestamp()
    });

    return subWallet;
  }

  async addTransaction(
    subWalletId: string, 
    transaction: Omit<Transaction, 'id' | 'timestamp'>
  ): Promise<void> {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    const subWalletRef = doc(this.db, 'subWallets', subWalletId);
    const subWalletSnap = await getDoc(subWalletRef);
    
    if (!subWalletSnap.exists()) {
      throw new Error('Sub-wallet not found');
    }

    const currentTransactions = subWalletSnap.data().transactions || [];
    
    await updateDoc(subWalletRef, {
      transactions: [...currentTransactions, newTransaction],
      balance: transaction.type === 'withdrawal' 
        ? increment(-transaction.amount)
        : increment(transaction.amount),
      lastUpdated: serverTimestamp()
    });
  }

  async getTransactions(subWalletId: string): Promise<Transaction[]> {
    const subWalletRef = doc(this.db, 'subWallets', subWalletId);
    const subWalletSnap = await getDoc(subWalletRef);
    
    if (!subWalletSnap.exists()) {
      return [];
    }

    return subWalletSnap.data().transactions || [];
  }

  async getSubWallet(subWalletId: string): Promise<SubWallet | null> {
    const subWalletRef = doc(this.db, 'subWallets', subWalletId);
    const subWalletSnap = await getDoc(subWalletRef);
    
    if (!subWalletSnap.exists()) {
      return null;
    }

    return subWalletSnap.data() as SubWallet;
  }
}

export const subWalletService = new SubWalletService();
