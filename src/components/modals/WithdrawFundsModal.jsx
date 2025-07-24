import React, { useState } from 'react';
import { X, Building2, DollarSign, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const WithdrawFundsModal = ({ isOpen, onClose, currentBalance = 0 }) => {
  const { isDark } = useTheme();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');

  if (!isOpen) return null;

  const withdrawMethods = [
    {
      id: 'bank',
      name: 'Bank Account (ACH)',
      icon: Building2,
      description: 'Standard withdrawal to your bank',
      fee: 'Free',
      time: '1-3 business days',
      minAmount: 10
    },
    {
      id: 'instant',
      name: 'Instant Transfer',
      icon: DollarSign,
      description: 'Get your money immediately',
      fee: '1.5% fee',
      time: '30 minutes',
      minAmount: 10
    }
  ];

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    if (!amount || withdrawAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (withdrawAmount > currentBalance) {
      alert('Insufficient balance');
      return;
    }
    
    const method = withdrawMethods.find(m => m.id === selectedMethod);
    if (withdrawAmount < method.minAmount) {
      alert(`Minimum withdrawal amount is $${method.minAmount}`);
      return;
    }

    // Placeholder for future functionality
    alert(`Withdraw $${withdrawAmount} via ${method.name} - Coming soon!`);
    onClose();
  };

  const method = withdrawMethods.find(m => m.id === selectedMethod);
  const fee = selectedMethod === 'instant' ? parseFloat(amount || 0) * 0.015 : 0;
  const totalReceive = parseFloat(amount || 0) - fee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
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
                Withdraw Funds
              </h2>
              <p className={`text-sm mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Available balance: ${currentBalance.toFixed(2)}
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Amount Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Amount to withdraw
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={currentBalance}
                className={`w-full pl-8 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Withdrawal Methods */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Withdrawal method
            </label>
            <div className="space-y-2">
              {withdrawMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? isDark
                          ? 'bg-purple-900/20 border-purple-600'
                          : 'bg-purple-50 border-purple-500'
                        : isDark
                          ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="withdrawMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="mt-1 text-purple-600 focus:ring-purple-500"
                    />
                    <Icon className={`w-5 h-5 mt-0.5 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {method.name}
                      </p>
                      <p className={`text-sm mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {method.description}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className={`text-xs ${
                          isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Fee: {method.fee}
                        </span>
                        <span className={`text-xs ${
                          isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Time: {method.time}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Withdrawal amount
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    ${parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                {fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Processing fee
                    </span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      -${fee.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t border-gray-700">
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    You'll receive
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    ${totalReceive.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className={`flex items-start gap-2 p-3 rounded-lg ${
            isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'
          }`}>
            <AlertCircle className={`w-4 h-4 mt-0.5 ${
              isDark ? 'text-yellow-500' : 'text-yellow-600'
            }`} />
            <p className={`text-sm ${
              isDark ? 'text-yellow-200' : 'text-yellow-800'
            }`}>
              Minimum withdrawal: ${method?.minAmount || 10}. Funds will be sent to your linked bank account.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t flex gap-3 ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
              isDark 
                ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentBalance}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              amount && parseFloat(amount) > 0 && parseFloat(amount) <= currentBalance
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Withdraw ${totalReceive > 0 ? totalReceive.toFixed(2) : '0.00'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawFundsModal;