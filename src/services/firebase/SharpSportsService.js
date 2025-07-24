import { db } from './config.js';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

class SharpSportsService {
  constructor() {
    this.books = {
      'FanDuel': { id: 'fanduel', name: 'FanDuel' },
      'DraftKings': { id: 'draftkings', name: 'DraftKings' },
      'BetMGM': { id: 'betmgm', name: 'BetMGM' },
      'Caesars': { id: 'caesars', name: 'Caesars' },
      'MyPrize': { id: 'myprize', name: 'MyPrize' }
    };
  }

  async initiateBetSync(bookName) {
    // Connection functionality disabled
    return { success: false };
  }

  async disconnectAccount(bookId) {
    // Connection functionality disabled
    return;
  }

  async simulateSuccessfulConnection(bookId) {
    // Connection functionality disabled
    return;
  }

  async handleWebhook(payload) {
    // Connection functionality disabled
    return;
  }

  async getAccountStatus(bookId) {
    // Connection functionality disabled
    return { connected: false, balance: 0 };
  }

  async refreshAccount(bookId) {
    // Connection functionality disabled
    return;
  }
}

export const sharpSportsService = new SharpSportsService();
