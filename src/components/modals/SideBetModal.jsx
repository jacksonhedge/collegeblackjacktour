import React, { useState } from 'react';
import { X, DollarSign, TrendingUp, Sparkles, CheckCircle, ArrowRight, Users, Trophy, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const SideBetModal = ({ isOpen, onClose }) => {
  const [isEnabling, setIsEnabling] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const { isDark } = useTheme();

  const handleEnableSideBet = async () => {
    setIsEnabling(true);
    // Simulate API call
    setTimeout(() => {
      setIsEnabling(false);
      setEnabled(true);
    }, 1500);
  };

  const features = [
    {
      icon: DollarSign,
      title: "Round Up Purchases",
      description: "Every purchase rounds up to the nearest dollar"
    },
    {
      icon: Trophy,
      title: "Weekly Jackpots",
      description: "New winner selected every Sunday at 8PM EST"
    },
    {
      icon: TrendingUp,
      title: "Growing Prize Pool",
      description: "Jackpot grows with every round-up"
    },
    {
      icon: Users,
      title: "More Entries = More Chances",
      description: "Each round-up is one entry to win"
    }
  ];

  const currentStats = {
    currentJackpot: 12345,
    totalParticipants: 8932,
    lastWinner: "@sarah_m",
    lastWinAmount: 9876,
    averageRoundUp: 0.47
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
              isDark ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            {/* Gradient Header */}
            <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">SideBet Bankroll Jackpot</h2>
                  <p className="text-sm opacity-90">Turn spare change into big wins!</p>
                </div>
              </div>

              {/* Current Jackpot Display */}
              <div className="text-center py-4">
                <p className="text-sm opacity-80 mb-1">Current Jackpot</p>
                <p className="text-5xl font-bold mb-2">
                  ${currentStats.currentJackpot.toLocaleString()}
                </p>
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                  <p className="text-sm text-green-300">Growing every second</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-2 bg-white/10 rounded-lg">
                  <p className="text-xs opacity-80">Participants</p>
                  <p className="font-semibold">{currentStats.totalParticipants.toLocaleString()}</p>
                </div>
                <div className="text-center p-2 bg-white/10 rounded-lg">
                  <p className="text-xs opacity-80">Last Winner</p>
                  <p className="font-semibold">{currentStats.lastWinner}</p>
                </div>
                <div className="text-center p-2 bg-white/10 rounded-lg">
                  <p className="text-xs opacity-80">Won</p>
                  <p className="font-semibold">${currentStats.lastWinAmount}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* How it works */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  How It Works
                </h3>
                <div className="space-y-3">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex gap-3">
                        <div className={`p-2 rounded-lg ${
                          isDark ? 'bg-purple-900/30' : 'bg-purple-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isDark ? 'text-purple-400' : 'text-purple-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {feature.title}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Example */}
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Example Round-Up:
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Purchase:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>$4.53</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Round-up:</span>
                    <span className="text-purple-600 font-medium">+$0.47</span>
                  </div>
                  <div className="border-t pt-1 mt-1 ${isDark ? 'border-gray-700' : 'border-gray-300'}">
                    <div className="flex justify-between font-medium">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total:</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>$5.00</span>
                    </div>
                  </div>
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  = 1 entry into this week's jackpot!
                </p>
              </div>

              {/* Enable Button */}
              {!enabled ? (
                <button
                  onClick={handleEnableSideBet}
                  disabled={isEnabling}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isEnabling
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isEnabling ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enabling SideBet...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Enable SideBet Round-Ups
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              ) : (
                <div className={`p-4 rounded-lg text-center ${
                  isDark ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <CheckCircle className={`w-12 h-12 mx-auto mb-2 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <p className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                    SideBet Enabled!
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your round-ups will automatically enter you into weekly jackpots
                  </p>
                </div>
              )}

              {/* Terms */}
              <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                By enabling SideBet, you agree to round up your purchases to the nearest dollar. 
                Round-ups are automatically entered into the weekly jackpot drawing. 
                Must be 18+ to participate.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SideBetModal;