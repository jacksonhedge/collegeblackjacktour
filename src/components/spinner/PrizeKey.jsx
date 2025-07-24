import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const PrizeKey = ({ prizes }) => {
  const { isDark } = useTheme();
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const platformInfo = {
    FanDuel: {
      description: "America's #1 Sportsbook offering daily fantasy sports, sports betting, and casino games.",
      features: [
        "Industry-leading same game parlays",
        "Live betting on all major sports",
        "Daily fantasy contests with huge prizes",
        "Quick and easy payouts"
      ],
      bonus: "New users get up to $1000 back if your first bet doesn't win"
    },
    Sleeper: {
      description: "The fastest growing fantasy sports platform with modern features and social integration.",
      features: [
        "Free fantasy leagues for NFL, NBA, and more",
        "Best-in-class mobile app experience",
        "Integrated chat and social features",
        "Pick'em contests with friends"
      ],
      bonus: "Join leagues for free and compete for bragging rights or prizes"
    },
    ESPN: {
      description: "The worldwide leader in sports brings you fantasy games backed by expert analysis.",
      features: [
        "Free fantasy leagues across all major sports",
        "Expert projections and analysis",
        "Integration with ESPN content and scores",
        "Tournament-style contests"
      ],
      bonus: "Play for free with the most trusted name in sports"
    },
    BetMGM: {
      description: "The King of Sportsbooks offers premier sports betting and online casino experiences.",
      features: [
        "Exclusive betting markets and odds boosts",
        "Live streaming of select games",
        "Rewards program with M life",
        "Casino games from top providers"
      ],
      bonus: "Get up to $1500 paid back in bonus bets if you don't win"
    },
    MyPrize: {
      description: "Social casino and sweepstakes platform where you can win real prizes.",
      features: [
        "Free-to-play social casino games",
        "Daily bonuses and promotions",
        "Sweepstakes entries for real prizes",
        "VIP rewards program"
      ],
      bonus: "Get free coins daily to play your favorite games"
    },
    McLuck: {
      description: "Premier social casino with Vegas-style games and real prize redemptions.",
      features: [
        "300+ slot games and table games",
        "Daily login bonuses",
        "Gold Coins and Sweeps Coins system",
        "Real prize redemptions available"
      ],
      bonus: "New players get 7,500 free Gold Coins + 5 Sweeps Coins"
    }
  };

  const PlatformModal = ({ platform, onClose }) => {
    const info = platformInfo[platform.platform];
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className={`relative w-full max-w-md ${
          isDark ? 'bg-gray-900' : 'bg-white'
        } rounded-xl shadow-2xl overflow-hidden transform transition-all`}>
          {/* Header with gradient */}
          <div className={`p-6 bg-gradient-to-r ${platform.color}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={platform.logo} 
                  alt={platform.platform}
                  className="w-12 h-12 rounded-lg bg-white p-1"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {platform.platform}
                  </h3>
                  <p className="text-white/90 text-sm">
                    Win: {platform.prize}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <p className={`text-sm mb-4 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {info.description}
            </p>
            
            <div className="space-y-3 mb-6">
              <h4 className={`font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Key Features:
              </h4>
              <ul className="space-y-2">
                {info.features.map((feature, index) => (
                  <li key={index} className={`text-sm flex items-start gap-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <p className={`text-sm font-semibold mb-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                🎁 Special Offer:
              </p>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {info.bonus}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`mt-4 p-4 rounded-xl ${
        isDark ? 'bg-gray-800/50' : 'bg-gray-100'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <Info className={`w-4 h-4 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`} />
          <p className={`text-sm font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Prize Guide - Click to learn more
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {prizes.filter(prize => 
            ['ESPN', 'BetMGM', 'McLuck', 'Sleeper'].includes(prize.platform)
          ).map((prize, index) => (
            <button
              key={index}
              onClick={() => setSelectedPlatform(prize)}
              className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                isDark 
                  ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600' 
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
              } hover:scale-[1.02] hover:shadow-md`}
            >
              <img 
                src={prize.logo} 
                alt={prize.platform}
                className="w-8 h-8 rounded"
              />
              <div className="text-left">
                <p className={`text-xs font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {prize.platform}
                </p>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {prize.prize}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {selectedPlatform && (
        <PlatformModal 
          platform={selectedPlatform}
          onClose={() => setSelectedPlatform(null)}
        />
      )}
    </>
  );
};

export default PrizeKey;