import React from 'react';
import { PlatformsProvider } from '../../contexts/PlatformsContext';
import { useLocation } from '../../contexts/LocationContext';

// Wrapper component that connects LocationContext to PlatformsProvider
const LocationAwarePlatformsProvider = ({ children }) => {
  const { userLocation } = useLocation();

  return (
    <PlatformsProvider userLocation={userLocation}>
      {children}
    </PlatformsProvider>
  );
};

export default LocationAwarePlatformsProvider;