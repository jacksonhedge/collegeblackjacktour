// src/services/DwollaService.js
import { auth } from './firebase/config';

class DwollaService {
  constructor() {
    this.baseURL = 'https://us-central1-bankroll-2ccb4.cloudfunctions.net';
  }

  async fetchBalance(customerId) {
    // If no customerId, return early with 0 balance
    if (!customerId) {
      console.warn('No customerId provided to fetchBalance');
      return { balance: 0, error: 'No Dwolla account connected' };
    }

    try {
      // Get the current user's ID token
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        return { 
          balance: 0, 
          error: 'Authentication required' 
        };
      }

      const response = await fetch(`${this.baseURL}/fetchDwollaBalance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          customerId,
          uid: auth.currentUser.uid // Add user ID to request
        }),
      });

      // Always try to parse error response
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.warn('Balance fetch error:', response.status, data.error);
        
        // Map specific error cases
        switch (response.status) {
          case 401:
            return { 
              balance: 0, 
              error: 'Authentication required' 
            };
          case 403:
            return { 
              balance: 0, 
              error: 'Unauthorized access' 
            };
          case 404:
            return { 
              balance: 0, 
              error: 'No Dwolla account connected' 
            };
          case 500:
            return { 
              balance: 0, 
              error: 'Service temporarily unavailable' 
            };
          default:
            return { 
              balance: 0, 
              error: data.error || 'Failed to fetch balance' 
            };
        }
      }

      // Ensure we have a valid balance value
      const balance = parseFloat(data.balance);
      if (isNaN(balance)) {
        console.error('Invalid balance value received:', data.balance);
        return {
          balance: 0,
          error: 'Invalid balance data received'
        };
      }

      return { 
        balance,
        error: null 
      };
    } catch (error) {
      console.error('Error in fetchBalance:', error);
      return { 
        balance: 0, 
        error: 'Unable to connect to service' 
      };
    }
  }
}

export const dwollaService = new DwollaService();
