import { db } from '../../services/firebase/config';
import { 
  doc, 
  updateDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

class DwollaService {
  constructor() {
    const isDevelopment = import.meta.env.DEV;

    // Use development values if in development mode
    if (isDevelopment) {
      this.baseURL = 'https://api-sandbox.dwolla.com';
      this.tokenURL = `${this.baseURL}/token`;
      this.apiKey = 'development-key';
      this.apiSecret = 'development-secret';
      console.warn('DwollaService running in development mode');
    } else {
      this.baseURL = import.meta.env.VITE_DWOLLA_API_URL || 'https://api-sandbox.dwolla.com';
      this.tokenURL = `${this.baseURL}/token`;
      this.apiKey = import.meta.env.VITE_DWOLLA_API_KEY;
      this.apiSecret = import.meta.env.VITE_DWOLLA_API_SECRET;
    }

    this.accessToken = null;
    this.tokenExpirationDate = null;
  }

  async authenticate() {
    if (import.meta.env.DEV) {
      console.warn('Skipping Dwolla authentication in development mode');
      this.accessToken = 'development-token';
      this.tokenExpirationDate = new Date(Date.now() + 3600000); // 1 hour from now
      return;
    }

    try {
      // Check if existing token is still valid (with 1 minute buffer)
      if (this.accessToken && this.tokenExpirationDate > new Date(Date.now() + 60000)) {
        console.log('Using existing token, expires at:', this.tokenExpirationDate);
        return;
      }

      console.log('Requesting new access token...');
      const loginString = `${this.apiKey}:${this.apiSecret}`;
      const base64LoginString = btoa(loginString);

      const response = await fetch(this.tokenURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${base64LoginString}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpirationDate = new Date(Date.now() + data.expires_in * 1000);
      console.log('New token obtained, expires in:', data.expires_in, 'seconds');
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async createDwollaCustomer(userData) {
    if (import.meta.env.DEV) {
      console.warn('Skipping Dwolla customer creation in development mode');
      return 'development-customer-id';
    }

    try {
      await this.authenticate();

      if (!this.accessToken) {
        throw new Error('No access token available');
      }

      // Format birth date to YYYY-MM-DD
      const birthDate = new Date(userData.birthday).toISOString().split('T')[0];

      const customerData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        type: 'personal',
        dateOfBirth: birthDate,
        address1: userData.address1,
        city: userData.city,
        state: userData.state,
        postalCode: userData.postalCode,
        ssn: userData.ssn
      };

      const response = await fetch(`${this.baseURL}/customers`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.dwolla.v1.hal+json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(customerData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create Dwolla customer');
      }

      // Get customer ID from Location header
      const locationHeader = response.headers.get('Location');
      const customerId = locationHeader.split('/').pop();

      // Store Dwolla customer ID in Firebase
      if (db) {
        await this.storeDwollaCustomerId(userData.id, customerId);
      }

      return customerId;
    } catch (error) {
      console.error('Error creating Dwolla customer:', error);
      throw error;
    }
  }

  async storeDwollaCustomerId(userId, dwollaCustomerId) {
    if (!db) {
      console.warn('Skipping Dwolla customer ID storage in development mode');
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        dwollaCustomerId,
        dwollaVerificationStatus: 'pending', // Add verification status
        dwollaBalance: 0,
        bonusBalance: 0,
        lastBalanceUpdate: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error storing Dwolla customer ID:', error);
      throw error;
    }
  }

  async fetchBalance(customerId) {
    if (import.meta.env.DEV) {
      console.warn('Returning Firebase balance in development mode');
      const userDoc = await this.getUserByDwollaId(customerId);
      return userDoc?.dwollaBalance ?? 0;
    }

    try {
      await this.authenticate();

      if (!this.accessToken) {
        throw new Error('No access token available');
      }

      // First get funding sources
      const fundingSourcesResponse = await fetch(
        `${this.baseURL}/customers/${customerId}/funding-sources`,
        {
          headers: {
            'Accept': 'application/vnd.dwolla.v1.hal+json',
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!fundingSourcesResponse.ok) {
        throw new Error('Failed to fetch funding sources');
      }

      const fundingSources = await fundingSourcesResponse.json();
      const balanceAccount = fundingSources._embedded['funding-sources']
        .find(source => source.type === 'balance');

      if (!balanceAccount) {
        throw new Error('No balance account found');
      }

      // Then get balance for the balance account
      const balanceResponse = await fetch(
        `${this.baseURL}/funding-sources/${balanceAccount.id}/balance`,
        {
          headers: {
            'Accept': 'application/vnd.dwolla.v1.hal+json',
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!balanceResponse.ok) {
        throw new Error('Failed to fetch balance');
      }

      const balanceData = await balanceResponse.json();
      return parseFloat(balanceData.balance.value);
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  async getUserByDwollaId(dwollaCustomerId) {
    if (!db) return null;

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("dwollaCustomerId", "==", dwollaCustomerId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      return querySnapshot.docs[0].data();
    } catch (error) {
      console.error('Error getting user by Dwolla ID:', error);
      return null;
    }
  }

  async updateUserBalance(userId, balance) {
    if (!db) {
      console.warn('Skipping balance update in development mode');
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      // Only update if the balance has changed
      if (userDoc.data().dwollaBalance !== balance) {
        await updateDoc(userRef, {
          dwollaBalance: balance,
          lastBalanceUpdate: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }

  async listFundingSources(customerId) {
    if (import.meta.env.DEV) {
      console.warn('Returning mock funding sources in development mode');
      return [{
        id: 'development-funding-source',
        type: 'balance',
        status: 'verified'
      }];
    }

    try {
      await this.authenticate();

      if (!this.accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(
        `${this.baseURL}/customers/${customerId}/funding-sources`,
        {
          headers: {
            'Accept': 'application/vnd.dwolla.v1.hal+json',
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch funding sources');
      }

      const data = await response.json();
      return data._embedded['funding-sources'];
    } catch (error) {
      console.error('Error listing funding sources:', error);
      throw error;
    }
  }
}

// Create and export a single instance
const dwollaService = new DwollaService();
export default dwollaService;
