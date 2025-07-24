import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import PlatformModal from '../components/platforms/PlatformModal';
import { analyticsService } from '../services/firebase/AnalyticsService';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { promoCodeService } from '../services/PromoCodeService';
import { useTheme } from '../contexts/ThemeContext';
import WinnersTicker from '../components/home/WinnersTicker';
import { useLocation } from '../contexts/LocationContext';
import StatePromotionsCard from '../components/location/StatePromotionsCard';
import promotionalPermissionsService from '../services/PromotionalPermissionsService';

const Platforms = () => {
  const [activeCategory, setActiveCategory] = useState('SWEEPS CASINO');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [userPromoCode, setUserPromoCode] = useState(null);
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { currentState, formatLocationDisplay, hasLocation } = useLocation();
  
  // Load user's promo code when component mounts
  useEffect(() => {
    const loadUserPromoCode = async () => {
      if (currentUser?.uid) {
        const promoCode = await promoCodeService.getUserPromoCode(currentUser.uid);
        setUserPromoCode(promoCode);
        console.log("User promo code loaded:", promoCode);
      }
    };
    
    loadUserPromoCode();
  }, [currentUser]);

  const categories = [
    { id: 'ALL', label: 'ALL' },
    { id: 'FANTASY', label: 'FANTASY' },
    { id: 'SWEEPS CASINO', label: 'SWEEPS CASINO' },
    { id: 'CASINO', label: 'CASINO' },
    { id: 'SPORTS BETTING', label: 'SPORTS BETTING' },
    { id: 'POKER', label: 'POKER' }
  ];

  const platforms = [
    { 
      id: 'prizepicks', 
      name: 'PrizePicks (18+)', 
      category: 'FANTASY', 
      logo: '/images/prizepicks.png',
      legalStates: 'AK, CA, FL, GA, IL, KS, KY, MN, NE, NM, NC, OK, OR, RI, SC, SD, TX, UT, VT, WI, WY',
      promoDetails: 'Get 100% deposit match up to $100',
      restrictions: 'First-time users only. Must be 18+',
      url: 'https://app.prizepicks.com/sign-up?invite_code=WINDAILY'
    },
    { 
      id: 'draftkings', 
      name: 'DraftKings Fantasy (18+)', 
      category: 'FANTASY', 
      logo: '/images/draftkingsFantasy.png',
      legalStates: 'Most US states',
      promoDetails: 'New user bonus available',
      restrictions: 'New users only. Must be 18+',
      url: 'https://dkdfs.sng.link/Avkw3/ejal?_dl=draftkings%3A%2F%2Fgateway%3Fs%3D199744492&pcid=357597&psn=2003&pcn=xx&pscn=xx&pcrn=WDS&pscid=DFS&pcrid=xx&wpcid=357597&wpsrc=2003&wpcn=xx&wpscn=xx&wpcrn=WDS&wpscid=DFS&wpcrid=xx&_forward_params=1'
    },
    { 
      id: 'fanduel-fantasy', 
      name: 'FanDuel Fantasy (18+)', 
      category: 'FANTASY', 
      logo: '/images/fanduel.png',
      legalStates: 'Most US states',
      promoDetails: 'Special signup bonus',
      restrictions: 'New users only. Must be 18+',
      url: 'https://wlfanduelus.adsrv.eacdn.com/C.ashx?btag=a_15755b_56c_&affid=11359&siteid=15755&adid=56&c='
    },
    { 
      id: 'underdog', 
      name: 'Underdog Fantasy (18+)', 
      category: 'FANTASY', 
      logo: '/images/underdog.jpeg',
      legalStates: 'Most US states',
      promoDetails: 'Special welcome bonus',
      restrictions: 'New users only. Must be 18+',
      url: 'https://play.underdogfantasy.com/p-win-daily-sports'
    },
    {
      id: 'sportsmillions',
      name: 'Sports Millions (18+)',
      category: 'SWEEPS CASINO',
      logo: '/images/default.png', // Replace with actual logo once available
      legalStates: 'Available in most US states',
      promoDetails: 'Get free sweeps coins on signup',
      restrictions: 'Must be 18+',
      url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5414&afp={clickid}&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=PLAYBONUS&corid'
    },
    {
      id: 'mcluck',
      name: 'McLuck (18+)',
      category: 'SWEEPS CASINO',
      logo: '/images/mcluck.png',
      legalStates: 'Available in most US states',
      promoDetails: 'Get free sweeps coins on signup',
      restrictions: 'Must be 18+',
      url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5356&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid'
    },
    {
      id: 'pulsz',
      name: 'Pulsz (18+)',
      category: 'SWEEPS CASINO',
      logo: '/images/pulsz.png',
      legalStates: 'Available in most US states',
      promoDetails: 'Get free sweeps coins on signup',
      restrictions: 'Must be 18+',
      url: 'https://affiliates.pulsz.com/visit/?bta=3035&nci=5348&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid'
    },
    {
      id: 'hellomillions',
      name: 'Hello Millions (18+)',
      category: 'SWEEPS CASINO',
      logo: '/images/hellomillions.png',
      legalStates: 'Available in most US states',
      promoDetails: 'Get free sweeps coins on signup',
      restrictions: 'Must be 18+',
      url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5357&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid'
    },
    {
      id: 'crowncoins',
      name: 'Crown Coins (18+)',
      category: 'SWEEPS CASINO',
      logo: '/images/crowncoins.png',
      legalStates: 'Available in most US states',
      promoDetails: 'Get free sweeps coins on signup',
      restrictions: 'Must be 18+',
      url: 'https://crowncoinscasino.com/?landing=direct_su&utm_source=affiliates_seo&utm_content=662608032&utm_campaign=bankroll&utm_medium=bankroll&click_id={click_id}&deal_id=cfca54e2-e98f-4225-932b-80f69267d8b2'
    },
    {
      id: 'realprize',
      name: 'RealPrize (18+)',
      category: 'SWEEPS CASINO',
      logo: '/images/realprize.webp',
      legalStates: 'Available in most US states',
      promoDetails: 'Get free sweeps coins on signup',
      restrictions: 'Must be 18+',
      url: 'https://realprize.com/?af=2255&p1=662608032'
    },
    { 
      id: 'myprize', 
      name: 'MyPrize Casino (18+)', 
      category: 'CASINO', 
      logo: '/images/MyPrize.png',
      legalStates: 'Available in most US states',
      promoDetails: 'Get 5000 free coins on signup',
      restrictions: 'Must be 18+',
      url: 'https://myprize.us/invite/bankroll'
    },
    { 
      id: 'betmgm', 
      name: 'BetMGM Casino (21+)', 
      category: 'CASINO', 
      logo: '/images/betmgm.png',
      legalStates: 'MI, NJ, PA, WV',
      promoDetails: '100% deposit match up to $1000 + $25 free play',
      restrictions: 'New customers only. Must be 21+',
      url: 'https://mediaserver.betmgmpartners.com/renderBanner.do?zoneId=1728250'
    },
    { 
      id: 'caesarspalace', 
      name: 'Caesars Casino (21+)', 
      category: 'CASINO', 
      logo: '/images/caesarsCasino.png',
      legalStates: 'MI, NJ, PA, WV',
      promoDetails: '100% deposit match up to $1000 + $10 free',
      restrictions: 'New users only. Must be 21+',
      url: 'https://wlwilliamhillus.adsrv.eacdn.com/C.ashx?btag=a_13325b_2658c_&affid=450&siteid=13325&adid=2658&c='
    },
    { 
      id: 'pokerstars', 
      name: 'PokerStars Casino (21+)', 
      category: 'CASINO', 
      logo: '/images/pokerstars.png',
      legalStates: 'MI, NJ, PA',
      promoDetails: '$50 free play with first deposit',
      restrictions: 'New players only. Must be 21+',
      url: 'https://star-casino.pxf.io/c/3732491/1574555/14251'
    },
    { 
      id: 'bet365', 
      name: 'Bet365 Casino (21+)', 
      category: 'CASINO', 
      logo: '/images/bet365.png',
      legalStates: 'NJ, CO, OH, VA, IA, KY',
      promoDetails: 'Bet $1, Get $365 in Bonus Bets',
      restrictions: 'New players only. Must be 21+',
      url: 'https://casino.bet365.com/opening-bonus?affiliate=365_01276644'
    },
    { 
      id: 'wsop-casino', 
      name: 'WSOP Casino (21+)', 
      category: 'CASINO', 
      logo: '/images/WSOP.png',
      legalStates: 'MI, NJ, PA',
      promoDetails: 'Special welcome bonus for new players',
      restrictions: 'New players only. Must be 21+',
      url: 'https://www.wsop.com/casino/'
    },
    { 
      id: 'wsop-poker', 
      name: 'WSOP Poker (21+)', 
      category: 'POKER', 
      logo: '/images/WSOP.png',
      legalStates: 'MI, NJ, PA',
      promoDetails: 'Special poker welcome package',
      restrictions: 'New players only. Must be 21+',
      url: 'https://www.wsop.com/poker/'
    }
  ];

  const handlePlatformClick = (platform) => {
    analyticsService.logPlatformView(platform.id, platform.name, platform.category);
    
    // If we have a promo code, get the mapped URL for this platform
    if (userPromoCode && platform.id) {
      const mappedUrl = promoCodeService.getPlatformUrl(platform.id, userPromoCode);
      if (mappedUrl) {
        platform = {
          ...platform,
          url: mappedUrl
        };
      }
    }
    
    setSelectedPlatform(platform);
  };

  // Filter platforms based on category and location
  let filteredPlatforms = activeCategory === 'ALL' 
    ? platforms 
    : platforms.filter(platform => platform.category === activeCategory);

  // Further filter based on user's location if available
  if (hasLocation && currentState) {
    filteredPlatforms = filteredPlatforms.filter(platform => {
      const categoryPermissions = promotionalPermissionsService.getAvailablePlatforms(currentState);
      
      switch (platform.category) {
        case 'CASINO':
          return categoryPermissions.casino.available;
        case 'SPORTS BETTING':
          return categoryPermissions.sports_betting.available;
        case 'FANTASY':
          return categoryPermissions.fantasy.available;
        case 'POKER':
          return categoryPermissions.poker.available;
        case 'SWEEPS CASINO':
          return categoryPermissions.sweeps.available;
        default:
          return true;
      }
    });
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Winners Ticker */}
      <WinnersTicker />

      {/* Mobile-optimized Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Discover Apps
            </h1>
            <p className="text-sm mt-1 text-white/80">
              Earn rewards on your favorite platforms
            </p>
          </div>
          {hasLocation && (
            <div className="text-right">
              <div className="text-sm text-white/60">Location:</div>
              <div className="text-sm font-medium text-white">
                {formatLocationDisplay()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* State Promotions Card */}
      {hasLocation && currentState && (
        <div className="mb-6">
          <StatePromotionsCard />
        </div>
      )}

      {/* Category Tabs - Horizontal scroll on mobile */}
      <div className="mb-6 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex md:flex-wrap gap-2 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0
                ${activeCategory === category.id 
                  ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg' 
                  : 'bg-black/30 backdrop-blur-sm text-white hover:bg-black/40 border border-white/10'}
              `}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platforms Grid - 2 columns on mobile, responsive on larger screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredPlatforms.map((platform) => (
          <Card 
            key={platform.id}
            className={`hover:shadow-lg transition-all duration-200 cursor-pointer
              ${platform.id === 'myprize' 
                ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 border-0' 
                : 'bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:bg-black/30'}`}
            onClick={() => handlePlatformClick(platform)}
          >
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[140px] md:min-h-[200px]">
              <div className={`w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4 relative ${platform.id === 'myprize' ? 'bg-yellow-300/20 rounded-xl p-1 md:p-2' : ''}`}>
                <img
                  src={platform.logo}
                  alt={platform.name}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    const parent = e.currentTarget.parentNode;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-16 h-16 md:w-24 md:h-24 bg-gray-200 md:bg-gray-700 rounded-full flex items-center justify-center';
                      fallback.innerHTML = `<span class="text-lg md:text-xl font-bold text-gray-400">${platform.name.charAt(0)}</span>`;
                      parent.replaceChild(fallback, e.currentTarget);
                    }
                  }}
                />
              </div>
              <h3 className={`text-center font-medium text-xs md:text-sm ${
                platform.id === 'myprize' 
                  ? 'text-gray-900' 
                  : isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {platform.name}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Modal */}
      {selectedPlatform && (
        <PlatformModal
          platform={selectedPlatform}
          onClose={() => setSelectedPlatform(null)}
        />
      )}

      {/* Responsible Gaming Footer - Smaller on mobile */}
      <div className={`mt-8 text-center text-xs md:text-sm px-4 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Responsible Gaming: Please gamble responsibly. If you or someone you know has a gambling problem and wants help, call 1-800-522-4700
      </div>
    </div>
  );
};

export default Platforms;
