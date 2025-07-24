import React from 'react';
import { useLocation } from '../../contexts/LocationContext';
import promotionalPermissionsService from '../../services/PromotionalPermissionsService';
import { Star, Gift, MapPin, AlertCircle } from 'lucide-react';

const StatePromotionsCard = () => {
  const { currentState, formatLocationDisplay, hasLocation } = useLocation();

  if (!hasLocation || !currentState) {
    return null;
  }

  const permissions = promotionalPermissionsService.getStatePermissions(currentState);
  const platforms = promotionalPermissionsService.getAvailablePlatforms(currentState);
  const features = promotionalPermissionsService.getAvailableFeatures(currentState);
  const restrictions = promotionalPermissionsService.getRestrictions(currentState);
  const promoMessage = promotionalPermissionsService.getPromotionalMessage(currentState);

  const getLevelColor = (level) => {
    switch (level) {
      case 'full': return 'from-green-500 to-emerald-600';
      case 'sports_fantasy': return 'from-blue-500 to-indigo-600';
      case 'fantasy_sweeps': return 'from-purple-500 to-violet-600';
      case 'limited': return 'from-yellow-500 to-orange-600';
      case 'restricted': return 'from-red-500 to-rose-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'full': return <Star className="h-5 w-5" />;
      case 'sports_fantasy': return <Gift className="h-5 w-5" />;
      case 'fantasy_sweeps': return <Gift className="h-5 w-5" />;
      case 'limited': return <AlertCircle className="h-5 w-5" />;
      case 'restricted': return <AlertCircle className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getLevelColor(permissions.level)} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getLevelIcon(permissions.level)}
            <h3 className="text-lg font-semibold">
              {formatLocationDisplay()} Promotions
            </h3>
          </div>
          <div className="text-sm font-medium bg-white/20 rounded-full px-3 py-1">
            {permissions.level.toUpperCase().replace('_', ' ')}
          </div>
        </div>
        <p className="text-sm mt-2 text-white/90">
          {promoMessage}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Available Platforms */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Available Platforms
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(platforms).map(([platform, details]) => (
              <div
                key={platform}
                className={`p-2 rounded-lg border text-sm ${
                  details.available
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {platform.replace('_', ' ')}
                  </span>
                  {details.available && details.enhanced && (
                    <Star className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
                {details.available && details.multiplier !== 1 && (
                  <div className="text-xs mt-1">
                    {details.multiplier > 1 
                      ? `${Math.round((details.multiplier - 1) * 100)}% bonus boost`
                      : `${Math.round((1 - details.multiplier) * 100)}% reduced`
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Special Features */}
        {features.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Special Features
            </h4>
            <div className="space-y-1">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Star className="h-3 w-3 text-yellow-500 mr-2 flex-shrink-0" />
                  <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restrictions */}
        {restrictions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Restrictions
            </h4>
            <div className="space-y-1">
              {restrictions.map((restriction, index) => (
                <div key={index} className="flex items-center text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="capitalize">{restriction.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Age Requirement */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center text-sm text-blue-900 dark:text-blue-200">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="font-medium">
              Age Requirement: {permissions.ageRequirement}+ years old
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatePromotionsCard;