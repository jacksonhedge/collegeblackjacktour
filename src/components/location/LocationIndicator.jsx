import React, { useState } from 'react';
import { MapPin, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import LocationManager from './LocationManager';

const LocationIndicator = ({ 
  userLocation, 
  formatLocationDisplay,
  onLocationUpdate,
  onRequestPermission,
  locationLoading,
  locationError,
  permissionStatus,
  onSetManualLocation,
  onClearManualLocation,
  manualLocationSet,
  availablePlatforms,
  totalPlatforms 
}) => {
  const { isDark } = useTheme();
  const [showManager, setShowManager] = useState(false);

  const getLocationStatus = () => {
    if (locationError) return 'error';
    if (userLocation) return 'detected';
    return 'none';
  };

  const getStatusIcon = () => {
    const status = getLocationStatus();
    const iconClass = "w-4 h-4";
    
    switch (status) {
      case 'detected':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      default:
        return <MapPin className={`${iconClass} ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />;
    }
  };

  const getStatusText = () => {
    const status = getLocationStatus();
    
    switch (status) {
      case 'detected':
        return formatLocationDisplay(userLocation);
      case 'error':
        return 'Location unavailable';
      default:
        return 'Location not set';
    }
  };

  const getStatusColor = () => {
    const status = getLocationStatus();
    
    switch (status) {
      case 'detected':
        return isDark ? 'text-green-400' : 'text-green-600';
      case 'error':
        return 'text-red-500';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <>
      {/* Compact Location Indicator */}
      <div 
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
          isDark 
            ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setShowManager(!showManager)}
        title="Click to manage location settings"
      >
        {getStatusIcon()}
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-medium truncate ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {userLocation && availablePlatforms !== undefined && (
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {availablePlatforms} of {totalPlatforms} platforms available
            </span>
          )}
        </div>
        <Settings className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'} ml-1`} />
      </div>

      {/* Location Manager Modal/Dropdown */}
      {showManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="relative max-w-md w-full max-h-[90vh] overflow-auto">
            <LocationManager
              userLocation={userLocation}
              onLocationUpdate={onLocationUpdate}
              onRequestPermission={onRequestPermission}
              locationLoading={locationLoading}
              locationError={locationError}
              permissionStatus={permissionStatus}
              onSetManualLocation={onSetManualLocation}
              onClearManualLocation={onClearManualLocation}
              formatLocationDisplay={formatLocationDisplay}
              manualLocationSet={manualLocationSet}
            />
            <button
              onClick={() => setShowManager(false)}
              className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'
              } shadow-lg border hover:shadow-xl transition-all`}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LocationIndicator;