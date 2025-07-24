import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import MeldBankConnect from '../banking/MeldBankConnect';
import RoundUpsModal from './RoundUpsModal';
import SportsbookTransferModal from './SportsbookTransferModal';
import {
  BankIcon,
  MeldIcon,
  VenmoIcon,
  ApplePayIcon,
  VisaIcon,
  MastercardIcon,
  CryptoIcon,
  RoundUpsIcon,
  CashAppIcon,
  PayPalIcon,
  ZelleIcon,
  WireIcon
} from '../icons/PaymentIcons';
import {
  FanDuelIcon,
  DraftKingsIcon,
  CaesarsIcon,
  CaesarsCasinoIcon,
  CaesarsSportsbookIcon,
  BetMGMIcon,
  ESPNBetIcon,
  FanaticsIcon,
  UnderdogIcon,
  PrizePicksIcon,
  PointsBetIcon,
  BetRiversIcon
} from '../icons/SportsbookIcons';

const AddFundsModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [showBankConnect, setShowBankConnect] = useState(false);
  const [showRoundUps, setShowRoundUps] = useState(false);
  const [selectedSportsbook, setSelectedSportsbook] = useState(null);

  if (!isOpen) return null;

  const sportsbookOptions = [
    {
      id: 'fanduel',
      name: 'FanDuel',
      icon: FanDuelIcon,
      description: 'Transfer from FanDuel with 1% match',
      fee: 'Free + 1% bonus',
      time: '1-3 business days',
      gradient: 'from-blue-600 to-blue-700',
      note: '1% match on all transfers!',
      enabled: false,
      comingSoon: true,
      matchBonus: true
    },
    {
      id: 'draftkings',
      name: 'DraftKings',
      icon: DraftKingsIcon,
      description: 'Transfer from DraftKings account',
      fee: 'Free',
      time: '1-3 business days',
      gradient: 'from-green-600 to-green-700',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'caesars',
      name: 'Caesars',
      icon: CaesarsIcon,
      description: 'Transfer from Caesars Sportsbook',
      fee: 'Free',
      time: '1-3 business days',
      gradient: 'from-yellow-600 to-yellow-700',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'betmgm',
      name: 'BetMGM',
      icon: BetMGMIcon,
      description: 'Transfer from BetMGM account',
      fee: 'Free',
      time: '1-3 business days',
      gradient: 'from-orange-600 to-orange-700',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'espnbet',
      name: 'ESPN BET',
      icon: ESPNBetIcon,
      description: 'Transfer from ESPN BET account',
      fee: 'Free',
      time: '1-3 business days',
      gradient: 'from-red-600 to-red-700',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'fanatics',
      name: 'Fanatics',
      icon: FanaticsIcon,
      description: 'Transfer from Fanatics Sportsbook',
      fee: 'Free',
      time: '1-3 business days',
      gradient: 'from-blue-800 to-blue-900',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'pointsbet',
      name: 'PointsBet',
      icon: PointsBetIcon,
      description: 'Transfer from PointsBet account',
      fee: 'Free',
      time: '1-3 business days',
      gradient: 'from-teal-600 to-teal-700',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'betrivers',
      name: 'BetRivers',
      icon: BetRiversIcon,
      description: 'Transfer from BetRivers account',
      fee: 'Free',
      time: '1-3 business days',
      gradient: 'from-blue-700 to-blue-800',
      enabled: false,
      comingSoon: true
    }
  ];

  const paymentMethods = [
    {
      id: 'bank',
      name: 'Bank Account',
      icon: MeldIcon,
      description: 'ACH transfer via Meld',
      fee: 'Free',
      time: '1-3 business days',
      gradient: 'from-green-500 to-green-600',
      note: 'Powered by Meld & Dwolla',
      enabled: true
    },
    {
      id: 'roundups',
      name: 'Round-Ups (SideBet) by Hedge Pay',
      icon: RoundUpsIcon,
      description: 'Round up purchases to the nearest dollar',
      fee: 'Free',
      time: 'Automatic',
      gradient: 'from-purple-500 to-purple-600',
      note: 'Weekly jackpot entries',
      enabled: true
    },
    {
      id: 'crypto',
      name: 'Crypto',
      icon: CryptoIcon,
      description: 'Deposit with cryptocurrency',
      fee: 'Free',
      time: '10-30 minutes',
      gradient: 'from-orange-500 to-orange-600',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'debit',
      name: 'Debit Card',
      icon: CreditCard,
      description: 'Instant deposit with debit card',
      fee: 'Free',
      time: 'Instant',
      gradient: 'from-blue-500 to-blue-600',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'venmo',
      name: 'Venmo',
      icon: VenmoIcon,
      description: 'Transfer from Venmo account',
      fee: 'Free',
      time: 'Instant',
      gradient: 'from-sky-500 to-blue-600',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'apple',
      name: 'Apple Pay',
      icon: ApplePayIcon,
      description: 'Fast and secure with Apple Pay',
      fee: 'Free',
      time: 'Instant',
      gradient: 'from-gray-700 to-gray-900',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'cashapp',
      name: 'Cash App',
      icon: CashAppIcon,
      description: 'Transfer from Cash App balance',
      fee: 'Free',
      time: 'Instant',
      gradient: 'from-green-600 to-green-700',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: PayPalIcon,
      description: 'Transfer from PayPal account',
      fee: 'Free',
      time: '1-2 business days',
      gradient: 'from-blue-600 to-blue-700',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'zelle',
      name: 'Zelle',
      icon: ZelleIcon,
      description: 'Bank-to-bank transfers with Zelle',
      fee: 'Free',
      time: 'Minutes',
      gradient: 'from-purple-600 to-purple-700',
      enabled: false,
      comingSoon: true
    },
    {
      id: 'wire',
      name: 'Wire Transfer',
      icon: WireIcon,
      description: 'Traditional wire transfer',
      fee: 'Bank fees may apply',
      time: '1-2 business days',
      gradient: 'from-gray-600 to-gray-700',
      enabled: false,
      comingSoon: true
    }
  ];

  const handleMethodClick = (method) => {
    console.log('Selected payment method:', method.id);
    
    if (!method.enabled) {
      // Method is disabled, don't do anything
      return;
    }
    
    if (method.id === 'bank') {
      // Show Meld bank connection
      setShowBankConnect(true);
    } else if (method.id === 'roundups') {
      // Show round-ups modal
      setShowRoundUps(true);
    } else {
      alert(`${method.name} integration coming soon!`);
    }
  };

  const handleSportsbookClick = (sportsbook) => {
    console.log('Selected sportsbook:', sportsbook.id);
    setSelectedSportsbook(sportsbook);
  };

  const handleBankConnectSuccess = (connectionData) => {
    console.log('Bank connected:', connectionData);
    setShowBankConnect(false);
    // Here you would proceed with the deposit flow
    alert('Bank connected successfully! Deposit flow coming soon.');
  };

  const handleRoundUpsEnable = (settings) => {
    console.log('Round-ups enabled:', settings);
    setShowRoundUps(false);
    alert('Round-ups enabled successfully! You will now automatically save spare change and enter weekly jackpots.');
  };

  if (showBankConnect) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowBankConnect(false)}
        />
        
        {/* Modal Content */}
        <div className="relative z-10">
          <MeldBankConnect
            onSuccess={handleBankConnectSuccess}
            onClose={() => setShowBankConnect(false)}
            proceedToPayment={true}
          />
        </div>
      </div>
    );
  }

  if (showRoundUps) {
    return (
      <RoundUpsModal
        isOpen={showRoundUps}
        onClose={() => setShowRoundUps(false)}
        onEnable={handleRoundUpsEnable}
      />
    );
  }

  if (selectedSportsbook) {
    return (
      <SportsbookTransferModal
        isOpen={true}
        onClose={() => setSelectedSportsbook(null)}
        sportsbook={selectedSportsbook}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
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
                Add Funds
              </h2>
              <p className={`text-sm mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Choose how you'd like to add money to your wallet
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

        {/* Payment Methods */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Main Payment Methods */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              PAYMENT METHODS
            </h3>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isDisabled = !method.enabled;
                
                return (
                  <button
                    key={method.id}
                    onClick={() => handleMethodClick(method)}
                    disabled={isDisabled}
                    className={`w-full p-4 rounded-xl border transition-all relative ${
                      isDisabled 
                        ? isDark 
                          ? 'bg-gray-800/50 border-gray-700/50 cursor-not-allowed opacity-60' 
                          : 'bg-gray-50/50 border-gray-200/50 cursor-not-allowed opacity-60'
                        : method.id === 'bank'
                          ? isDark
                            ? 'bg-gradient-to-r from-gray-800 to-gray-850 border-green-600/50 hover:border-green-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20'
                            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 hover:border-green-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20'
                          : isDark 
                            ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:scale-[1.02]' 
                            : 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:scale-[1.02]'
                    }`}
                  >
                    {method.comingSoon && (
                      <div className="absolute top-2 right-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDark 
                            ? 'bg-gray-700 text-gray-400' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          Coming soon
                        </span>
                      </div>
                    )}
                    {method.id === 'bank' && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white font-semibold animate-pulse">
                          RECOMMENDED
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`${method.id === 'bank' ? 'p-3' : 'p-2'} ${isDisabled ? 'opacity-50' : ''} ${
                        method.id === 'bank' ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl' : ''
                      }`}>
                        <Icon className={method.id === 'bank' ? 'w-14 h-14' : 'w-8 h-8'} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className={`font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        } ${isDisabled ? 'opacity-75' : ''} ${
                          method.id === 'bank' ? 'text-lg' : ''
                        }`}>
                          {method.name}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        } ${isDisabled ? 'opacity-75' : ''} ${
                          method.id === 'bank' ? 'font-medium' : ''
                        }`}>
                          {method.description}
                        </p>
                        {method.note && (
                          <p className={`text-xs mt-1 ${
                            method.id === 'bank' 
                              ? 'text-green-600 dark:text-green-400 font-medium' 
                              : isDark ? 'text-gray-500' : 'text-gray-500'
                          } ${isDisabled ? 'opacity-75' : ''}`}>
                            {method.note}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-xs ${
                            method.id === 'bank' 
                              ? 'text-green-600 dark:text-green-400 font-semibold' 
                              : isDark ? 'text-gray-500' : 'text-gray-500'
                          } ${isDisabled ? 'opacity-75' : ''}`}>
                            Fee: {method.fee}
                          </span>
                          <span className={`text-xs ${
                            isDark ? 'text-gray-500' : 'text-gray-500'
                          } ${isDisabled ? 'opacity-75' : ''}`}>
                            Time: {method.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sportsbook Section */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              SPORTSBOOK TRANSFERS
            </h3>
            <div className="space-y-2">
              {sportsbookOptions.map((sportsbook) => {
                const Icon = sportsbook.icon;
                const isDisabled = !sportsbook.enabled;
                
                return (
                  <button
                    key={sportsbook.id}
                    onClick={() => handleSportsbookClick(sportsbook)}
                    disabled={isDisabled}
                    className={`w-full p-4 rounded-xl border transition-all relative ${
                      isDisabled 
                        ? isDark 
                          ? 'bg-gray-800/50 border-gray-700/50 cursor-not-allowed opacity-60' 
                          : 'bg-gray-50/50 border-gray-200/50 cursor-not-allowed opacity-60'
                        : isDark 
                          ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:scale-[1.02]' 
                          : 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:scale-[1.02]'
                    }`}
                  >
                    {sportsbook.comingSoon && (
                      <div className="absolute top-2 right-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDark 
                            ? 'bg-gray-700 text-gray-400' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          Coming soon
                        </span>
                      </div>
                    )}
                    {sportsbook.matchBonus && (
                      <div className="absolute top-2 left-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white font-medium">
                          1% MATCH
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`p-2 ${isDisabled ? 'opacity-50' : ''}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className={`font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        } ${isDisabled ? 'opacity-75' : ''}`}>
                          {sportsbook.name}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        } ${isDisabled ? 'opacity-75' : ''}`}>
                          {sportsbook.description}
                        </p>
                        {sportsbook.note && (
                          <p className={`text-xs mt-1 ${
                            sportsbook.matchBonus ? 'text-green-500' : isDark ? 'text-gray-500' : 'text-gray-500'
                          } ${isDisabled ? 'opacity-75' : ''}`}>
                            {sportsbook.note}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-xs ${
                            isDark ? 'text-gray-500' : 'text-gray-500'
                          } ${isDisabled ? 'opacity-75' : ''}`}>
                            Fee: {sportsbook.fee}
                          </span>
                          <span className={`text-xs ${
                            isDark ? 'text-gray-500' : 'text-gray-500'
                          } ${isDisabled ? 'opacity-75' : ''}`}>
                            Time: {sportsbook.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <p className={`text-xs text-center ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>
            All deposits are free. Your funds are secure and FDIC insured. We use bank-level encryption to protect your information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddFundsModal;