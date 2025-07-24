import React, { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { MapPin, RefreshCw, Settings, Eye, EyeOff } from 'lucide-react';

const LocationDebugger = () => {
  const {
    userLocation,
    locationLoading,
    locationError,
    permissionStatus,
    manualLocationSet,
    locationDetectionAttempted,
    detectLocation,
    setManualLocation,
    clearManualLocation,
    formatLocationDisplay,
    hasLocation,
    isUSLocation,
    currentState,
    currentCountry,
    locationSource
  } = useLocation();

  const [isVisible, setIsVisible] = useState(false);
  const [testState, setTestState] = useState('');

  const handleTestStateChange = (state) => {
    if (state) {
      setManualLocation({
        stateCode: state,
        stateName: getStateName(state),
        countryCode: 'US',
        countryName: 'United States',
        source: 'manual_test'
      });
    } else {
      clearManualLocation();
    }
    setTestState(state);
  };

  const getStateName = (code) => {
    const states = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
      'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
      'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
      'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
      'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
      'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
      'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
      'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
    };
    return states[code] || code;
  };

  const getStatePromotions = (state) => {
    const promotions = {
      'NJ': ['Enhanced casino bonuses', 'Full sports betting access', 'PokerStars exclusive offers'],
      'PA': ['Pennsylvania-specific PokerStars bonuses', 'Legal online casino access', 'Enhanced fantasy offers'],
      'NY': ['Enhanced fantasy sports bonuses', 'DraftKings special offers', 'Limited casino access'],
      'CA': ['Fantasy sports focus', 'Enhanced sweeps casino bonuses', 'PrizePicks exclusive offers'],
      'FL': ['Fantasy sports available', 'Sweeps casino bonuses', 'Limited sports betting'],
      'TX': ['Strong fantasy sports presence', 'Sweeps casino access', 'Enhanced PrizePicks offers'],
      'WA': ['Limited platform access', 'Restricted gambling laws', 'Fantasy sports restricted'],
      'ID': ['Limited platform access', 'Restricted gambling laws', 'Fantasy sports restricted'],
      'MT': ['Limited platform access', 'Sports betting available', 'Fantasy sports restricted'],
      'NV': ['Traditional casino focus', 'Limited online options', 'Fantasy sports restricted']
    };
    return promotions[state] || ['Standard national offers available'];
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Show Location Debugger"
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Location Debug
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <EyeOff className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {/* Current Location Status */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Location</h4>
          <div className="space-y-1 text-gray-600 dark:text-gray-300">
            <div><strong>State:</strong> {currentState || 'Unknown'}</div>
            <div><strong>Country:</strong> {currentCountry || 'Unknown'}</div>
            <div><strong>Display:</strong> {formatLocationDisplay() || 'No location detected'}</div>
            <div><strong>Source:</strong> {locationSource || 'None'}</div>
            <div><strong>Manual Set:</strong> {manualLocationSet ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Status</h4>
          <div className="space-y-1 text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${hasLocation ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Has Location: {hasLocation ? 'Yes' : 'No'}
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${isUSLocation ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              US Location: {isUSLocation ? 'Yes' : 'No'}
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                permissionStatus === 'granted' ? 'bg-green-500' : 
                permissionStatus === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></span>
              Permission: {permissionStatus}
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${locationDetectionAttempted ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
              Detection Attempted: {locationDetectionAttempted ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* State-Based Promotions */}
        {currentState && (
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {currentState} Promotions
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              {getStatePromotions(currentState).map((promo, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  {promo}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Display */}
        {locationError && (
          <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded">
            <h4 className="font-medium text-red-900 dark:text-red-200 mb-1">Error</h4>
            <p className="text-xs text-red-700 dark:text-red-300">{locationError}</p>
          </div>
        )}

        {/* Test Controls */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Test Controls</h4>
          
          {/* State Selector */}
          <div className="mb-2">
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
              Test Different State:
            </label>
            <select
              value={testState}
              onChange={(e) => handleTestStateChange(e.target.value)}
              className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Use Real Location</option>
              <option value="NJ">New Jersey (Full Casino)</option>
              <option value="PA">Pennsylvania (Casino + Sports)</option>
              <option value="NY">New York (Limited)</option>
              <option value="CA">California (Fantasy Focus)</option>
              <option value="WA">Washington (Restricted)</option>
              <option value="FL">Florida (Fantasy + Sweeps)</option>
              <option value="TX">Texas (Fantasy + Sweeps)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => detectLocation(true)}
              disabled={locationLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs px-2 py-1 rounded flex items-center justify-center"
            >
              {locationLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Detect
                </>
              )}
            </button>
            <button
              onClick={clearManualLocation}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded flex items-center justify-center"
            >
              <Settings className="h-3 w-3 mr-1" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDebugger;