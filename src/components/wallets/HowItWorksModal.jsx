import React from 'react';
import { X } from 'lucide-react';

const HowItWorksModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-gray-900 rounded-2xl p-8 max-w-3xl w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>

        {/* Info Graphics */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="flex items-center space-x-6 bg-gray-800/50 p-6 rounded-xl">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Earn Bonus Balance</h3>
              <p className="text-gray-300">
                Complete challenges and spin the wheel to earn bonus credits in your main Bonus Balance.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center space-x-6 bg-gray-800/50 p-6 rounded-xl">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Transfer to Platform Wallets</h3>
              <p className="text-gray-300">
                Transfer your Bonus Balance to specific platform wallets (FanDuel, DraftKings, etc.) using the "Transfer Bonus" button.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center space-x-6 bg-gray-800/50 p-6 rounded-xl">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Redeem Gift Cards</h3>
              <p className="text-gray-300">
                Once a platform's bonus balance reaches $20, you can request a gift card for that specific platform.
              </p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 text-sm text-gray-400 bg-purple-600/10 p-4 rounded-lg">
          <strong className="text-purple-400">Note:</strong> Bonus balances can only be used for their designated platforms and cannot be withdrawn as cash.
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;
