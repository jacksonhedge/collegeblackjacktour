import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

class PaymentMethodService {
  static shared = new PaymentMethodService();

  async setPreferredMethod(userId, methodId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        preferredPaymentMethod: methodId
      });
      return true;
    } catch (error) {
      console.error('Error setting preferred payment method:', error);
      throw error;
    }
  }

  async getPreferredMethod(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data().preferredPaymentMethod;
      }
      return null;
    } catch (error) {
      console.error('Error getting preferred payment method:', error);
      throw error;
    }
  }

  async saveVenmoUsername(userId, username) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        venmoUsername: username
      });
      return true;
    } catch (error) {
      console.error('Error saving Venmo username:', error);
      throw error;
    }
  }

  async saveApplePayEmail(userId, email) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        applePayEmail: email
      });
      return true;
    } catch (error) {
      console.error('Error saving Apple Pay email:', error);
      throw error;
    }
  }

  async saveCashAppTag(userId, tag) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        cashAppTag: tag
      });
      return true;
    } catch (error) {
      console.error('Error saving Cash App tag:', error);
      throw error;
    }
  }

  async getPaymentMethodDetails(userId, methodId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return null;

      const userData = userDoc.data();
      const [type, id] = methodId.split('-');

      switch (type) {
        case 'venmo':
          return {
            type: 'venmo',
            icon: '/images/venmo-icon.svg',
            name: 'Venmo',
            detail: userData.venmoUsername
          };
        case 'applepay':
          return {
            type: 'applepay',
            icon: '/images/apple-pay-icon.svg',
            name: 'Apple Pay',
            detail: userData.applePayEmail
          };
        case 'cashapp':
          return {
            type: 'cashapp',
            icon: '/images/cashapp-icon.svg',
            name: 'Cash App',
            detail: userData.cashAppTag
          };
        case 'bank':
          // You would need to fetch bank details from your banking service
          return null;
        default:
          return null;
      }
    } catch (error) {
      console.error('Error getting payment method details:', error);
      throw error;
    }
  }
}

export default PaymentMethodService;
