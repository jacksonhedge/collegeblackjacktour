import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import locationService from '../services/LocationService';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('unknown'); // 'granted', 'denied', 'prompt', 'unknown'
  const [manualLocationSet, setManualLocationSet] = useState(false);
  const [locationDetectionAttempted, setLocationDetectionAttempted] = useState(false);

  // Check if we have cached location on mount
  useEffect(() => {
    const checkCachedLocation = () => {
      // Check for manual location first
      const manualLocation = locationService.getManualLocation();
      if (manualLocation) {
        setUserLocation(manualLocation);
        setManualLocationSet(true);
        return;
      }

      // Check for cached detected location
      const cachedLocation = locationService.getCachedLocation();
      if (cachedLocation) {
        setUserLocation(cachedLocation);
        setLocationDetectionAttempted(true);
      }
    };

    checkCachedLocation();
  }, []);

  // Check geolocation permission status
  const checkPermissionStatus = useCallback(async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return 'unknown';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(permission.state);
      
      // Listen for permission changes
      permission.onchange = () => {
        setPermissionStatus(permission.state);
      };
      
      return permission.state;
    } catch (error) {
      console.warn('Could not check geolocation permission:', error);
      return 'unknown';
    }
  }, []);

  // Detect user location
  const detectLocation = useCallback(async (force = false) => {
    // Don't detect again if we already have a manual location and not forcing
    if (manualLocationSet && !force) {
      return userLocation;
    }

    // Don't detect again if we already attempted and not forcing
    if (locationDetectionAttempted && !force && userLocation) {
      return userLocation;
    }

    setLocationLoading(true);
    setLocationError(null);

    try {
      // Check permission status first
      await checkPermissionStatus();

      // Attempt location detection
      const location = await locationService.detectLocation();
      
      setUserLocation(location);
      setLocationDetectionAttempted(true);
      setLocationError(null);
      
      console.log('Location detected successfully:', location);
      return location;
    } catch (error) {
      console.error('Location detection failed:', error);
      setLocationError(error.message);
      setLocationDetectionAttempted(true);
      
      // Set a default location or handle gracefully
      // You might want to set a default US location or prompt user
      return null;
    } finally {
      setLocationLoading(false);
    }
  }, [manualLocationSet, locationDetectionAttempted, userLocation, checkPermissionStatus]);

  // Set manual location
  const setManualLocation = useCallback((locationData) => {
    try {
      const manualLocation = locationService.setManualLocation(locationData);
      setUserLocation(manualLocation);
      setManualLocationSet(true);
      setLocationError(null);
      
      console.log('Manual location set:', manualLocation);
      return manualLocation;
    } catch (error) {
      console.error('Failed to set manual location:', error);
      setLocationError('Failed to set manual location');
      return null;
    }
  }, []);

  // Clear manual location and revert to detected location
  const clearManualLocation = useCallback(async () => {
    locationService.clearCache();
    setManualLocationSet(false);
    setUserLocation(null);
    setLocationDetectionAttempted(false);
    
    // Attempt to detect location again
    await detectLocation(true);
  }, [detectLocation]);

  // Auto-detect location on first visit if permission is granted
  useEffect(() => {
    const autoDetectLocation = async () => {
      // Don't auto-detect if we already have a location or attempted detection
      if (userLocation || locationDetectionAttempted || manualLocationSet) {
        return;
      }

      const permission = await checkPermissionStatus();
      
      // Only auto-detect if permission is already granted or if browser doesn't support permission API
      if (permission === 'granted' || permission === 'unknown') {
        detectLocation();
      }
    };

    autoDetectLocation();
  }, [userLocation, locationDetectionAttempted, manualLocationSet, detectLocation, checkPermissionStatus]);

  // Helper functions for location-based filtering
  const isPlatformAvailable = useCallback((platform) => {
    return locationService.isPlatformAvailableInLocation(platform, userLocation);
  }, [userLocation]);

  const getLocationDisclaimer = useCallback(() => {
    return locationService.getLocationDisclaimer(userLocation);
  }, [userLocation]);

  const formatLocationDisplay = useCallback(() => {
    return locationService.formatLocationDisplay(userLocation);
  }, [userLocation]);

  // Request location permission explicitly
  const requestLocationPermission = useCallback(async () => {
    try {
      setLocationLoading(true);
      await detectLocation(true);
    } catch (error) {
      console.error('Failed to request location permission:', error);
    }
  }, [detectLocation]);

  const value = {
    // Location state
    userLocation,
    locationLoading,
    locationError,
    permissionStatus,
    manualLocationSet,
    locationDetectionAttempted,

    // Location methods
    detectLocation,
    setManualLocation,
    clearManualLocation,
    requestLocationPermission,
    checkPermissionStatus,

    // Helper methods
    isPlatformAvailable,
    getLocationDisclaimer,
    formatLocationDisplay,

    // Location info
    hasLocation: !!userLocation,
    isUSLocation: userLocation?.countryCode === 'US',
    currentState: userLocation?.stateCode,
    currentCountry: userLocation?.countryCode,
    locationSource: userLocation?.source
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

export default LocationContext;