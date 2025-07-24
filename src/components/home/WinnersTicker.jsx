import React from 'react';
import { Trophy, DollarSign, TrendingUp } from 'lucide-react';

const WinnersTicker = () => {
  // Sample winner data - in production this would come from your database
  const winners = [
    { name: '@jackson_w', amount: '$5,200', platform: 'DraftKings', type: 'Big Winner' },
    { name: '@sarah_m', amount: '$3,750', platform: 'FanDuel', type: 'Daily Winner' },
    { name: '@mike_123', amount: '$2,100', platform: 'PrizePicks', type: 'Recent Winner' },
    { name: '@emma_r', amount: '$4,500', platform: 'Underdog', type: 'Top Winner' },
    { name: '@alex_k', amount: '$1,850', platform: 'ESPN Bet', type: 'Lucky Winner' },
    { name: '@chris_b', amount: '$6,300', platform: 'BetMGM', type: 'Jackpot Winner' },
    { name: '@lisa_j', amount: '$2,900', platform: 'Caesars', type: 'Big Winner' },
    { name: '@david_p', amount: '$3,200', platform: 'MyPrize', type: 'Recent Winner' },
  ];

  // Duplicate the array for seamless scrolling
  const tickerContent = [...winners, ...winners];

  return (
    <div className="w-full bg-black/30 backdrop-blur-sm border-y border-white/10 py-2 mb-6 overflow-hidden">
      <div className="flex items-center">
        {/* Static label */}
        <div className="flex items-center px-4 pr-6 border-r border-white/20 flex-shrink-0">
          <Trophy className="h-4 w-4 text-yellow-400 mr-2" />
          <span className="text-white font-semibold text-sm">Winners</span>
        </div>
        
        {/* Scrolling content */}
        <div className="flex-1 overflow-hidden">
          <div className="ticker-content flex items-center">
            {tickerContent.map((winner, index) => (
              <div key={index} className="flex items-center mx-6 whitespace-nowrap">
                <span className="text-white/60 text-sm mr-2">{winner.type}:</span>
                <span className="text-white font-semibold text-sm">{winner.name}</span>
                <DollarSign className="h-3 w-3 text-green-400 mx-1" />
                <span className="text-green-400 font-bold text-sm">{winner.amount}</span>
                <span className="text-white/40 text-sm ml-2">on {winner.platform}</span>
                {index < tickerContent.length - 1 && (
                  <span className="text-white/20 mx-6">•</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .ticker-content {
          animation: scroll 40s linear infinite;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .ticker-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default WinnersTicker;