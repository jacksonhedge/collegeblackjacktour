import { doc, updateDoc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './config';

class PrizeValuesService {
  async getPrizeValues() {
    try {
      const prizeValuesRef = collection(db, 'prizeValues');
      const snapshot = await getDocs(prizeValuesRef);
      
      if (snapshot.empty) {
        return null;
      }

      const prizeValues = {};
      snapshot.forEach(doc => {
        prizeValues[doc.id] = doc.data().value;
      });

      return prizeValues;
    } catch (error) {
      console.error('Error getting prize values:', error);
      throw error;
    }
  }

  async updatePrizeValues(platforms) {
    try {
      // Update each platform's prize value in a separate document
      for (const platform of platforms) {
        const prizeRef = doc(db, 'prizeValues', platform.id);
        await setDoc(prizeRef, {
          value: platform.value,
          name: platform.name,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }

      return true;
    } catch (error) {
      console.error('Error updating prize values:', error);
      throw error;
    }
  }
}

// Export an instance of the service
export const prizeValuesService = new PrizeValuesService();
