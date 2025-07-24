import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { analyticsService } from '../services/firebase/AnalyticsService';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useLocation } from '../contexts/LocationContext';
import { usePlatforms } from '../contexts/PlatformsContext';
import LocationIndicator from '../components/location/LocationIndicator';
import { ExternalLink, MapPin, AlertTriangle } from 'lucide-react';

const Partners = () => {
  const [activeCategory, setActiveCategory] = useState('SPORTSBOOK');
  const { currentUser } = useAuth();
  
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

  // Legacy platform mapping for compatibility
  const allPlatforms = [
    // Sportsbook Partners
    { 
      id: 'draftkings-sportsbook', 
      name: 'DraftKings Sportsbook', 
      category: 'SPORTSBOOK', 
      logo: '/images/draftkings.png',
      description: 'Premier sports betting platform',
      status: 'Connected',
      url: 'https://dksb.sng.link/As9kz/0uj4?_dl=https%3A%2F%2Fsportsbook.draftkings.com%2Fgateway%3Fs%3D471182079&pcid=414490&psn=3084&pcn=SSB18&pscn=100DB_50BB&pcrn=1&pscid=xx&pcrid=xx&wpcid=414490&wpsrc=3084&wpcn=SSB18&wpscn=100DB_50BB&wpcrn=1&wpscid=xx&wpcrid=xx&_forward_params=1'
    },
    { 
      id: 'fanduel-sportsbook', 
      name: 'FanDuel Sportsbook', 
      category: 'SPORTSBOOK', 
      logo: '/images/fanduel.png',
      description: 'America\'s #1 Sportsbook',
      status: 'Connected',
      url: 'https://wlfanduelus.adsrv.eacdn.com/C.ashx?btag=a_42626b_16c_&affid=5594&siteid=42626&adid=16&c=662608032'
    },
    { 
      id: 'fanatics-sportsbook', 
      name: 'Fanatics Sportsbook', 
      category: 'SPORTSBOOK', 
      logo: '/images/fanatics.png',
      description: 'Sports betting with FanCash rewards',
      status: 'Connected',
      url: 'https://track.fanaticsbettingpartners.com/track/d2ed08a4-86b2-4b78-8e8b-37ba1c9a20dd?type=seo&s1=662608032'
    },
    { 
      id: 'betmgm-sportsbook', 
      name: 'BetMGM Sportsbook', 
      category: 'SPORTSBOOK', 
      logo: '/images/betmgm.png',
      description: 'King of Sportsbooks',
      status: 'Connected',
      url: 'https://sports.betmgm.com'
    },
    { 
      id: 'caesars-sportsbook', 
      name: 'Caesars Sportsbook', 
      category: 'SPORTSBOOK', 
      logo: '/images/caesars.png',
      description: 'Official sportsbook of the NFL',
      status: 'Connected',
      url: 'https://sportsbook.caesars.com'
    },
    { 
      id: 'espn-bet', 
      name: 'ESPN BET', 
      category: 'SPORTSBOOK', 
      logo: '/images/espnBet.png',
      description: 'The ultimate sports betting experience',
      status: 'Connected',
      url: 'https://espnbet.com'
    },
    { 
      id: 'betrivers', 
      name: 'BetRivers', 
      category: 'SPORTSBOOK', 
      logo: '/images/betRivers.png',
      description: 'Get in on the action',
      status: 'Connected',
      url: 'https://betrivers.com'
    },

    // Casino Partners
    { 
      id: 'draftkings-casino', 
      name: 'DraftKings Casino', 
      category: 'CASINO', 
      logo: '/images/draftkingsCasino.jpeg',
      description: 'Casino games & live dealer',
      status: 'Connected',
      url: 'https://dksb.sng.link/As9kz/0uj4?_dl=https%3A%2F%2Fsportsbook.draftkings.com%2Fgateway%3Fs%3D471182079&pcid=414490&psn=3084&pcn=SSB18&pscn=100DB_50BB&pcrn=1&pscid=xx&pcrid=xx&wpcid=414490&wpsrc=3084&wpcn=SSB18&wpscn=100DB_50BB&wpcrn=1&wpscid=xx&wpcrid=xx&_forward_params=1'
    },
    { 
      id: 'fanduel-casino', 
      name: 'FanDuel Casino', 
      category: 'CASINO', 
      logo: '/images/fanduelCasino.jpg',
      description: 'Real money casino games',
      status: 'Connected',
      url: 'https://wlfanduelus.adsrv.eacdn.com/C.ashx?btag=a_42627b_50c_&affid=5594&siteid=42627&adid=50&c=662608032'
    },
    { 
      id: 'fanatics-casino', 
      name: 'Fanatics Casino', 
      category: 'CASINO', 
      logo: '/images/fanatics.png',
      description: 'Casino with FanCash rewards',
      status: 'Connected',
      url: 'https://casino.fanatics.com'
    },
    { 
      id: 'betmgm-casino', 
      name: 'BetMGM Casino', 
      category: 'CASINO', 
      logo: '/images/betmgm.png',
      description: 'King of Casino',
      status: 'Connected',
      url: 'https://casino.betmgm.com'
    },
    { 
      id: 'caesars-casino', 
      name: 'Caesars Casino', 
      category: 'CASINO', 
      logo: '/images/caesarsCasino.png',
      description: 'Classic casino experience',
      status: 'Connected',
      url: 'https://casino.caesars.com'
    },
    { 
      id: 'borgata', 
      name: 'Borgata Casino', 
      category: 'CASINO', 
      logo: '/images/BorgataPoker.png',
      description: 'NJ\'s premier online casino',
      status: 'Connected',
      url: 'https://casino.borgataonline.com'
    },

    // Fantasy Football Partners
    { 
      id: 'prizepicks', 
      name: 'PrizePicks', 
      category: 'FANTASY', 
      logo: '/images/prizepicks.png',
      description: 'Daily Fantasy Sports made simple',
      status: 'Connected',
      url: 'https://app.prizepicks.com/sign-up?invite_code=WINDAILY'
    },
    { 
      id: 'underdog', 
      name: 'Underdog Fantasy', 
      category: 'FANTASY', 
      logo: '/images/underdog.jpeg',
      description: 'Pick\'em & Best Ball',
      status: 'Connected',
      url: 'https://play.underdogfantasy.com/p-win-daily-sports'
    },
    { 
      id: 'sleeper', 
      name: 'Sleeper', 
      category: 'FANTASY', 
      logo: '/images/sleeperFantasy.png',
      description: 'Fantasy leagues & chat',
      status: 'Connected',
      url: 'https://sleeper.app'
    },
    { 
      id: 'espn-fantasy', 
      name: 'ESPN Fantasy', 
      category: 'FANTASY', 
      logo: '/images/espnFantasy.png',
      description: 'Fantasy sports leader',
      status: 'Connected',
      url: 'https://fantasy.espn.com'
    },
    { 
      id: 'yahoo-fantasy', 
      name: 'Yahoo Fantasy', 
      category: 'FANTASY', 
      logo: '/images/yahoofantasy.png',
      description: 'Fantasy sports & daily games',
      status: 'Connected',
      url: 'https://sports.yahoo.com/fantasy'
    },
    { 
      id: 'betr-fantasy', 
      name: 'Betr Fantasy', 
      category: 'FANTASY', 
      logo: '/images/betrFantasy.png',
      description: 'Micro-betting fantasy',
      status: 'Connected',
      url: 'https://betr.app'
    },

    // Sweeps Casino Partners
    { 
      id: 'mcluck', 
      name: 'McLuck', 
      category: 'SWEEPS', 
      logo: '/images/mcluck.png',
      description: 'Social casino with sweeps',
      status: 'Available',
      url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5356&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid'
    },
    { 
      id: 'pulsz', 
      name: 'Pulsz', 
      category: 'SWEEPS', 
      logo: '/images/pulsz.png',
      description: 'Free-to-play social casino',
      status: 'Available',
      url: 'https://affiliates.pulsz.com/visit/?bta=3035&nci=5348&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid'
    },
    { 
      id: 'hello-millions', 
      name: 'Hello Millions', 
      category: 'SWEEPS', 
      logo: '/images/hellomillions.png',
      description: 'Sweepstakes casino',
      status: 'Available',
      url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5357&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid'
    },
    { 
      id: 'crown-coins', 
      name: 'Crown Coins', 
      category: 'SWEEPS', 
      logo: '/images/crowncoins.png',
      description: 'Social casino gaming',
      status: 'Available',
      url: 'https://crowncoinscasino.com/?landing=direct_su&utm_source=affiliates_seo&utm_content=662608032&utm_campaign=bankroll&utm_medium=bankroll&click_id={click_id}&deal_id=cfca54e2-e98f-4225-932b-80f69267d8b2'
    },
    { 
      id: 'sportsmillions', 
      name: 'Sports Millions', 
      category: 'SWEEPS', 
      logo: '/images/sportsmillions.png',
      description: 'Sports-themed sweepstakes',
      status: 'Available',
      url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5414&afp={clickid}&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=PLAYBONUS&corid'
    },
    { 
      id: 'realprize', 
      name: 'RealPrize', 
      category: 'SWEEPS', 
      logo: '/images/realprize.webp',
      description: 'Win real prizes',
      status: 'Available',
      url: 'https://realprize.com/?af=2255&p1=662608032'
    },
    { 
      id: 'chumba', 
      name: 'Chumba Casino', 
      category: 'SWEEPS', 
      logo: '/images/chumba.png',
      description: 'America\'s #1 social casino',
      status: 'Available',
      url: 'https://chumbacasino.com'
    },
    { 
      id: 'luckyland', 
      name: 'LuckyLand Slots', 
      category: 'SWEEPS', 
      logo: '/images/luckyland.png',
      description: 'Social slots & sweeps',
      status: 'Available',
      url: 'https://luckylandslots.com'
    },
    { 
      id: 'wow-vegas', 
      name: 'WOW Vegas', 
      category: 'SWEEPS', 
      logo: '/images/wowvegas.png',
      description: 'Social casino experience',
      status: 'Available',
      url: 'https://wowvegas.com'
    },
    { 
      id: 'high5', 
      name: 'High 5 Casino', 
      category: 'SWEEPS', 
      logo: '/images/high5.png',
      description: 'Social casino with real prizes',
      status: 'Available',
      url: 'https://high5casino.com'
    },

    // Lottery Partners (placeholder for now)
    { 
      id: 'jackpocket', 
      name: 'Jackpocket', 
      category: 'LOTTERY', 
      logo: '/images/jackpocket.png',
      description: 'Official lottery app',
      status: 'Coming Soon',
      url: 'https://jackpocket.com'
    }
  ];

  const handlePlatformClick = (platform) => {
    analyticsService.logPlatformView(platform.id, platform.name, platform.category);
    // Open the platform URL in a new tab
    if (platform.url) {
      window.open(platform.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Use the location-aware filtered platforms from context
  const currentCategoryPlatforms = filteredPlatforms;

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
        {currentCategoryPlatforms.map((platform) => (
          <Card 
            key={platform.id}
            className="bg-gray-800/50 border-purple-500/20 hover:border-purple-500/40 
              cursor-pointer transition-all duration-200"
            onClick={() => handlePlatformClick(platform)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={platform.logo}
                    alt={platform.name}
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/images/BankrollLogoTransparent.png';
                    }}
                  />
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
      </div>

    </div>
  );
};

export default Partners;