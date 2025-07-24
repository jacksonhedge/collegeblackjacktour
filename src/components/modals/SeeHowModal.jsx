import React from 'react';
import { X, Trophy, Sparkles, DollarSign, Spade, Heart, Diamond, Club, Dices, Target, Layers, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SeeHowModal = ({ isOpen, onClose, winner }) => {
  const { isDark } = useTheme();
  
  if (!isOpen || !winner) return null;

  const getHowTypeIcon = () => {
    switch (winner.howType) {
      case 'slot':
        return '🎰';
      case 'blackjack':
        return '🃏';
      case 'parlay':
        return '📋';
      case 'single':
        return '🎯';
      case 'sidebet':
        return '💎';
      default:
        return '🏆';
    }
  };

  const getHowTypeTitle = () => {
    switch (winner.howType) {
      case 'slot':
        return 'Slot Game Win';
      case 'blackjack':
        return 'Blackjack Victory';
      case 'parlay':
        return 'Parlay Hit';
      case 'single':
        return 'Single Bet Win';
      case 'sidebet':
        return 'SideBet Jackpot';
      default:
        return 'Big Win';
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount === 'string' && amount.includes('$')) {
      return amount;
    }
    return `$${amount.toLocaleString()}`;
  };

  // Render visual representation based on win type
  const renderWinVisual = () => {
    switch (winner.howType) {
      case 'slot':
        return (
          <div className="flex justify-center items-center gap-2 my-6">
            {['🍒', '🍒', '🍒'].map((symbol, idx) => (
              <div
                key={idx}
                className={`w-20 h-20 rounded-lg flex items-center justify-center text-3xl font-bold ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                } animate-bounce`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {symbol}
              </div>
            ))}
          </div>
        );
      
      case 'blackjack':
        return (
          <div className="flex justify-center items-center gap-4 my-6">
            <div className={`relative w-16 h-24 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white border-2 border-gray-300'} shadow-lg transform -rotate-6`}>
              <div className="absolute top-2 left-2 text-red-600 text-xl font-bold">A</div>
              <div className="absolute bottom-2 right-2 text-red-600 text-xl font-bold rotate-180">A</div>
              <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-red-600" />
            </div>
            <div className={`relative w-16 h-24 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white border-2 border-gray-300'} shadow-lg transform rotate-6`}>
              <div className="absolute top-2 left-2 text-black text-xl font-bold">K</div>
              <div className="absolute bottom-2 right-2 text-black text-xl font-bold rotate-180">K</div>
              <Spade className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-black" />
            </div>
            <div className="ml-4 text-3xl font-bold text-green-500">21!</div>
          </div>
        );
      
      case 'parlay':
        return (
          <div className="space-y-2 my-6">
            {winner.how?.split(',').slice(0, 3).map((bet, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {bet.trim()}
                </span>
                <span className="text-green-500 font-bold">✓</span>
              </div>
            ))}
          </div>
        );
      
      case 'sidebet':
        return (
          <div className="flex justify-center items-center my-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse flex items-center justify-center">
                <span className="text-4xl font-bold text-white">JP</span>
              </div>
              <div className="absolute -inset-2">
                <div className="w-full h-full rounded-full border-4 border-yellow-400 animate-ping"></div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex justify-center items-center my-6">
            <Trophy className="w-24 h-24 text-yellow-500 animate-bounce" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative max-w-lg w-full rounded-2xl shadow-2xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } overflow-hidden`}>
        {/* Header with gradient */}
        <div className="relative h-32 bg-gradient-to-br from-purple-600 to-pink-600 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-4xl">{getHowTypeIcon()}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{getHowTypeTitle()}</h2>
              <p className="text-white/80 text-sm">{winner.platform}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Winner Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Winner
              </p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {winner.username || winner.name}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Amount Won
              </p>
              <p className="text-2xl font-bold text-green-500">
                {formatAmount(winner.amount)}
              </p>
            </div>
          </div>

          {/* Visual Representation */}
          {renderWinVisual()}

          {/* How They Won */}
          {winner.how && (
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-700/50' : 'bg-gray-100'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  How They Won
                </h3>
              </div>
              <p className={`text-sm leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {winner.how}
              </p>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-gray-700/30' : 'bg-purple-50'
            }`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Platform
              </p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {winner.platform}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-gray-700/30' : 'bg-purple-50'
            }`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                When
              </p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {winner.time}
              </p>
            </div>
          </div>

          {/* Motivational Message */}
          <div className={`text-center p-4 rounded-lg border ${
            isDark 
              ? 'bg-purple-900/20 border-purple-700' 
              : 'bg-purple-50 border-purple-200'
          }`}>
            <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
              {winner.howType === 'sidebet' 
                ? 'Join Bankroll SideBets for your chance at the next jackpot!'
                : 'Your next big win could be just around the corner!'}
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeeHowModal;