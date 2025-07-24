import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { meldProxyService } from '../../services/meld/MeldProxyService';
import { MeldPaymentService } from '../../services/payments/MeldPaymentService';
import { 
  DollarSign, 
  Building2, 
  ChevronRight, 
  Loader2, 
  Shield, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Info
} from 'lucide-react';

const MeldACHPayment = ({ onSuccess, onClose, connectedAccount }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [step, setStep] = useState('amount'); // amount, confirm, processing, success, error
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [transferId, setTransferId] = useState(null);

  useEffect(() => {
    if (connectedAccount) {
      setSelectedAccount(connectedAccount);
      loadConnectedAccounts();
    } else {
      loadConnectedAccounts();
    }
  }, [connectedAccount]);

  const loadConnectedAccounts = async () => {
    try {
      setLoading(true);
      const meldService = MeldPaymentService.getInstance();
      
      // Get customer ID from user metadata or create customer
      const customerId = currentUser.user_metadata?.meld_customer_id;
      if (!customerId) {
        setError('Please connect a bank account first');
        return;
      }

      const customerAccounts = await meldService.getAccounts(customerId);
      setAccounts(customerAccounts);

      // If we have accounts, select the first one by default
      if (customerAccounts.length > 0 && !selectedAccount) {
        setSelectedAccount(customerAccounts[0]);
        // Load balance for the selected account
        const balance = await meldService.getBalance(customerAccounts[0].id);
        setAccountBalance(balance);
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
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

  const handleContinue = () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (amountNum < 1) {
      setError('Minimum deposit amount is $1.00');
      return;
    }
    if (amountNum > 10000) {
      setError('Maximum deposit amount is $10,000.00');
      return;
    }
    if (accountBalance && amountNum > accountBalance.available) {
      setError('Insufficient funds in your bank account');
      return;
    }
    setError(null);
    setStep('confirm');
  };

  const handleConfirmTransfer = async () => {
    try {
      setLoading(true);
      setError(null);
      setStep('processing');

      const meldService = MeldPaymentService.getInstance();
      
      // Get or create the Bankroll master account ID
      const bankrollAccountId = import.meta.env.VITE_BANKROLL_MELD_ACCOUNT_ID;
      if (!bankrollAccountId) {
        throw new Error('Bankroll account configuration missing');
      }

      // Create the transfer
      const transfer = await meldService.createTransfer({
        sourceAccountId: selectedAccount.id,
        destinationAccountId: bankrollAccountId,
        amount: parseFloat(amount),
        currency: 'USD',
        description: `Bankroll wallet deposit - ${currentUser.email}`,
        metadata: {
          userId: currentUser.id,
          userEmail: currentUser.email,
          depositType: 'wallet_funding'
        }
      });

      setTransferId(transfer.id);
      
      // Poll for transfer status
      await pollTransferStatus(transfer.id);
      
    } catch (err) {
      console.error('Error creating transfer:', err);
      setError(err.message || 'Failed to initiate transfer');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const pollTransferStatus = async (transferId, attempts = 0) => {
    const maxAttempts = 30; // 30 attempts = 1.5 minutes
    const pollInterval = 3000; // 3 seconds

    if (attempts >= maxAttempts) {
      setError('Transfer is taking longer than expected. Please check your transaction history.');
      setStep('error');
      return;
    }

    try {
      const meldService = MeldPaymentService.getInstance();
      const transfer = await meldService.getTransfer(transferId);

      if (transfer.status === 'completed') {
        setStep('success');
        if (onSuccess) {
          onSuccess({
            amount: transfer.amount,
            transferId: transfer.id,
            accountName: selectedAccount.name,
            bankName: selectedAccount.bankName
          });
        }
      } else if (transfer.status === 'failed') {
        setError('Transfer failed. Please try again or contact support.');
        setStep('error');
      } else {
        // Still processing, poll again
        setTimeout(() => pollTransferStatus(transferId, attempts + 1), pollInterval);
      }
    } catch (err) {
      console.error('Error polling transfer status:', err);
      setError('Unable to check transfer status');
      setStep('error');
    }
  };

  const renderAmount = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img 
            src="/images/hedge-pay-logo.png" 
            alt="Hedge Pay" 
            className="h-10 w-auto"
          />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          ACH by Hedge Pay
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Transfer money from your bank account
        </p>
      </div>

      {/* Account Selection */}
      {accounts.length > 1 && (
        <div className="space-y-2">
          <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Select Bank Account
          </label>
          <select
            value={selectedAccount?.id || ''}
            onChange={(e) => {
              const account = accounts.find(a => a.id === e.target.value);
              setSelectedAccount(account);
            }}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
          >
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.bankName} - {account.name} (...{account.last4})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Account Display */}
      {selectedAccount && (
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedAccount.bankName}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedAccount.name} (...{selectedAccount.last4})
                </p>
              </div>
            </div>
            {accountBalance && (
              <div className="text-right">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Available
                </p>
                <p className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrency(accountBalance.available)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Amount to Deposit
        </label>
        <div className="relative">
          <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className={`w-full pl-10 pr-4 py-3 text-2xl font-medium rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
        </div>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          Minimum: $1.00 • Maximum: $10,000.00
        </p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {['25', '50', '100', '250'].map(quickAmount => (
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

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Continue Button */}
      <button
        onClick={handleContinue}
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

      {/* Info Section */}
      <div className={`flex items-start gap-2 p-3 rounded-lg ${
        isDark ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>ACH transfers typically take 1-3 business days to complete.</p>
          <p className="mt-1">Funds will be available in your Bankroll wallet once the transfer is confirmed.</p>
        </div>
      </div>
    </div>
  );

  const renderConfirm = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img 
            src="/images/hedge-pay-logo.png" 
            alt="Hedge Pay" 
            className="h-10 w-auto"
          />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Confirm Transfer
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Review your transfer details
        </p>
      </div>

      {/* Transfer Details */}
      <div className={`space-y-4 p-4 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            From
          </span>
          <div className="text-right">
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedAccount.bankName}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedAccount.name} (...{selectedAccount.last4})
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            To
          </span>
          <div className="text-right">
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Bankroll Wallet
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentUser.email}
            </p>
          </div>
        </div>

        <div className="border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}">
          <div className="flex justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Amount
            </span>
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Fee
          </span>
          <span className={`font-medium text-green-500`}>
            FREE
          </span>
        </div>

        <div className="flex justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Processing Time
          </span>
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            1-3 business days
          </span>
        </div>
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
          <ArrowLeft className="w-4 h-4 inline mr-2" />
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
            'Confirm Transfer'
          )}
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-12 space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
          <DollarSign className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600" />
        </div>
      </div>
      <div>
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Processing Transfer
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Initiating your ACH transfer...
        </p>
      </div>
      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        This may take a few moments
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
      </div>
      <div>
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Transfer Initiated!
        </h3>
        <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
          {formatCurrency(amount)}
        </p>
        <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Your funds will be available in 1-3 business days
        </p>
      </div>
      
      {transferId && (
        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          Transfer ID: {transferId}
        </div>
      )}

      <button
        onClick={onClose}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Done
      </button>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
      </div>
      <div>
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Transfer Failed
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {error || 'Unable to process your transfer'}
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => {
            setStep('amount');
            setError(null);
          }}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className={`px-6 py-2 rounded-lg transition-colors ${
            isDark 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (loading && step === 'amount') {
    return (
      <div className={`relative max-w-md w-full mx-auto p-6 rounded-2xl ${
        isDark ? 'bg-gray-900' : 'bg-white'
      } shadow-xl`}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative max-w-md w-full mx-auto p-6 rounded-2xl ${
      isDark ? 'bg-gray-900' : 'bg-white'
    } shadow-xl`}>
      {/* Content based on step */}
      {step === 'amount' && renderAmount()}
      {step === 'confirm' && renderConfirm()}
      {step === 'processing' && renderProcessing()}
      {step === 'success' && renderSuccess()}
      {step === 'error' && renderError()}
    </div>
  );
};

export default MeldACHPayment;