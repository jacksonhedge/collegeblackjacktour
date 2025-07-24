import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { X, Loader2, Gift } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import { WALLET_TIERS } from '../../services/BonusWalletService';

const ConnectWalletModal = ({ wallet, onClose }) => {
  const { connectWallet } = useWallet();

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance);
  };

  const handleConnect = async () => {
    try {
      onClose();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      onClose();
    }
  };

  const PreviewClaimButton = ({ tier }) => (
    <button 
      disabled
      className="w-full flex items-center justify-center px-3 py-2 rounded-lg bg-gray-600/50 text-gray-400 cursor-not-allowed text-sm font-medium"
    >
      <div className="flex items-center justify-center">
        <Gift className="h-4 w-4 mr-2" />
        <span>Claim {formatBalance(WALLET_TIERS[tier].reward)} Reward</span>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C2333] rounded-xl shadow-xl max-w-md w-full mx-auto transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-900/20 p-2 rounded-xl">
                <img
                  src={wallet.logo}
                  alt={wallet.name}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{wallet.name}</h2>
                <p className="text-sm text-gray-400">Connect Your Account</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bars Section */}
          <div className="space-y-4 mb-4">
            {/* Starter Tier */}
            <div className="bg-[#232B3E] rounded-xl p-4">
              <h3 className="text-base font-bold text-white mb-3">{WALLET_TIERS.STARTER.name} Wallet</h3>
              <ProgressBar 
                current={0} 
                min={WALLET_TIERS.STARTER.minAmount} 
                max={WALLET_TIERS.STARTER.threshold}
                startAmount={WALLET_TIERS.STARTER.minAmount}
                className="mb-3" 
              />
              <PreviewClaimButton tier="STARTER" />
            </div>

            {/* Pro Tier */}
            <div className="bg-[#232B3E] rounded-xl p-4">
              <h3 className="text-base font-bold text-white mb-3">{WALLET_TIERS.PRO.name} Wallet</h3>
              <ProgressBar 
                current={0} 
                min={WALLET_TIERS.PRO.minAmount} 
                max={WALLET_TIERS.PRO.threshold}
                startAmount={WALLET_TIERS.PRO.minAmount}
                className="mb-3" 
              />
              <PreviewClaimButton tier="PRO" />
            </div>

            {/* Elite Tier */}
            <div className="bg-[#232B3E] rounded-xl p-4">
              <h3 className="text-base font-bold text-white mb-3">{WALLET_TIERS.ELITE.name} Wallet</h3>
              <ProgressBar 
                current={0} 
                min={WALLET_TIERS.ELITE.minAmount} 
                max={WALLET_TIERS.ELITE.threshold}
                startAmount={WALLET_TIERS.ELITE.minAmount}
                className="mb-3" 
              />
              <PreviewClaimButton tier="ELITE" />
            </div>
          </div>

          {/* Features List */}
          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-3">
              You're about to configure your {wallet.name} account. This will allow us to:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-300">
                <div className="mr-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                View your account balance
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <div className="mr-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                Track your bets and performance
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <div className="mr-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                Provide personalized insights
              </li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              className="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1C2333]"
            >
              Configure Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
