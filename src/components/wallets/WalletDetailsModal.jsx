import React, { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { X, Plus, Trophy, ArrowRight, Loader2, Wallet, Settings, Gift } from 'lucide-react';
import { bonusWalletService, WALLET_TIERS } from '../../services/BonusWalletService';
// import { PlatformId } from '../../types/wallet'; // Type import not needed in JSX
import ProgressBar from '../ui/ProgressBar';

const WalletDetailsModal = ({ wallet, onClose }) => {
  const { connectWallet, createWallet } = useWallet();
  const { currentUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [claimingTier, setClaimingTier] = useState(null);
  const isGiftCardEligible = bonusWalletService.isGiftCardEligible(wallet.platformId);

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await createWallet(wallet);
      // Wallet creation adds $5 bonus automatically
    } catch (error) {
      console.error('Error creating wallet:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfigure = async () => {
    setIsConfiguring(true);
    try {
      // TODO: Implement configuration flow
      await new Promise(resolve => setTimeout(resolve, 1000)); // Placeholder
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleViewChallenges = async () => {
    setIsLoadingChallenges(true);
    try {
      // TODO: Implement challenges view
      await new Promise(resolve => setTimeout(resolve, 1000)); // Placeholder
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  const handleClaimReward = async (tier) => {
    if (!currentUser?.uid) {
      console.error('No user ID available');
      return;
    }

    setClaimingTier(tier);
    try {
      await bonusWalletService.claimTierReward(currentUser.uid, wallet.platformId, tier);
    } catch (error) {
      console.error(`Error claiming ${tier} reward:`, error);
    } finally {
      setClaimingTier(null);
    }
  };

  const ClaimButton = ({ tier, isDisabled }) => {
    const isClaimable = !isDisabled && !claimingTier;
    return (
      <button 
        onClick={() => handleClaimReward(tier)}
        disabled={!isClaimable}
        className={`w-full flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
          isClaimable
            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            : isDisabled
              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600/50 text-white/50 cursor-wait'
        }`}
      >
        {claimingTier === tier ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Claiming...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Gift className={`h-4 w-4 mr-2 ${isClaimable ? 'text-white' : 'text-current'}`} />
            <span>Claim {formatBalance(WALLET_TIERS[tier].reward)} Reward</span>
          </div>
        )}
      </button>
    );
  };

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
                <p className="text-sm text-gray-400">Wallet Progress</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Balance */}
          <div className="bg-[#232B3E] rounded-xl p-4 mb-4">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Current Balance</h3>
              {wallet.loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                  <span className="text-gray-300">Loading balance...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-white">
                  {formatBalance(wallet.balance)}
                </p>
              )}
            </div>
          </div>

          {/* Progress Bars Section */}
          <div className="space-y-4">
            {/* Starter Tier */}
            <div className="bg-[#232B3E] rounded-xl p-4">
              <h3 className="text-base font-bold text-white mb-3">{WALLET_TIERS.STARTER.name} Wallet</h3>
              <ProgressBar 
                current={wallet.balance} 
                min={WALLET_TIERS.STARTER.minAmount} 
                max={WALLET_TIERS.STARTER.threshold}
                startAmount={WALLET_TIERS.STARTER.minAmount}
                className="mb-3" 
              />
              <ClaimButton 
                tier="STARTER" 
                isDisabled={wallet.balance < WALLET_TIERS.STARTER.threshold} 
              />
            </div>

            {/* Pro Tier */}
            <div className="bg-[#232B3E] rounded-xl p-4">
              <h3 className="text-base font-bold text-white mb-3">{WALLET_TIERS.PRO.name} Wallet</h3>
              <ProgressBar 
                current={wallet.balance} 
                min={WALLET_TIERS.PRO.minAmount} 
                max={WALLET_TIERS.PRO.threshold}
                startAmount={WALLET_TIERS.PRO.minAmount}
                className="mb-3" 
              />
              <ClaimButton 
                tier="PRO" 
                isDisabled={wallet.balance < WALLET_TIERS.PRO.threshold} 
              />
            </div>

            {/* Elite Tier */}
            <div className="bg-[#232B3E] rounded-xl p-4">
              <h3 className="text-base font-bold text-white mb-3">{WALLET_TIERS.ELITE.name} Wallet</h3>
              <ProgressBar 
                current={wallet.balance} 
                min={WALLET_TIERS.ELITE.minAmount} 
                max={WALLET_TIERS.ELITE.threshold}
                startAmount={WALLET_TIERS.ELITE.minAmount}
                className="mb-3" 
              />
              <ClaimButton 
                tier="ELITE" 
                isDisabled={wallet.balance < WALLET_TIERS.ELITE.threshold} 
              />
            </div>
          </div>

          {/* View Challenges Button */}
          <div className="mt-4">
            <button
              onClick={handleViewChallenges}
              disabled={isLoadingChallenges}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#1C2333] text-sm"
            >
              <div className="flex items-center space-x-2">
                {isLoadingChallenges ? (
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                ) : (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                )}
                <span>View Available Challenges</span>
              </div>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletDetailsModal;
