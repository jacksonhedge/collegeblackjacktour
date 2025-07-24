import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallet } from '../../contexts/WalletContext';
import P2PTransferService from '../../services/P2PTransferService';
import { 
  X, 
  Search, 
  Send, 
  Clock, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Shield,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';

const SendMoneyModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { walletData, refreshWallet } = useWallet();
  const [step, setStep] = useState('search'); // search, amount, confirm, pin, success
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentRecipients, setRecentRecipients] = useState([]);
  const [pin, setPin] = useState('');
  const [transferData, setTransferData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadRecentRecipients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadRecentRecipients = async () => {
    try {
      const history = await P2PTransferService.getTransferHistory(currentUser.id, 10);
      const recipients = new Map();
      
      history.forEach(transfer => {
        if (transfer.sender_id === currentUser.id && transfer.receiver) {
          recipients.set(transfer.receiver.id, transfer.receiver);
        }
      });
      
      setRecentRecipients(Array.from(recipients.values()).slice(0, 5));
    } catch (error) {
      console.error('Error loading recent recipients:', error);
    }
  };

  const searchUsers = async () => {
    try {
      const results = await P2PTransferService.searchUsers(searchQuery);
      setSearchResults(results.filter(user => user.id !== currentUser.id));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    setStep('amount');
    setError(null);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const handleContinueToConfirm = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Check balance
    if (amountNum > walletData.balance) {
      setError('Insufficient balance');
      return;
    }

    // Check limits
    try {
      const limitCheck = await P2PTransferService.checkTransferLimits(currentUser.id, amountNum);
      if (!limitCheck.allowed) {
        setError(limitCheck.reason);
        return;
      }
    } catch (err) {
      setError('Unable to verify transfer limits');
      return;
    }

    setError(null);
    setStep('confirm');
  };

  const handleConfirmTransfer = () => {
    const verification = P2PTransferService.getRequiredVerification(
      parseFloat(amount),
      selectedRecipient.id,
      false // TODO: Check if trusted contact
    );

    if (verification.requiresPIN) {
      setStep('pin');
    } else {
      processTransfer();
    }
  };

  const handlePinSubmit = () => {
    // TODO: Verify PIN
    if (pin.length === 4) {
      processTransfer();
    } else {
      setError('Please enter your 4-digit PIN');
    }
  };

  const processTransfer = async () => {
    try {
      setLoading(true);
      setError(null);

      const transfer = await P2PTransferService.initiateTransfer(
        currentUser.id,
        selectedRecipient.id,
        parseFloat(amount),
        description || undefined
      );

      setTransferData(transfer);
      setStep('success');
      refreshWallet();
      
      toast.success(`Sent ${formatCurrency(amount)} to ${selectedRecipient.username}`);
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.message || 'Transfer failed. Please try again.');
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  const renderSearch = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Send Money
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Send money to friends instantly
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username or email..."
          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
            isDark 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 justify-center">
        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
          isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'
        }`}>
          <QrCode className="w-4 h-4" />
          <span className="text-sm">Scan QR</span>
        </button>
      </div>

      {/* Recent Recipients */}
      {recentRecipients.length > 0 && !searchQuery && (
        <div>
          <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Recent
          </h3>
          <div className="space-y-2">
            {recentRecipients.map(recipient => (
              <button
                key={recipient.id}
                onClick={() => handleRecipientSelect(recipient)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {recipient.avatar_url ? (
                    <img src={recipient.avatar_url} alt="" className="w-full h-full rounded-full" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {recipient.username}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {recipient.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Search Results
          </h3>
          <div className="space-y-2">
            {searchResults.map(user => (
              <button
                key={user.id}
                onClick={() => handleRecipientSelect(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user.username}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {user.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAmount = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Send to {selectedRecipient?.username}
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          How much would you like to send?
        </p>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <div className="relative">
          <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className={`w-full pl-12 pr-4 py-4 text-3xl font-bold text-center rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
        </div>
        <p className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          Available balance: {formatCurrency(walletData.balance)}
        </p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {['10', '25', '50', '100'].map(quickAmount => (
          <button
            key={quickAmount}
            onClick={() => setAmount(quickAmount)}
            className={`py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            ${quickAmount}
          </button>
        ))}
      </div>

      {/* Note Input */}
      <div>
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Add a note (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this for?"
          maxLength={100}
          className={`w-full mt-1 px-4 py-2 rounded-lg border ${
            isDark 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Continue Button */}
      <button
        onClick={handleContinueToConfirm}
        disabled={!amount || parseFloat(amount) <= 0}
        className={`w-full py-3 rounded-lg font-medium transition-all ${
          !amount || parseFloat(amount) <= 0
            ? isDark 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        Continue
      </button>
    </div>
  );

  const renderConfirm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Confirm Transfer
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Review the details below
        </p>
      </div>

      {/* Transfer Details */}
      <div className={`space-y-4 p-4 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            To
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              {selectedRecipient?.avatar_url ? (
                <img src={selectedRecipient.avatar_url} alt="" className="w-full h-full rounded-full" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedRecipient?.username}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Amount
          </span>
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(amount)}
          </span>
        </div>

        {description && (
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Note
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {description}
            </span>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
        isDark ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <Shield className="w-4 h-4 text-green-500" />
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Your transfer is protected by bank-level security
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setStep('amount')}
          className={`flex-1 py-3 rounded-lg border transition-colors ${
            isDark 
              ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          Back
        </button>
        <button
          onClick={handleConfirmTransfer}
          disabled={loading}
          className="flex-1 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            'Send Money'
          )}
        </button>
      </div>
    </div>
  );

  const renderPIN = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Enter PIN
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Enter your 4-digit PIN to confirm
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } ${pin.length > i ? 'border-purple-500' : ''}`}
          >
            {pin[i] ? '•' : ''}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'delete'].map((num) => (
          <button
            key={num}
            onClick={() => {
              if (num === 'delete') {
                setPin(pin.slice(0, -1));
              } else if (num !== '' && pin.length < 4) {
                setPin(pin + num);
              }
            }}
            disabled={num === ''}
            className={`py-4 rounded-lg text-xl font-medium transition-colors ${
              num === ''
                ? 'invisible'
                : isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            {num === 'delete' ? '⌫' : num}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <button
        onClick={handlePinSubmit}
        disabled={pin.length !== 4 || loading}
        className={`w-full py-3 rounded-lg font-medium transition-all ${
          pin.length !== 4
            ? isDark 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          'Confirm'
        )}
      </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>

      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Money Sent!
        </h2>
        <p className={`text-4xl font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
          {formatCurrency(amount)}
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Sent to {selectedRecipient?.username}
        </p>
      </div>

      {transferData && (
        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          Transaction ID: {transferData.id.slice(0, 8)}...
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
      >
        Done
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-600" />
              <h3 className={`font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Send Money
              </h3>
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
          {step === 'search' && renderSearch()}
          {step === 'amount' && renderAmount()}
          {step === 'confirm' && renderConfirm()}
          {step === 'pin' && renderPIN()}
          {step === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default SendMoneyModal;