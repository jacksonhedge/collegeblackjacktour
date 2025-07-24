import { db } from '../services/firebase/config';
import { collection, getDocs, Firestore } from 'firebase/firestore';

class UserService {
  private firestore: Firestore;

  constructor() {
    if (!db) {
      throw new Error('Firestore must be initialized before using UserService');
    }
    this.firestore = db;
  }

  async getAllUsers() {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const userSnapshot = await getDocs(usersCollection);
      return userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
