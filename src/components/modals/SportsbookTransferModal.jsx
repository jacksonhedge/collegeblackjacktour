import React, { useState } from 'react';
import { X, ArrowRight, Lock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallet } from '../../contexts/WalletContext';
import { Card, CardContent } from '../ui/card';

const SportsbookTransferModal = ({ isOpen, onClose, sportsbook }) => {
  const { isDark } = useTheme();
  const { addFunds } = useWallet();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen || !sportsbook) return null;

  // Mock balance for demo
  const mockBalance = sportsbook.id === 'fanduel' ? 250.00 : 
                      sportsbook.id === 'draftkings' ? 175.50 :
                      sportsbook.id === 'caesars' ? 325.00 :
                      sportsbook.id === 'betmgm' ? 150.00 : 100.00;

  const matchBonus = sportsbook.id === 'fanduel' ? 0.01 : 0; // 1% for FanDuel
  const matchAmount = parseFloat(amount || 0) * matchBonus;
  const totalAmount = parseFloat(amount || 0) + matchAmount;

  const handleTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
        setAmount('');
      }, 2000);
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className={`relative p-8 rounded-2xl shadow-2xl ${
          isDark ? 'bg-gray-900' : 'bg-white'
        } text-center`}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className={`text-xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Transfer Successful!
          </h3>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            ${totalAmount.toFixed(2)} has been added to your wallet
            {matchBonus > 0 && (
              <span className="block text-green-500 mt-1">
                Including ${matchAmount.toFixed(2)} match bonus!
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        } bg-gradient-to-br ${sportsbook.gradient} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <sportsbook.icon className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">
                  Transfer from {sportsbook.name}
                </h2>
                {sportsbook.id === 'fanduel' && (
                  <p className="text-sm opacity-90 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    1% match bonus on all transfers!
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Balance Display */}
          <Card className={`mb-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Available Balance
                </span>
                <span className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  ${mockBalance.toFixed(2)}
                </span>
              </div>
              <div className={`text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <p>Last updated: Just now</p>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Amount */}
          <div className="mb-6">
            <label className={`text-sm font-medium mb-2 block ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Transfer Amount
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                max={mockBalance}
                className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <button
                onClick={() => setAmount(mockBalance.toString())}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                } hover:underline`}
              >
                Max
              </button>
            </div>
          </div>

          {/* Match Bonus Display */}
          {sportsbook.id === 'fanduel' && amount && parseFloat(amount) > 0 && (
            <Card className={`mb-6 ${
              isDark 
                ? 'bg-green-900/20 border-green-700' 
                : 'bg-green-50 border-green-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-5 h-5 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-green-400' : 'text-green-700'
                    }`}>
                      1% Match Bonus
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${
                    isDark ? 'text-green-400' : 'text-green-700'
                  }`}>
                    +${matchAmount.toFixed(2)}
                  </span>
                </div>
                <p className={`text-xs mt-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Match bonus will be added to your savings account
                </p>
              </CardContent>
            </Card>
          )}

          {/* Total Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className={`p-4 rounded-lg mb-6 ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Transfer amount
                  </span>
                  <span className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    ${parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                {matchBonus > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span className="text-sm">Match bonus</span>
                    <span className="font-medium">+${matchAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className={`flex justify-between pt-2 border-t ${
                  isDark ? 'border-gray-700' : 'border-gray-300'
                }`}>
                  <span className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Total to wallet
                  </span>
                  <span className={`text-lg font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Button */}
          <button
            onClick={handleTransfer}
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > mockBalance || isProcessing}
            className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              !amount || parseFloat(amount) <= 0 || parseFloat(amount) > mockBalance || isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                Processing...
              </>
            ) : (
              <>
                Transfer Funds
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Security Note */}
          <div className={`mt-4 flex items-start gap-2 ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <Lock className="w-4 h-4 mt-0.5" />
            <p className="text-xs">
              Your transfer is secure and encrypted. Funds will be available in your Bankroll wallet within 1-3 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsbookTransferModal;