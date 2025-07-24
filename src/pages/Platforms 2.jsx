import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import PlatformModal from '../components/platforms/PlatformModal';
import { analyticsService } from '../services/firebase/AnalyticsService';

const Platforms = () => {
  const [activeCategory, setActiveCategory] = useState('CASINO');
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const categories = [
    { id: 'ALL', label: 'ALL' },
    { id: 'FANTASY', label: 'FANTASY' },
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
      id: 'myprize', 
      name: 'MyPrize Casino (18+)', 
      category: 'CASINO', 
      logo: '/images/myPrizeLogo.jpeg',
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
      url: 'https://star-casino.pxf.io/c/3732491/1130845/14251'
    },
    { 
      id: 'bet365', 
      name: 'Bet365 Casino (21+)', 
      category: 'CASINO', 
      logo: '/images/bet365logo.png',
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
    setSelectedPlatform(platform);
  };

  const filteredPlatforms = activeCategory === 'ALL' 
    ? platforms 
    : platforms.filter(platform => platform.category === activeCategory);

  return (
    <div className="min-h-screen p-6 bg-gray-900">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`
              px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${activeCategory === category.id 
                ? 'bg-yellow-400 text-gray-900' 
                : 'bg-purple-900/30 text-white hover:bg-purple-900/50'}
            `}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPlatforms.map((platform) => (
          <Card 
            key={platform.id}
            className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-700
              ${platform.id === 'myprize' 
                ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500' 
                : 'bg-gray-800'}`}
            onClick={() => handlePlatformClick(platform)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
              <div className={`w-24 h-24 mb-4 relative ${platform.id === 'myprize' ? 'bg-yellow-300/20 rounded-xl p-2' : ''}`}>
                <img
                  src={platform.logo}
                  alt={platform.name}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    const parent = e.currentTarget.parentNode;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center';
                      fallback.innerHTML = `<span class="text-xl font-bold text-gray-400">${platform.name.charAt(0)}</span>`;
                      parent.replaceChild(fallback, e.currentTarget);
                    }
                  }}
                />
              </div>
              <h3 className={`text-center font-medium ${platform.id === 'myprize' ? 'text-gray-900' : 'text-white'}`}>
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

      {/* Responsible Gaming Footer */}
      <div className="mt-8 text-center text-sm text-gray-300">
        Responsible Gaming: Please gamble responsibly. If you or someone you know has a gambling problem and wants help, call 1-800-522-4700
      </div>
    </div>
  );
};

export default Platforms;
