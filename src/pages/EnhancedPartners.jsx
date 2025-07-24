import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { analyticsService } from '../services/firebase/AnalyticsService';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useLocation } from '../contexts/LocationContext';
import { usePlatforms } from '../contexts/PlatformsContext';
import { enhancedPromoCodeService } from '../services/EnhancedPromoCodeService';
import LocationIndicator from '../components/location/LocationIndicator';
import PlatformLogo from '../components/ui/PlatformLogo';
import { ExternalLink, MapPin, AlertTriangle, Tag, Star } from 'lucide-react';

const EnhancedPartners = () => {
  const [activeCategory, setActiveCategory] = useState('SPORTSBOOK');
  const { currentUser } = useAuth();
  const [platformUrls, setPlatformUrls] = useState({});
  const [userPromoCodes, setUserPromoCodes] = useState({
    permanentAffiliateCode: null,
    activePromoCodes: [],
    userReferralCode: null
  });
  
  // Location context
  const {
    userLocation,
    formatLocationDisplay,
    detectLocation,
    requestLocationPermission,
    locationLoading,
    locationError,
    permissionStatus,
    setManualLocation,
    clearManualLocation,
    manualLocationSet,
    getLocationDisclaimer
  } = useLocation();

  // Platforms context (now location-aware)
  const {
    platforms,
    availablePlatforms,
    totalPlatforms,
    getPlatformOffer,
    getPlatformDisclaimer,
    isPlatformAvailable
  } = usePlatforms();

  const categories = [
    { id: 'SPORTSBOOK', label: 'Sportsbook' },
    { id: 'CASINO', label: 'Casino' },
    { id: 'FANTASY', label: 'Fantasy Football' },
    { id: 'SWEEPS', label: 'Sweeps Casino' },
    { id: 'LOTTERY', label: 'Lottery' }
  ];

  // Load user's custom platform URLs and promo codes
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser?.id) {
        // Get all platform URLs for user
        const urls = await enhancedPromoCodeService.getAllPlatformUrls(currentUser.id);
        setPlatformUrls(urls);
        
        // Get user's promo codes
        const codes = await enhancedPromoCodeService.getUserPromoCodes(currentUser.id);
        setUserPromoCodes(codes);
      } else {
        // Load default URLs for non-logged-in users
        const urls = await enhancedPromoCodeService.getAllPlatformUrls(null);
        setPlatformUrls(urls);
      }
    };
    
    loadUserData();
  }, [currentUser]);

  // Map platform categories to our Partners page categories
  const mapPlatformCategory = (category) => {
    switch (category) {
      case 'SPORTS': return 'SPORTSBOOK';
      case 'SWEEPS_CASINO': return 'SWEEPS';
      default: return category;
    }
  };

  // Filter platforms by category using context data
  const filteredPlatforms = platforms.filter(platform => {
    const mappedCategory = mapPlatformCategory(platform.category);
    return mappedCategory === activeCategory;
  });

  // Map legacy platform data with dynamic URLs
  const allPlatforms = filteredPlatforms.map(platform => ({
    ...platform,
    url: platformUrls[platform.id] || platform.url || '#'
  }));

  const handlePlatformClick = async (platform) => {
    analyticsService.logPlatformView(platform.id, platform.name, platform.category);
    
    // Get the custom URL for this platform
    const customUrl = platformUrls[platform.id] || platform.url;
    
    if (customUrl) {
      // Replace any placeholders in the URL
      const finalUrl = enhancedPromoCodeService.replacePlaceholders(customUrl, {
        userId: currentUser?.id || '',
        clickId: Date.now().toString(),
        refCode: userPromoCodes.permanentAffiliateCode || userPromoCodes.userReferralCode || '',
        source: 'bankroll_partners',
        campaign: activeCategory.toLowerCase()
      });
      
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Connected':
        return 'text-green-500';
      case 'Available':
        return 'text-blue-500';
      case 'Coming Soon':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const hasCustomUrl = (platformId) => {
    return platformUrls[platformId] && platformUrls[platformId] !== allPlatforms.find(p => p.id === platformId)?.url;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Location Indicator */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Partner Platforms
          </h1>
          <p className="text-sm text-gray-400">
            Discover gaming platforms available in your area
          </p>
          
          {/* Show active promo codes */}
          {currentUser && (userPromoCodes.permanentAffiliateCode || userPromoCodes.activePromoCodes.length > 0) && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Tag className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400">
                {userPromoCodes.permanentAffiliateCode ? 
                  `Affiliate: ${userPromoCodes.permanentAffiliateCode}` :
                  `Active codes: ${userPromoCodes.activePromoCodes.join(', ')}`
                }
              </span>
            </div>
          )}
        </div>
        <LocationIndicator
          userLocation={userLocation}
          formatLocationDisplay={formatLocationDisplay}
          onLocationUpdate={detectLocation}
          onRequestPermission={requestLocationPermission}
          locationLoading={locationLoading}
          locationError={locationError}
          permissionStatus={permissionStatus}
          onSetManualLocation={setManualLocation}
          onClearManualLocation={clearManualLocation}
          manualLocationSet={manualLocationSet}
          availablePlatforms={availablePlatforms}
          totalPlatforms={totalPlatforms}
        />
      </div>

      {/* Location Alert */}
      {!userLocation && (
        <div className="mb-4 p-4 rounded-lg border bg-yellow-900/20 border-yellow-700 text-yellow-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">
              Enable location detection to see platforms available in your area. Some platforms may have location restrictions.
            </p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="mb-8">
        <div className="flex gap-3 flex-wrap justify-center">
          {categories.map((category) => {
            const count = platforms.filter(p => mapPlatformCategory(p.category) === category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                  ${activeCategory === category.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-gray-700'}
                `}
              >
                {category.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCategory === category.id 
                    ? 'bg-purple-500' 
                    : 'bg-purple-900/50'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {allPlatforms.map((platform) => (
          <Card 
            key={platform.id}
            className={`bg-gray-800/50 border-purple-500/20 hover:border-purple-500/40 
              cursor-pointer transition-all duration-200 ${
                hasCustomUrl(platform.id) ? 'ring-2 ring-purple-500/30' : ''
              }`}
            onClick={() => handlePlatformClick(platform)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 flex-shrink-0 relative">
                  <PlatformLogo
                    src={platform.logo || `/images/${platform.imageFile}`}
                    alt={platform.name}
                    name={platform.name}
                    className="w-full h-full object-contain rounded-lg"
                    gradientStart={platform.gradientStart}
                    gradientEnd={platform.gradientEnd}
                  />
                  {hasCustomUrl(platform.id) && (
                    <div className="absolute -top-2 -right-2 bg-purple-600 rounded-full p-1">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg mb-1 text-white">
                      {platform.name}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-sm mb-2 text-gray-400">
                    {platform.description || getPlatformOffer(platform)}
                  </p>
                  
                  {/* Location-specific promo offer */}
                  {getPlatformOffer(platform) && platform.description && (
                    <p className="text-xs mb-2 px-2 py-1 rounded bg-green-900/20 text-green-300">
                      {getPlatformOffer(platform)}
                    </p>
                  )}
                  
                  {/* Show if using custom affiliate URL */}
                  {hasCustomUrl(platform.id) && (
                    <p className="text-xs mb-1 text-purple-400">
                      ✨ Exclusive partner link
                    </p>
                  )}
                  
                  <p className={`text-sm font-medium ${getStatusColor(platform.status || 'Available')}`}>
                    {platform.status || 'Available'}
                  </p>
                  
                  {/* Age requirement display */}
                  {platform.ageRequirement && (
                    <p className="text-xs mt-1 text-gray-500">
                      {platform.ageRequirement}+ only
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Location-specific Legal Disclaimer */}
      <div className="mt-8 p-4 rounded-lg text-center text-sm bg-gray-800/50 border border-gray-700 text-gray-400">
        <p>{getLocationDisclaimer()}</p>
        {userLocation && (
          <p className="mt-2 text-xs">
            Showing platforms available in {formatLocationDisplay(userLocation)}
          </p>
        )}
        {currentUser && userPromoCodes.permanentAffiliateCode && (
          <p className="mt-2 text-xs text-purple-400">
            Links customized for affiliate code: {userPromoCodes.permanentAffiliateCode}
          </p>
        )}
      </div>

    </div>
  );
};

export default EnhancedPartners;