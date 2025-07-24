import { db } from './firebase/config';
import { doc, getDoc, updateDoc, increment, Firestore } from 'firebase/firestore';

class RewardsService {
  private db: Firestore;

  constructor() {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }
    this.db = db;
  }

  async getUserSpins(userId: string): Promise<number> {
    const userRef = doc(this.db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return 0;
    }

    return userDoc.data().AvailableSpins || 0;
  }

  async setAvailableSpins(userId: string, spins: number): Promise<void> {
    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      AvailableSpins: spins
    });
  }

  async addSpins(userId: string, amount: number): Promise<void> {
    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      AvailableSpins: increment(amount)
    });
  }

  async useSpin(userId: string): Promise<boolean> {
    const availableSpins = await this.getUserSpins(userId);

    if (availableSpins <= 0) {
      return false;
    }

    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      AvailableSpins: increment(-1)
    });

    return true;
  }
}

export const rewardsService = new RewardsService();
