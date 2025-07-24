// LocationService.js - Handles user location detection and management
class LocationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    this.ipLocationCache = null;
    this.ipLocationCacheTimeout = 30 * 60 * 1000; // 30 minutes for IP location
  }

  // US state codes mapping
  static US_STATES = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
    'District of Columbia': 'DC'
  };

  // Get user location using browser geolocation API
  async getBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: false, // Faster, uses network-based location
        timeout: 10000, // 10 seconds timeout
        maximumAge: this.cacheTimeout // Use cached location if available
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocode to get state/country
            const locationData = await this.reverseGeocode(latitude, longitude);
            
            const result = {
              latitude,
              longitude,
              accuracy: position.coords.accuracy,
              source: 'browser',
              timestamp: Date.now(),
              ...locationData
            };

            // Cache the result
            this.cache.set('browser_location', {
              data: result,
              timestamp: Date.now()
            });

            resolve(result);
          } catch (error) {
            console.warn('Error reverse geocoding browser location:', error);
            // Return basic location data even if reverse geocoding fails
            resolve({
              latitude,
              longitude,
              accuracy: position.coords.accuracy,
              source: 'browser',
              timestamp: Date.now(),
              state: null,
              stateCode: null,
              country: null,
              countryCode: null
            });
          }
        },
        (error) => {
          console.warn('Browser geolocation error:', error.message);
          reject(error);
        },
        options
      );
    });
  }

  // Get location using IP-based service (fallback)
  async getIPLocation() {
    try {
      // Check cache first
      if (this.ipLocationCache && 
          Date.now() - this.ipLocationCache.timestamp < this.ipLocationCacheTimeout) {
        return this.ipLocationCache.data;
      }

      // Try multiple IP geolocation services for reliability
      const services = [
        'https://ipapi.co/json/',
        'https://api.ipify.org?format=json', // Just for IP, need additional service for location
        'https://freegeoip.app/json/' // Backup service
      ];

      let result = null;
      
      // Try primary service (ipapi.co)
      try {
        const response = await fetch('https://ipapi.co/json/', {
          timeout: 5000
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.error) {
            throw new Error(`IP location service error: ${data.reason}`);
          }

          result = {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            state: data.region,
            stateCode: data.region_code,
            country: data.country_name,
            countryCode: data.country_code,
            zipCode: data.postal,
            source: 'ip',
            timestamp: Date.now(),
            accuracy: 50000 // Approximate accuracy for IP-based location (50km)
          };
        }
      } catch (error) {
        console.warn('Primary IP location service failed:', error);
      }

      // Try backup service if primary failed
      if (!result) {
        try {
          const response = await fetch('https://freegeoip.app/json/', {
            timeout: 5000
          });
          
          if (response.ok) {
            const data = await response.json();
            
            result = {
              latitude: data.latitude,
              longitude: data.longitude,
              city: data.city,
              state: data.region_name,
              stateCode: data.region_code,
              country: data.country_name,
              countryCode: data.country_code,
              zipCode: data.zip_code,
              source: 'ip',
              timestamp: Date.now(),
              accuracy: 50000
            };
          }
        } catch (error) {
          console.warn('Backup IP location service failed:', error);
        }
      }

      if (!result) {
        throw new Error('All IP location services failed');
      }

      // Normalize state code for US locations
      if (result.countryCode === 'US' && result.state && !result.stateCode) {
        result.stateCode = LocationService.US_STATES[result.state] || result.state;
      }

      // Cache the result
      this.ipLocationCache = {
        data: result,
        timestamp: Date.now()
      };

      return result;
    } catch (error) {
      console.error('IP location detection failed:', error);
      throw error;
    }
  }

  // Reverse geocode coordinates to get state/country information
  async reverseGeocode(latitude, longitude) {
    try {
      // Use a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { timeout: 5000 }
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract state and country information
      const result = {
        city: data.city || data.locality,
        state: data.principalSubdivision,
        stateCode: data.principalSubdivisionCode ? 
          data.principalSubdivisionCode.split('-')[1] : null, // Remove country prefix
        country: data.countryName,
        countryCode: data.countryCode,
        zipCode: data.postcode
      };

      // Normalize state code for US locations
      if (result.countryCode === 'US' && result.state && !result.stateCode) {
        result.stateCode = LocationService.US_STATES[result.state] || result.state;
      }

      return result;
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return {
        city: null,
        state: null,
        stateCode: null,
        country: null,
        countryCode: null,
        zipCode: null
      };
    }
  }

  // Main method to detect user location (tries browser first, then IP)
  async detectLocation() {
    try {
      // Try browser geolocation first
      const location = await this.getBrowserLocation();
      console.log('Location detected via browser:', location);
      return location;
    } catch (browserError) {
      console.warn('Browser geolocation failed, trying IP location:', browserError.message);
      
      try {
        // Fallback to IP-based location
        const location = await this.getIPLocation();
        console.log('Location detected via IP:', location);
        return location;
      } catch (ipError) {
        console.error('All location detection methods failed:', ipError);
        throw new Error('Unable to detect location: Both browser and IP location services failed');
      }
    }
  }

  // Get cached location if available and not expired
  getCachedLocation() {
    const cached = this.cache.get('browser_location');
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    if (this.ipLocationCache && 
        Date.now() - this.ipLocationCache.timestamp < this.ipLocationCacheTimeout) {
      return this.ipLocationCache.data;
    }

    return null;
  }

  // Manually set user location (for user override)
  setManualLocation(locationData) {
    const manualLocation = {
      ...locationData,
      source: 'manual',
      timestamp: Date.now()
    };

    // Cache manual location with longer expiry
    this.cache.set('manual_location', {
      data: manualLocation,
      timestamp: Date.now()
    });

    return manualLocation;
  }

  // Get manual location if set
  getManualLocation() {
    const cached = this.cache.get('manual_location');
    if (cached) {
      return cached.data;
    }
    return null;
  }

  // Clear all cached location data
  clearCache() {
    this.cache.clear();
    this.ipLocationCache = null;
  }

  // Check if a platform is available in the user's location
  isPlatformAvailableInLocation(platform, userLocation) {
    if (!userLocation || !platform) {
      return true; // Default to available if no location data
    }

    // If platform has no location restrictions, it's available everywhere
    if (!platform.restrictedStates && !platform.allowedStates && 
        !platform.restrictedCountries && !platform.allowedCountries) {
      return true;
    }

    const userCountry = userLocation.countryCode;
    const userState = userLocation.stateCode;

    // Check country restrictions first
    if (platform.restrictedCountries && platform.restrictedCountries.includes(userCountry)) {
      return false;
    }

    if (platform.allowedCountries && !platform.allowedCountries.includes(userCountry)) {
      return false;
    }

    // For US-specific state restrictions
    if (userCountry === 'US' && userState) {
      if (platform.restrictedStates && platform.restrictedStates.includes(userState)) {
        return false;
      }

      if (platform.allowedStates && !platform.allowedStates.includes(userState)) {
        return false;
      }
    }

    return true;
  }

  // Get location-specific legal disclaimer
  getLocationDisclaimer(userLocation) {
    if (!userLocation) {
      return 'Please gamble responsibly. Gambling regulations vary by location.';
    }

    const { countryCode, stateCode } = userLocation;

    // US-specific disclaimers by state
    if (countryCode === 'US') {
      const stateDisclaimers = {
        'NV': 'Nevada residents: Gambling problem? Call 1-800-522-4700.',
        'NJ': 'New Jersey residents: If you or someone you know has a gambling problem, call 1-800-GAMBLER.',
        'PA': 'Pennsylvania residents: If you or someone you know has a gambling problem, call 1-800-GAMBLER.',
        'MI': 'Michigan residents: If you or someone you know has a gambling problem, call 1-800-270-7117.',
        'CA': 'California residents: Gambling problem? Call 1-800-GAMBLER.',
        'NY': 'New York residents: If you or someone you know has a gambling problem, call 1-877-8-HOPENY.'
      };

      return stateDisclaimers[stateCode] || 
        'Please gamble responsibly. If you or someone you know has a gambling problem, call 1-800-522-4700.';
    }

    // Default disclaimer for other countries
    return 'Please gamble responsibly. Gambling regulations vary by location.';
  }

  // Format location for display
  formatLocationDisplay(location) {
    if (!location) {
      return 'Location not detected';
    }

    const parts = [];
    
    if (location.city) {
      parts.push(location.city);
    }
    
    if (location.stateCode && location.countryCode === 'US') {
      parts.push(location.stateCode);
    } else if (location.state) {
      parts.push(location.state);
    }
    
    if (location.countryCode && location.countryCode !== 'US') {
      parts.push(location.countryCode);
    }

    return parts.join(', ') || `${location.source} location`;
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;