import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Bitcoin, 
  CreditCard, 
  ArrowRight, 
  Shield, 
  Info,
  Loader2,
  Check,
  X,
  TrendingUp,
  Wallet
} from 'lucide-react';

const CryptoPurchase = ({ onSuccess, onClose }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [step, setStep] = useState('select'); // select, amount, payment, processing, success
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [amount, setAmount] = useState('100');
  const [cryptoAmount, setCryptoAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState({});

  // Popular cryptocurrencies
  const cryptoOptions = [
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: '₿',
      color: '#F7931A',
      description: 'Digital gold standard'
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: 'Ξ',
      color: '#627EEA',
      description: 'Smart contract platform'
    },
    {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      icon: '$',
      color: '#2775CA',
      description: 'Stable digital dollar'
    },
    {
      id: 'sol',
      name: 'Solana',
      symbol: 'SOL',
      icon: '◎',
      color: '#14F195',
      description: 'High-speed blockchain'
    }
  ];

  // Preset amounts
  const presetAmounts = [50, 100, 250, 500, 1000];

  useEffect(() => {
    // Fetch current crypto prices
    fetchCryptoPrices();
  }, []);

  useEffect(() => {
    // Calculate crypto amount when USD amount or crypto selection changes
    if (selectedCrypto && prices[selectedCrypto.id] && amount) {
      const cryptoValue = parseFloat(amount) / prices[selectedCrypto.id];
      setCryptoAmount(cryptoValue.toFixed(6));
    }
  }, [amount, selectedCrypto, prices]);

  const fetchCryptoPrices = async () => {
    try {
      // In production, this would call your backend which fetches from a crypto price API
      // For demo, using mock prices
      setPrices({
        btc: 45000,
        eth: 2500,
        usdc: 1,
        sol: 100
      });
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    }
  };

  const handlePurchase = async () => {
    setStep('processing');
    setLoading(true);

    try {
      // In production, this would:
      // 1. Create a payment intent with your crypto provider
      // 2. Handle payment processing
      // 3. Execute crypto purchase
      // 4. Credit user's wallet

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      setStep('success');
      if (onSuccess) {
        onSuccess({
          crypto: selectedCrypto.symbol,
          amount: cryptoAmount,
          usdAmount: amount,
          transactionId: `TXN-${Date.now()}`
        });
      }
    } catch (error) {
      console.error('Error processing crypto purchase:', error);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const renderCryptoSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Buy Cryptocurrency
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Purchase crypto instantly with your card or bank
        </p>
      </div>

      <div className="space-y-3">
        {cryptoOptions.map((crypto) => (
          <button
            key={crypto.id}
            onClick={() => {
              setSelectedCrypto(crypto);
              setStep('amount');
            }}
            className={`w-full p-4 rounded-lg border transition-all ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: crypto.color }}
                >
                  {crypto.icon}
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {crypto.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {crypto.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${prices[crypto.id]?.toLocaleString() || '---'}
                </p>
                <p className={`text-xs ${
                  Math.random() > 0.5 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 5).toFixed(2)}%
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className={`flex items-center justify-center gap-2 text-xs ${
        isDark ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <Shield className="w-3 h-3" />
        <span>Secure crypto purchases powered by industry leaders</span>
      </div>
    </div>
  );

  const renderAmountSelection = () => (
    <div className="space-y-6">
      <button
        onClick={() => setStep('select')}
        className={`flex items-center gap-2 text-sm ${
          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        ← Back to crypto selection
      </button>

      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: selectedCrypto.color }}
          >
            {selectedCrypto.icon}
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Buy {selectedCrypto.name}
          </h2>
        </div>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          How much would you like to purchase?
        </p>
      </div>

      {/* Amount Input */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Amount in USD
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
            className={`w-full pl-8 pr-4 py-3 text-lg rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            placeholder="0.00"
            min="10"
            max="10000"
          />
        </div>
      </div>

      {/* Preset Amounts */}
      <div className="grid grid-cols-5 gap-2">
        {presetAmounts.map((preset) => (
          <button
            key={preset}
            onClick={() => setAmount(preset.toString())}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              amount === preset.toString()
                ? 'bg-purple-600 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ${preset}
          </button>
        ))}
      </div>

      {/* Conversion Display */}
      <div className={`p-4 rounded-lg ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            You'll receive
          </span>
          <div className="text-right">
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {cryptoAmount} {selectedCrypto.symbol}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              @ ${prices[selectedCrypto.id]?.toLocaleString()}/{selectedCrypto.symbol}
            </p>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => setStep('payment')}
        disabled={!amount || parseFloat(amount) < 10}
        className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continue to Payment
      </button>

      {/* Info */}
      <div className={`flex items-start gap-2 p-3 rounded-lg ${
        isDark ? 'bg-blue-900/20' : 'bg-blue-50'
      }`}>
        <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
          isDark ? 'text-blue-400' : 'text-blue-600'
        }`} />
        <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
          Minimum purchase: $10. Maximum purchase: $10,000. Prices include all fees.
        </p>
      </div>
    </div>
  );

  const renderPaymentMethod = () => (
    <div className="space-y-6">
      <button
        onClick={() => setStep('amount')}
        className={`flex items-center gap-2 text-sm ${
          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        ← Back to amount
      </button>

      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Payment Method
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Choose how you'd like to pay
        </p>
      </div>

      {/* Payment Options */}
      <div className="space-y-3">
        <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
          paymentMethod === 'card'
            ? `border-purple-600 ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`
            : isDark 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}>
          <input
            type="radio"
            name="payment"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="sr-only"
          />
          <CreditCard className={`w-5 h-5 mr-3 ${
            paymentMethod === 'card' ? 'text-purple-600' : isDark ? 'text-gray-400' : 'text-gray-600'
          }`} />
          <div className="flex-1">
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Credit/Debit Card
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Instant • 3.5% fee
            </p>
          </div>
          {paymentMethod === 'card' && (
            <Check className="w-5 h-5 text-purple-600" />
          )}
        </label>

        <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
          paymentMethod === 'bank'
            ? `border-purple-600 ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`
            : isDark 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}>
          <input
            type="radio"
            name="payment"
            value="bank"
            checked={paymentMethod === 'bank'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="sr-only"
          />
          <Wallet className={`w-5 h-5 mr-3 ${
            paymentMethod === 'bank' ? 'text-purple-600' : isDark ? 'text-gray-400' : 'text-gray-600'
          }`} />
          <div className="flex-1">
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Bank Account (ACH)
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              3-5 days • 1.5% fee
            </p>
          </div>
          {paymentMethod === 'bank' && (
            <Check className="w-5 h-5 text-purple-600" />
          )}
        </label>
      </div>

      {/* Summary */}
      <div className={`p-4 rounded-lg space-y-2 ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="flex justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Purchase amount
          </span>
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${amount}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Processing fee
          </span>
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${(parseFloat(amount) * (paymentMethod === 'card' ? 0.035 : 0.015)).toFixed(2)}
          </span>
        </div>
        <div className={`flex justify-between pt-2 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-300'
        }`}>
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Total
          </span>
          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${(parseFloat(amount) * (1 + (paymentMethod === 'card' ? 0.035 : 0.015))).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
      >
        Complete Purchase
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-12 space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
          <Bitcoin className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600" />
        </div>
      </div>
      <div>
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Processing Your Purchase
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          This may take a few moments...
        </p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-green-600" />
        </div>
      </div>
      <div>
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Purchase Complete!
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {cryptoAmount} {selectedCrypto?.symbol} has been added to your wallet
        </p>
      </div>
      <button
        onClick={onClose}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Done
      </button>
    </div>
  );

  return (
    <div className={`relative max-w-md w-full mx-auto p-6 rounded-2xl ${
      isDark ? 'bg-gray-900' : 'bg-white'
    } shadow-xl`}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
          isDark 
            ? 'hover:bg-gray-800 text-gray-400' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content based on step */}
      {step === 'select' && renderCryptoSelection()}
      {step === 'amount' && renderAmountSelection()}
      {step === 'payment' && renderPaymentMethod()}
      {step === 'processing' && renderProcessing()}
      {step === 'success' && renderSuccess()}
    </div>
  );
};

export default CryptoPurchase;