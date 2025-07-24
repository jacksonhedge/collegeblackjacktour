import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Shield, Zap, Clock, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent } from '../ui/card';

const GrowthFundsModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [selectedBundle, setSelectedBundle] = useState(null);

  if (!isOpen) return null;

  const growthBundles = [
    {
      id: 'conservative',
      name: 'Conservative Growth',
      apy: '3.5%',
      minInvestment: 100,
      risk: 'Low',
      description: 'Stable returns with minimal risk',
      features: [
        'FDIC insured up to $250k',
        'Daily compounding',
        'No lock-up period',
        'Withdraw anytime'
      ],
      gradient: 'from-blue-500 to-blue-600',
      icon: Shield
    },
    {
      id: 'balanced',
      name: 'Balanced Growth',
      apy: '5.2%',
      minInvestment: 500,
      risk: 'Medium',
      description: 'Optimized risk-reward balance',
      features: [
        'Diversified portfolio',
        'Monthly rebalancing',
        '30-day minimum hold',
        'Quarterly bonuses'
      ],
      gradient: 'from-green-500 to-green-600',
      icon: TrendingUp
    },
    {
      id: 'aggressive',
      name: 'Aggressive Growth',
      apy: '8.1%',
      minInvestment: 1000,
      risk: 'High',
      description: 'Maximum returns for risk-tolerant investors',
      features: [
        'High-yield opportunities',
        'Weekly compounding',
        '90-day lock period',
        'Performance bonuses'
      ],
      gradient: 'from-orange-500 to-red-600',
      icon: Zap
    }
  ];

  const upcomingFeatures = [
    {
      title: 'Sports Betting Hedge Fund',
      description: 'Algorithmic betting strategies with guaranteed returns',
      eta: 'Q2 2024'
    },
    {
      title: 'Group Investment Pools',
      description: 'Combine funds with your group for higher APY',
      eta: 'Q3 2024'
    },
    {
      title: 'Crypto Growth Bundles',
      description: 'Diversified crypto portfolios with staking rewards',
      eta: 'Q4 2024'
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
      <div className={`relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-900' : 'bg-white'
      } max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b ${
          isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Total Growth Funds
              </h2>
              <p className={`text-sm mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Grow your money with our intelligent investment bundles
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

        {/* Content */}
        <div className="p-6">
          {/* Available Bundles */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Available Growth Bundles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {growthBundles.map((bundle) => {
                const Icon = bundle.icon;
                return (
                  <Card
                    key={bundle.id}
                    className={`cursor-pointer transition-all hover:scale-[1.02] ${
                      selectedBundle?.id === bundle.id
                        ? 'ring-2 ring-purple-500'
                        : ''
                    } ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                    onClick={() => setSelectedBundle(bundle)}
                  >
                    <CardContent className="p-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${bundle.gradient} text-white w-fit mb-3`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h4 className={`font-semibold mb-1 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {bundle.name}
                      </h4>
                      <p className={`text-2xl font-bold mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {bundle.apy} APY
                      </p>
                      <p className={`text-sm mb-3 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {bundle.description}
                      </p>
                      <div className={`text-xs space-y-1 ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        <p>Min: ${bundle.minInvestment}</p>
                        <p>Risk: {bundle.risk}</p>
                      </div>
                      {selectedBundle?.id === bundle.id && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className={`text-xs font-semibold mb-2 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Features:
                          </p>
                          <ul className="space-y-1">
                            {bundle.features.map((feature, idx) => (
                              <li key={idx} className={`text-xs flex items-center gap-1 ${
                                isDark ? 'text-gray-500' : 'text-gray-600'
                              }`}>
                                <ChevronRight className="w-3 h-3" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Coming Soon Features */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Coming Soon
            </h3>
            <div className="space-y-3">
              {upcomingFeatures.map((feature, idx) => (
                <Card
                  key={idx}
                  className={`${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium mb-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {feature.title}
                        </h4>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {feature.description}
                        </p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        isDark 
                          ? 'bg-gray-700 text-gray-400' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {feature.eta}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className={`mt-8 p-4 rounded-lg ${
            isDark ? 'bg-purple-900/20' : 'bg-purple-50'
          } text-center`}>
            <Clock className={`w-8 h-8 mx-auto mb-2 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <p className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Growth Funds launching soon! Get notified when available.
            </p>
            <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthFundsModal;