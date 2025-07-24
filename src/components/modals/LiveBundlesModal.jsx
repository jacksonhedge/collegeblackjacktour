import React, { useState } from 'react';
import { X, Package, TrendingUp, Calendar, DollarSign, Percent, Shield, Trophy, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const LiveBundlesModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [selectedBundle, setSelectedBundle] = useState(null);

  // Mock bundles data - would come from API
  const bundles = [
    {
      id: 1,
      title: "NFL Fantasy Season",
      type: "Fantasy League",
      amount: 100.00,
      estimatedEarnings: 3.75,
      settlementDate: "Feb 15, 2025",
      daysRemaining: 45,
      interestRate: 4.5,
      interestEarned: 1.69,
      platform: "DraftKings",
      icon: Trophy,
      color: "from-orange-500 to-amber-600"
    },
    {
      id: 2,
      title: "Steelers Super Bowl",
      type: "Sports Bet",
      amount: 100.00,
      estimatedEarnings: 2.50,
      settlementDate: "Feb 9, 2025",
      daysRemaining: 39,
      interestRate: 4.5,
      interestEarned: 1.50,
      platform: "FanDuel",
      icon: Zap,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 3,
      title: "March Madness Pool",
      type: "Fantasy League", 
      amount: 50.00,
      estimatedEarnings: 1.25,
      settlementDate: "Apr 7, 2025",
      daysRemaining: 97,
      interestRate: 4.5,
      interestEarned: 0.25,
      platform: "ESPN",
      icon: Trophy,
      color: "from-red-500 to-pink-600"
    },
    {
      id: 4,
      title: "NBA Finals Bet",
      type: "Sports Bet",
      amount: 100.00,
      estimatedEarnings: 4.50,
      settlementDate: "Jun 20, 2025",
      daysRemaining: 171,
      interestRate: 4.5,
      interestEarned: 0.68,
      platform: "BetMGM",
      icon: Zap,
      color: "from-purple-500 to-violet-600"
    }
  ];

  const totalBundled = bundles.reduce((sum, bundle) => sum + bundle.amount, 0);
  const totalEstimatedEarnings = bundles.reduce((sum, bundle) => sum + bundle.estimatedEarnings, 0);
  const totalEarnedSoFar = bundles.reduce((sum, bundle) => sum + bundle.interestEarned, 0);

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
            className={`relative w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
              isDark ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
              isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isDark ? 'bg-purple-900/30' : 'bg-purple-100'
                  }`}>
                    <Package className={`w-6 h-6 ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Live Bundles
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your funds earning interest while locked
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-purple-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Bundled
                      </p>
                      <DollarSign className={`w-4 h-4 ${
                        isDark ? 'text-purple-400' : 'text-purple-600'
                      }`} />
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${totalBundled.toFixed(2)}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Earned So Far
                      </p>
                      <TrendingUp className={`w-4 h-4 ${
                        isDark ? 'text-green-400' : 'text-green-600'
                      }`} />
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${totalEarnedSoFar.toFixed(2)}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Est. Total Earnings
                      </p>
                      <Percent className={`w-4 h-4 ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${totalEstimatedEarnings.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Active Bundles */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Active Bundles ({bundles.length})
                  </h3>
                  <div className="space-y-3">
                    {bundles.map((bundle) => {
                      const Icon = bundle.icon;
                      const progress = (bundle.interestEarned / bundle.estimatedEarnings) * 100;
                      
                      return (
                        <div
                          key={bundle.id}
                          className={`p-4 rounded-lg border transition-all cursor-pointer ${
                            isDark 
                              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedBundle(bundle)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${bundle.color}`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {bundle.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 text-sm">
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                    {bundle.type}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {bundle.platform}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ${bundle.amount.toFixed(2)}
                              </p>
                              <p className="text-sm text-green-500">
                                +${bundle.interestEarned.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Interest Progress
                              </span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                            <div className={`w-full h-2 rounded-full overflow-hidden ${
                              isDark ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Settlement Info */}
                          <div className="flex items-center justify-between mt-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Settles: {bundle.settlementDate}
                              </span>
                            </div>
                            <span className={`font-medium ${
                              isDark ? 'text-purple-400' : 'text-purple-600'
                            }`}>
                              {bundle.daysRemaining} days
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info Section */}
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-purple-900/20' : 'bg-purple-50'
                }`}>
                  <h3 className={`text-md font-semibold mb-3 flex items-center gap-2 ${
                    isDark ? 'text-purple-400' : 'text-purple-700'
                  }`}>
                    <Shield className="w-4 h-4" />
                    How Live Bundles Work
                  </h3>
                  <ul className={`space-y-2 text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Your funds earn 4.5% APY while locked in fantasy leagues or bets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Interest is calculated daily and paid out when the bundle settles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Funds remain locked until the event completes or bet settles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Winnings are added to your balance along with earned interest</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveBundlesModal;