import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Trophy, Sparkles, CheckCircle, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const RoundUpsModal = ({ isOpen, onClose, onEnable }) => {
  const { isDark } = useTheme();
  const [isEnabling, setIsEnabling] = useState(false);
  const [roundUpAmount, setRoundUpAmount] = useState('1.00');

  if (!isOpen) return null;

  const handleEnable = async () => {
    setIsEnabling(true);
    // Simulate API call
    setTimeout(() => {
      setIsEnabling(false);
      if (onEnable) {
        onEnable({ amount: roundUpAmount });
      }
      onClose();
    }, 1500);
  };

  const features = [
    {
      icon: DollarSign,
      title: 'Automatic Round-ups',
      description: 'Every purchase rounds up to the nearest dollar'
    },
    {
      icon: Trophy,
      title: 'Weekly Jackpots',
      description: 'Enter to win every Sunday at 8PM EST'
    },
    {
      icon: TrendingUp,
      title: 'Growing Prize Pool',
      description: 'Jackpot grows with every round-up'
    },
    {
      icon: Sparkles,
      title: 'More Entries = More Chances',
      description: 'Each round-up is one entry to win'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Enable Round-ups
              </h2>
              <p className={`text-sm mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Save spare change & win weekly jackpots
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Jackpot Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white text-center">
          <p className="text-sm opacity-90">Current Weekly Jackpot</p>
          <p className="text-3xl font-bold mt-1">$12,345</p>
          <p className="text-xs mt-1 opacity-75">8,932 participants this week</p>
        </div>

        {/* Features */}
        <div className="p-6 space-y-4">
          <h3 className={`font-semibold mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            How it works
          </h3>
          
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium text-sm ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h4>
                  <p className={`text-xs mt-0.5 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Info Box */}
          <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
            isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
          }`}>
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className={`text-xs ${
              isDark ? 'text-blue-400' : 'text-blue-700'
            }`}>
              You must have a connected bank account to enable round-ups. Your spare change will be automatically transferred to your Bankroll wallet.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`p-6 border-t ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <button
            onClick={handleEnable}
            disabled={isEnabling}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isEnabling ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Enabling...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Enable Round-ups</span>
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className={`w-full mt-3 py-3 px-4 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundUpsModal;