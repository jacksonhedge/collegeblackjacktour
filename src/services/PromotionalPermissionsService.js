class PromotionalPermissionsService {
  constructor() {
    // Define promotional permissions by state
    this.statePermissions = {
      // Full gambling states (Casino + Sports + Fantasy)
      'NJ': {
        level: 'full',
        permissions: ['casino', 'sports_betting', 'fantasy', 'poker', 'sweeps'],
        bonuses: {
          casino: { multiplier: 1.5, specialOffers: true },
          sports: { multiplier: 1.3, specialOffers: true },
          fantasy: { multiplier: 1.2, specialOffers: false }
        },
        features: ['enhanced_cashouts', 'premium_support', 'exclusive_tournaments'],
        restrictions: [],
        ageRequirement: 21
      },
      
      'PA': {
        level: 'full',
        permissions: ['casino', 'sports_betting', 'fantasy', 'poker', 'sweeps'],
        bonuses: {
          casino: { multiplier: 1.4, specialOffers: true },
          sports: { multiplier: 1.3, specialOffers: true },
          fantasy: { multiplier: 1.2, specialOffers: false }
        },
        features: ['enhanced_cashouts', 'premium_support', 'pokerstars_exclusive'],
        restrictions: [],
        ageRequirement: 21
      },

      'MI': {
        level: 'full',
        permissions: ['casino', 'sports_betting', 'fantasy', 'poker', 'sweeps'],
        bonuses: {
          casino: { multiplier: 1.4, specialOffers: true },
          sports: { multiplier: 1.3, specialOffers: true },
          fantasy: { multiplier: 1.1, specialOffers: false }
        },
        features: ['enhanced_cashouts', 'premium_support'],
        restrictions: [],
        ageRequirement: 21
      },

      'WV': {
        level: 'full',
        permissions: ['casino', 'sports_betting', 'fantasy', 'sweeps'],
        bonuses: {
          casino: { multiplier: 1.3, specialOffers: true },
          sports: { multiplier: 1.2, specialOffers: true },
          fantasy: { multiplier: 1.1, specialOffers: false }
        },
        features: ['enhanced_cashouts'],
        restrictions: [],
        ageRequirement: 21
      },

      // Sports betting + Fantasy states
      'NY': {
        level: 'sports_fantasy',
        permissions: ['sports_betting', 'fantasy', 'sweeps'],
        bonuses: {
          sports: { multiplier: 1.3, specialOffers: true },
          fantasy: { multiplier: 1.4, specialOffers: true },
          sweeps: { multiplier: 1.1, specialOffers: false }
        },
        features: ['enhanced_fantasy_bonuses', 'draftkings_exclusive'],
        restrictions: ['no_casino'],
        ageRequirement: 18
      },

      'CO': {
        level: 'sports_fantasy',
        permissions: ['sports_betting', 'fantasy', 'sweeps'],
        bonuses: {
          sports: { multiplier: 1.2, specialOffers: true },
          fantasy: { multiplier: 1.3, specialOffers: true }
        },
        features: ['mountain_timezone_support'],
        restrictions: ['no_casino'],
        ageRequirement: 21
      },

      'AZ': {
        level: 'sports_fantasy',
        permissions: ['sports_betting', 'fantasy', 'sweeps'],
        bonuses: {
          sports: { multiplier: 1.2, specialOffers: true },
          fantasy: { multiplier: 1.2, specialOffers: true }
        },
        features: [],
        restrictions: ['no_casino'],
        ageRequirement: 21
      },

      'IL': {
        level: 'sports_fantasy',
        permissions: ['sports_betting', 'fantasy', 'sweeps'],
        bonuses: {
          sports: { multiplier: 1.2, specialOffers: true },
          fantasy: { multiplier: 1.3, specialOffers: true }
        },
        features: ['enhanced_daily_fantasy'],
        restrictions: ['no_casino'],
        ageRequirement: 21
      },

      // Fantasy + Sweeps states (Large population)
      'CA': {
        level: 'fantasy_sweeps',
        permissions: ['fantasy', 'sweeps'],
        bonuses: {
          fantasy: { multiplier: 1.5, specialOffers: true },
          sweeps: { multiplier: 1.3, specialOffers: true }
        },
        features: ['california_exclusive', 'enhanced_fantasy_leagues', 'prizepicks_premium'],
        restrictions: ['no_casino', 'no_sports_betting'],
        ageRequirement: 18
      },

      'TX': {
        level: 'fantasy_sweeps',
        permissions: ['fantasy', 'sweeps'],
        bonuses: {
          fantasy: { multiplier: 1.4, specialOffers: true },
          sweeps: { multiplier: 1.3, specialOffers: true }
        },
        features: ['texas_exclusive', 'enhanced_football_fantasy'],
        restrictions: ['no_casino', 'no_sports_betting'],
        ageRequirement: 18
      },

      'FL': {
        level: 'fantasy_sweeps',
        permissions: ['fantasy', 'sweeps'],
        bonuses: {
          fantasy: { multiplier: 1.3, specialOffers: true },
          sweeps: { multiplier: 1.2, specialOffers: true }
        },
        features: ['florida_exclusive', 'enhanced_baseball_fantasy'],
        restrictions: ['no_casino', 'limited_sports_betting'],
        ageRequirement: 18
      },

      // Restricted states
      'WA': {
        level: 'restricted',
        permissions: ['sweeps'],
        bonuses: {
          sweeps: { multiplier: 0.8, specialOffers: false }
        },
        features: [],
        restrictions: ['no_fantasy', 'no_casino', 'no_sports_betting'],
        ageRequirement: 18
      },

      'ID': {
        level: 'restricted',
        permissions: ['sweeps'],
        bonuses: {
          sweeps: { multiplier: 0.8, specialOffers: false }
        },
        features: [],
        restrictions: ['no_fantasy', 'no_casino', 'no_sports_betting'],
        ageRequirement: 18
      },

      'MT': {
        level: 'limited',
        permissions: ['sports_betting', 'sweeps'],
        bonuses: {
          sports: { multiplier: 1.0, specialOffers: false },
          sweeps: { multiplier: 0.9, specialOffers: false }
        },
        features: [],
        restrictions: ['no_fantasy', 'no_casino'],
        ageRequirement: 18
      },

      'NV': {
        level: 'limited',
        permissions: ['sports_betting', 'sweeps'],
        bonuses: {
          sports: { multiplier: 1.1, specialOffers: true },
          sweeps: { multiplier: 0.9, specialOffers: false }
        },
        features: ['las_vegas_exclusive'],
        restrictions: ['no_fantasy', 'limited_online_casino'],
        ageRequirement: 21
      }
    };

    // Default permissions for states not explicitly defined
    this.defaultPermissions = {
      level: 'standard',
      permissions: ['fantasy', 'sweeps'],
      bonuses: {
        fantasy: { multiplier: 1.1, specialOffers: false },
        sweeps: { multiplier: 1.0, specialOffers: false }
      },
      features: [],
      restrictions: ['no_casino', 'no_sports_betting'],
      ageRequirement: 18
    };
  }

  /**
   * Get promotional permissions for a specific state
   * @param {string} stateCode - Two letter state code (e.g., 'CA', 'NJ')
   * @returns {Object} Permissions object for the state
   */
  getStatePermissions(stateCode) {
    if (!stateCode) return this.defaultPermissions;
    
    const upperStateCode = stateCode.toUpperCase();
    return this.statePermissions[upperStateCode] || this.defaultPermissions;
  }

  /**
   * Check if a specific promotional type is allowed in a state
   * @param {string} stateCode - Two letter state code
   * @param {string} promoType - Type of promotion ('casino', 'sports_betting', 'fantasy', 'poker', 'sweeps')
   * @returns {boolean} True if allowed
   */
  isPromoAllowed(stateCode, promoType) {
    const permissions = this.getStatePermissions(stateCode);
    return permissions.permissions.includes(promoType);
  }

  /**
   * Get bonus multiplier for a promotion type in a state
   * @param {string} stateCode - Two letter state code
   * @param {string} promoType - Type of promotion
   * @returns {number} Multiplier (1.0 = standard, >1.0 = enhanced, <1.0 = reduced)
   */
  getBonusMultiplier(stateCode, promoType) {
    const permissions = this.getStatePermissions(stateCode);
    return permissions.bonuses[promoType]?.multiplier || 1.0;
  }

  /**
   * Check if special offers are available for a promotion type in a state
   * @param {string} stateCode - Two letter state code
   * @param {string} promoType - Type of promotion
   * @returns {boolean} True if special offers available
   */
  hasSpecialOffers(stateCode, promoType) {
    const permissions = this.getStatePermissions(stateCode);
    return permissions.bonuses[promoType]?.specialOffers || false;
  }

  /**
   * Get available features for a state
   * @param {string} stateCode - Two letter state code
   * @returns {Array} Array of feature names
   */
  getAvailableFeatures(stateCode) {
    const permissions = this.getStatePermissions(stateCode);
    return permissions.features || [];
  }

  /**
   * Get restrictions for a state
   * @param {string} stateCode - Two letter state code
   * @returns {Array} Array of restriction names
   */
  getRestrictions(stateCode) {
    const permissions = this.getStatePermissions(stateCode);
    return permissions.restrictions || [];
  }

  /**
   * Get age requirement for a state
   * @param {string} stateCode - Two letter state code
   * @returns {number} Age requirement (18 or 21)
   */
  getAgeRequirement(stateCode) {
    const permissions = this.getStatePermissions(stateCode);
    return permissions.ageRequirement || 18;
  }

  /**
   * Get promotional level for a state
   * @param {string} stateCode - Two letter state code
   * @returns {string} Level ('full', 'sports_fantasy', 'fantasy_sweeps', 'limited', 'restricted', 'standard')
   */
  getPromotionalLevel(stateCode) {
    const permissions = this.getStatePermissions(stateCode);
    return permissions.level || 'standard';
  }

  /**
   * Calculate enhanced bonus amount based on state permissions
   * @param {string} stateCode - Two letter state code
   * @param {string} promoType - Type of promotion
   * @param {number} baseAmount - Base bonus amount
   * @returns {number} Enhanced bonus amount
   */
  calculateEnhancedBonus(stateCode, promoType, baseAmount) {
    const multiplier = this.getBonusMultiplier(stateCode, promoType);
    return Math.round(baseAmount * multiplier);
  }

  /**
   * Get state-specific promotional message
   * @param {string} stateCode - Two letter state code
   * @returns {string} Promotional message
   */
  getPromotionalMessage(stateCode) {
    const permissions = this.getStatePermissions(stateCode);
    const level = permissions.level;
    
    const messages = {
      'full': 'Enjoy full access to all platforms and enhanced bonuses!',
      'sports_fantasy': 'Enhanced sports betting and fantasy sports bonuses available!',
      'fantasy_sweeps': 'Enhanced fantasy sports and sweeps casino bonuses!',
      'limited': 'Limited platform access with select bonuses available.',
      'restricted': 'Limited platform access due to state regulations.',
      'standard': 'Standard fantasy sports and sweeps casino access available.'
    };
    
    return messages[level] || messages['standard'];
  }

  /**
   * Get all platforms available in a state with their promotional status
   * @param {string} stateCode - Two letter state code
   * @returns {Object} Object with platform categories and their status
   */
  getAvailablePlatforms(stateCode) {
    const permissions = this.getStatePermissions(stateCode);
    
    return {
      casino: {
        available: permissions.permissions.includes('casino'),
        enhanced: this.hasSpecialOffers(stateCode, 'casino'),
        multiplier: this.getBonusMultiplier(stateCode, 'casino')
      },
      sports_betting: {
        available: permissions.permissions.includes('sports_betting'),
        enhanced: this.hasSpecialOffers(stateCode, 'sports_betting'),
        multiplier: this.getBonusMultiplier(stateCode, 'sports_betting')
      },
      fantasy: {
        available: permissions.permissions.includes('fantasy'),
        enhanced: this.hasSpecialOffers(stateCode, 'fantasy'),
        multiplier: this.getBonusMultiplier(stateCode, 'fantasy')
      },
      poker: {
        available: permissions.permissions.includes('poker'),
        enhanced: this.hasSpecialOffers(stateCode, 'poker'),
        multiplier: this.getBonusMultiplier(stateCode, 'poker')
      },
      sweeps: {
        available: permissions.permissions.includes('sweeps'),
        enhanced: this.hasSpecialOffers(stateCode, 'sweeps'),
        multiplier: this.getBonusMultiplier(stateCode, 'sweeps')
      }
    };
  }
}

export default new PromotionalPermissionsService();