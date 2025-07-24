import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';

/**
 * Service to handle promo code functionality
 */
class PromoCodeService {
  /**
   * Save the user's promo code to their profile
   * @param {string} userId - The user's ID
   * @param {string} promoCode - The promo code used during signup
   */
  async saveUserPromoCode(userId, promoCode) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update existing user
        await updateDoc(userRef, {
          promoCode: promoCode,
          promoCodeUpdatedAt: new Date()
        });
      } else {
        // Create new user document with promo code
        await setDoc(userRef, {
          promoCode: promoCode,
          promoCodeUpdatedAt: new Date()
        });
      }
      
      console.log(`Promo code ${promoCode} saved for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error saving promo code:', error);
      return false;
    }
  }
  
  /**
   * Get the user's promo code
   * @param {string} userId - The user's ID
   * @returns {Promise<string|null>} - The user's promo code or null if not found
   */
  async getUserPromoCode(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().promoCode) {
        return userDoc.data().promoCode;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting promo code:', error);
      return null;
    }
  }
  
  /**
   * Map platform URLs based on the user's promo code
   * @param {string} platformId - The platform ID
   * @param {string} promoCode - The user's promo code
   * @returns {string} - The mapped URL for the platform
   */
  getPlatformUrl(platformId, promoCode) {
    // Default URLs (same as in Platforms.jsx)
    const defaultUrls = {
      sportsmillions: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5414&afp={clickid}&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=PLAYBONUS&corid',
      mcluck: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5356&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid',
      pulsz: 'https://affiliates.pulsz.com/visit/?bta=3035&nci=5348&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid',
      hellomillions: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5357&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid',
      crowncoins: 'https://crowncoinscasino.com/?landing=direct_su&utm_source=affiliates_seo&utm_content=662608032&utm_campaign=bankroll&utm_medium=bankroll&click_id={click_id}&deal_id=cfca54e2-e98f-4225-932b-80f69267d8b2',
      realprize: 'https://realprize.com/?af=2255&p1=662608032'
    };
    
    // Define promo code URL mappings
    const promoCodeUrls = {
      // Example: SPECIALOFFER promo code changes URLs
      'SPECIALOFFER': {
        sportsmillions: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5414&afp={clickid}&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=SPECIALOFFER&corid',
        pulsz: 'https://affiliates.pulsz.com/visit/?bta=3035&nci=5348&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=SPECIALOFFER&corid'
        // Other platforms can keep default URLs
      },
      // Add more promo codes and their URL mappings as needed
    };
    
    // Check if we have a URL mapping for this promo code and platform
    if (promoCode && promoCodeUrls[promoCode] && promoCodeUrls[promoCode][platformId]) {
      return promoCodeUrls[promoCode][platformId];
    }
    
    // Otherwise return the default URL
    return defaultUrls[platformId] || '';
  }
}

export const promoCodeService = new PromoCodeService();