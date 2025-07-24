import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { useTheme } from '../../contexts/ThemeContext';
import { MapPin, CheckCircle, AlertCircle, Loader2, Settings } from 'lucide-react';

const LocationManager = ({ 
  userLocation, 
  onLocationUpdate, 
  onRequestPermission, 
  locationLoading, 
  locationError, 
  permissionStatus,
  onSetManualLocation,
  onClearManualLocation,
  formatLocationDisplay,
  manualLocationSet 
}) => {
  const { isDark } = useTheme();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualState, setManualState] = useState('');
  const [manualCity, setManualCity] = useState('');

  // US States for dropdown
  const US_STATES = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' }
  ];

  const handleManualLocationSubmit = () => {
    if (!manualState) {
      return;
    }

    const selectedState = US_STATES.find(state => state.code === manualState);
    const locationData = {
      city: manualCity || null,
      state: selectedState?.name || manualState,
      stateCode: manualState,
      country: 'United States',
      countryCode: 'US'
    };

    onSetManualLocation(locationData);
    setShowManualEntry(false);
    setManualState('');
    setManualCity('');
  };

  const handleClearLocation = () => {
    onClearManualLocation();
    setShowManualEntry(false);
    setManualState('');
    setManualCity('');
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'text-green-500';
      case 'denied':
        return 'text-red-500';
      case 'prompt':
        return 'text-yellow-500';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Location access granted';
      case 'denied':
        return 'Location access denied';
      case 'prompt':
        return 'Location permission required';
      default:
        return 'Location permission unknown';
    }
  };

  return (
    <Card className={`${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Location Settings
            </h3>
          </div>
          <button
            onClick={() => setShowManualEntry(!showManualEntry)}
            className={`p-2 rounded-full hover:bg-gray-100 ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-600'
            } transition-colors`}
            title="Manual location settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Current Location Display */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Current Location:
              </p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {userLocation ? formatLocationDisplay(userLocation) : 'Not detected'}
              </p>
              {userLocation && (
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Source: {userLocation.source}
                  {manualLocationSet && ' (manually set)'}
                </p>
              )}
            </div>
            {userLocation && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        </div>

        {/* Permission Status */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-sm ${getPermissionStatusColor()}`}>
              {getPermissionStatusText()}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {locationError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-700">{locationError}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(!userLocation || locationError) && (
            <button
              onClick={onRequestPermission}
              disabled={locationLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                locationLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {locationLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Detecting...
                </div>
              ) : (
                'Detect Location'
              )}
            </button>
          )}

          {manualLocationSet && (
            <button
              onClick={handleClearLocation}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Use Auto-Detect
            </button>
          )}
        </div>

        {/* Manual Location Entry */}
        {showManualEntry && (
          <div className={`border-t pt-4 ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h4 className={`font-medium mb-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Set Location Manually
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  State/Province *
                </label>
                <select
                  value={manualState}
                  onChange={(e) => setManualState(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select a state...</option>
                  {US_STATES.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  City (Optional)
                </label>
                <input
                  type="text"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  placeholder="Enter city name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleManualLocationSubmit}
                  disabled={!manualState}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !manualState
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  Set Location
                </button>
                <button
                  onClick={() => setShowManualEntry(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className={`text-xs mt-4 p-2 rounded ${
          isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-600'
        }`}>
          Your location is used only to show available platforms in your area and is not stored on our servers.
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationManager;