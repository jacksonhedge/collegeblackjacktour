import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Bitcoin, 
  BarChart3,
  Shield,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const GroupUpgrade = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const upgradePlans = [
    {
      id: 'interest',
      name: 'Interest Earning',
      description: 'Earn 4.5% APY on your group funds',
      price: 0,
      priceLabel: 'Free',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      features: [
        '4.5% APY on all deposits',
        'Daily compounding interest',
        'No minimum balance',
        'Withdraw anytime',
        'FDIC insured up to $250k'
      ]
    },
    {
      id: 'crypto',
      name: 'Crypto Investment',
      description: 'Convert funds to Bitcoin and other cryptocurrencies',
      price: 2.99,
      priceLabel: '$2.99/month',
      icon: Bitcoin,
      color: 'from-orange-500 to-yellow-600',
      features: [
        'Buy & sell Bitcoin, Ethereum, and more',
        'Real-time price tracking',
        'Automated DCA strategies',
        'Secure cold storage',
        'Tax reporting tools'
      ]
    },
    {
      id: 'stocks',
      name: 'Stock Portfolio',
      description: 'Invest in stocks and ETFs together',
      price: 4.99,
      priceLabel: '$4.99/month',
      icon: BarChart3,
      color: 'from-blue-500 to-purple-600',
      features: [
        'Fractional share investing',
        'Commission-free trades',
        'Group portfolio management',
        'Dividend reinvestment',
        'Research and analytics'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Suite',
      description: 'All investment options + advanced features',
      price: 9.99,
      priceLabel: '$9.99/month',
      icon: Zap,
      color: 'from-purple-500 to-pink-600',
      features: [
        'All features from other plans',
        'Priority customer support',
        'Advanced analytics',
        'Custom investment strategies',
        'API access for automation'
      ],
      popular: true
    }
  ];

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      toast.error('Please select an upgrade plan');
      return;
    }

    setIsProcessing(true);
    try {
      // In production, this would process the payment and update the group
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully upgraded to ${selectedPlan}!`);
      navigate(`/group/${groupId}`);
    } catch (error) {
      console.error('Error upgrading group:', error);
      toast.error('Failed to upgrade group');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(`/group/${groupId}`)}
            className={`flex items-center gap-2 text-sm ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Group
          </button>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Upgrade Your Group
          </h1>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Unlock powerful features to grow your group's funds together
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {upgradePlans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-xl transition-all transform hover:scale-105 ${
                  isSelected 
                    ? 'ring-4 ring-purple-500 ring-opacity-50' 
                    : ''
                } ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>

                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {plan.priceLabel}
                  </span>
                </div>

                <ul className="space-y-2 text-left">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      +{plan.features.length - 3} more features
                    </li>
                  )}
                </ul>

                {isSelected && (
                  <div className="absolute inset-0 rounded-xl ring-4 ring-purple-500 ring-opacity-50 pointer-events-none">
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className={`rounded-xl p-8 mb-12 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Why Upgrade?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Secure & Insured
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Your funds are protected with bank-level security and FDIC insurance
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Group Control
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage investments together with transparent tracking and permissions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Grow Together
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Watch your group's funds grow with smart investment strategies
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={handleUpgrade}
            disabled={!selectedPlan || isProcessing}
            className={`px-8 py-4 rounded-lg font-medium text-lg transition-all ${
              selectedPlan && !isProcessing
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {selectedPlan ? `Upgrade to ${upgradePlans.find(p => p.id === selectedPlan)?.name}` : 'Select a Plan'}
                <ChevronRight className="w-5 h-5" />
              </span>
            )}
          </button>
          <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Cancel anytime • No hidden fees • Instant activation
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupUpgrade;