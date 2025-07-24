import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DwollaProxyService } from '../../services/payments/DwollaProxyService';
import { ArrowUpRight, ArrowDownLeft, Building2, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const TRANSFER_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal'
};

const TRANSFER_STATES = {
  FORM: 'form',
  CONFIRMING: 'confirming',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

export default function DwollaACHPayment({ 
  onSuccess, 
  onCancel, 
  defaultType = TRANSFER_TYPES.DEPOSIT,
  bankrollAccountId // The Bankroll platform's Dwolla funding source ID
}) {
  const { currentUser } = useAuth();
  const [transferType, setTransferType] = useState(defaultType);
  const [transferState, setTransferState] = useState(TRANSFER_STATES.FORM);
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transferDetails, setTransferDetails] = useState(null);

  // Initialize Dwolla service
  const dwollaService = DwollaProxyService.getInstance();

  useEffect(() => {
    fetchUserAccounts();
  }, []);

  const fetchUserAccounts = async () => {
    try {
      setLoading(true);
      
      if (!currentUser.dwollaCustomerId) {
        setError('No payment account found. Please connect a bank account first.');
        return;
      }

      const accounts = await dwollaService.getAccounts(currentUser.dwollaCustomerId);
      const verifiedAccounts = accounts.filter(acc => acc.status === 'verified');
      
      setUserAccounts(verifiedAccounts);
      
      if (verifiedAccounts.length > 0) {
        setSelectedAccount(verifiedAccounts[0]);
      } else {
        setError('No verified bank accounts found. Please verify your bank account first.');
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
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

  const validateTransfer = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (numAmount < 0.01) {
      setError('Minimum transfer amount is $0.01');
      return false;
    }
    
    if (numAmount > 10000) {
      setError('Maximum transfer amount is $10,000');
      return false;
    }
    
    if (!selectedAccount) {
      setError('Please select a bank account');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateTransfer()) {
      return;
    }
    
    setTransferState(TRANSFER_STATES.CONFIRMING);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError('');
      setTransferState(TRANSFER_STATES.PROCESSING);
      
      const transferData = {
        sourceAccountId: transferType === TRANSFER_TYPES.DEPOSIT ? selectedAccount.id : bankrollAccountId,
        destinationAccountId: transferType === TRANSFER_TYPES.DEPOSIT ? bankrollAccountId : selectedAccount.id,
        amount: parseFloat(amount),
        currency: 'USD',
        metadata: {
          userId: currentUser.id,
          transferType: transferType,
          timestamp: new Date().toISOString()
        }
      };
      
      const transfer = await dwollaService.createTransfer(transferData);
      
      setTransferDetails({
        id: transfer.id,
        amount: transfer.amount,
        status: transfer.status,
        createdAt: transfer.createdAt
      });
      
      setTransferState(TRANSFER_STATES.SUCCESS);
      
      if (onSuccess) {
        onSuccess({
          transferId: transfer.id,
          amount: transfer.amount,
          type: transferType,
          status: transfer.status
        });
      }
    } catch (err) {
      console.error('Transfer failed:', err);
      setError(err.message || 'Transfer failed. Please try again.');
      setTransferState(TRANSFER_STATES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  const getEstimatedArrival = () => {
    const today = new Date();
    const businessDays = 3; // ACH typically takes 3-5 business days
    let daysAdded = 0;
    
    while (daysAdded < businessDays) {
      today.setDate(today.getDate() + 1);
      // Skip weekends
      if (today.getDay() !== 0 && today.getDay() !== 6) {
        daysAdded++;
      }
    }
    
    return today.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderContent = () => {
    switch (transferState) {
      case TRANSFER_STATES.FORM:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transfer Type Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setTransferType(TRANSFER_TYPES.DEPOSIT)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                  transferType === TRANSFER_TYPES.DEPOSIT
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setTransferType(TRANSFER_TYPES.WITHDRAWAL)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                  transferType === TRANSFER_TYPES.WITHDRAWAL
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  $
                </span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Min: $0.01 • Max: $10,000
              </p>
            </div>

            {/* Account Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {transferType === TRANSFER_TYPES.DEPOSIT ? 'From Account' : 'To Account'}
              </label>
              <select
                value={selectedAccount?.id || ''}
                onChange={(e) => {
                  const account = userAccounts.find(acc => acc.id === e.target.value);
                  setSelectedAccount(account);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {userAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} {account.last4 && `(****${account.last4})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Transfer Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">ACH Transfer Information</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Processing time: 3-5 business days</li>
                    <li>• No fees for standard transfers</li>
                    <li>• Estimated arrival: {getEstimatedArrival()}</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !amount || !selectedAccount}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Continue
              </button>
            </div>
          </form>
        );

      case TRANSFER_STATES.CONFIRMING:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Transfer</h3>
              <p className="text-gray-600 mt-1">Please review your transfer details</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Type</span>
                <span className="font-medium text-gray-900 capitalize flex items-center gap-2">
                  {transferType === TRANSFER_TYPES.DEPOSIT ? (
                    <ArrowDownLeft className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-blue-600" />
                  )}
                  {transferType}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-2xl text-gray-900">
                  {formatCurrency(amount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {transferType === TRANSFER_TYPES.DEPOSIT ? 'From' : 'To'}
                </span>
                <span className="font-medium text-gray-900">
                  {selectedAccount?.name}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing Time</span>
                <span className="font-medium text-gray-900">3-5 business days</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fees</span>
                <span className="font-medium text-gray-900">$0.00</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setTransferState(TRANSFER_STATES.FORM)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        );

      case TRANSFER_STATES.PROCESSING:
        return (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Transfer
            </h3>
            <p className="text-gray-600">
              Please wait while we process your {transferType}...
            </p>
          </div>
        );

      case TRANSFER_STATES.SUCCESS:
        return (
          <div className="text-center py-12 space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Transfer Initiated!
              </h3>
              <p className="text-gray-600">
                Your {transferType} of {formatCurrency(amount)} has been initiated
              </p>
            </div>
            
            {transferDetails && (
              <div className="bg-gray-50 rounded-lg p-4 text-sm max-w-sm mx-auto">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transfer ID</span>
                    <span className="font-mono text-xs">{transferDetails.id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected By</span>
                    <span className="font-medium">{getEstimatedArrival()}</span>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Done
            </button>
          </div>
        );

      case TRANSFER_STATES.ERROR:
        return (
          <div className="text-center py-12 space-y-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Transfer Failed
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {error || 'We couldn\'t process your transfer. Please try again.'}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setTransferState(TRANSFER_STATES.FORM);
                  setError('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Try Again
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bank Transfer</h2>
          <p className="text-sm text-gray-600">Powered by Dwolla</p>
        </div>
      </div>

      {loading && userAccounts.length === 0 ? (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading bank accounts...</p>
        </div>
      ) : userAccounts.length === 0 && !loading ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No bank accounts found</p>
          <button
            onClick={onCancel}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Connect a bank account
          </button>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}