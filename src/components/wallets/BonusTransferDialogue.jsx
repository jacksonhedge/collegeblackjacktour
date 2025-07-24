import React, { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { bonusWalletService } from '../../services/BonusWalletService';
import { Card, CardContent } from '../../components/ui/card';
import { PLATFORMS } from '../../services/WalletService';

export default function BonusTransferDialogue({ onClose }) {
  const { currentUser } = useAuth();
  const { wallets, refreshWallet } = useWallet();
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get all available wallets
  const availableWallets = Object.entries(PLATFORMS).map(([platformId, platform]) => ({
    id: platformId,
    name: platform.name,
    logo: platform.logo,
    wallet: wallets?.subWallets?.[platformId] || null
  }));

  // Debug logging for available wallets
  console.log('=== BonusTransferDialogue Debug ===');
  console.log('Available wallets:', availableWallets);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedPlatform) {
      setError('Please select a platform');
      setLoading(false);
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    if (transferAmount > (currentUser?.bonusBalance || 0)) {
      setError('Insufficient bonus balance');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting bonus transfer:', {
        userId: currentUser.uid,
        platformId: selectedPlatform,
        amount: transferAmount
      });

      await bonusWalletService.transferBonusToSubWallet(
        currentUser.uid,
        selectedPlatform,
        transferAmount
      );
      
      console.log('Bonus transfer successful, refreshing wallet data');
      await refreshWallet();
      
      // Log the updated wallet data
      console.log('Updated wallet data:', {
        selectedPlatform,
        updatedWallet: wallets?.subWallets?.[selectedPlatform]
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error during bonus transfer:', err);
      setError(err.message || 'Failed to transfer bonus');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-green-500 text-2xl mb-4">✓</div>
              <h3 className="text-lg font-semibold mb-2">Transfer Successful!</h3>
              <p className="text-gray-600">Your bonus has been transferred successfully.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transfer Bonus</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Available Bonus Balance: ${currentUser?.bonusBalance?.toFixed(2) || '0.00'}
            </p>
          </div>

          <form onSubmit={handleTransfer}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => {
                  const platformId = e.target.value;
                  setSelectedPlatform(platformId);
                  console.log('Selected platform:', platformId);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">Select a platform</option>
                {availableWallets.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Transferring...' : 'Transfer Bonus'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
