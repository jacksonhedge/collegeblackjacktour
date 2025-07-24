import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import dwollaService from '../../services/dwolla/DwollaService';
import DwollaErrors from '../../services/dwolla/DwollaErrors';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { DollarSign, Building2, CreditCard } from 'lucide-react';

export default function DepositScreen({ onClose }) {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fundingSources, setFundingSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [depositMethod, setDepositMethod] = useState('ach');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!currentUser?.dwollaCustomerId) {
        throw new Error('No Dwolla account found');
      }

      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Here you would integrate with your backend to initiate the deposit
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onClose();
    } catch (err) {
      console.error('Deposit error:', err);
      setError(DwollaErrors.getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <Card className="bg-gray-900/40 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white">Deposit Funds</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="block w-full pl-10 pr-4 py-2 rounded-md bg-gray-800 border-gray-700 
                  text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Deposit Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Deposit Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* ACH Option */}
              <button
                type="button"
                onClick={() => setDepositMethod('ach')}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center space-y-2 transition-colors
                  ${depositMethod === 'ach' 
                    ? 'bg-purple-900/40 border-purple-500' 
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
              >
                <Building2 className="h-6 w-6 text-white" />
                <span className="text-sm text-white">ACH</span>
              </button>

              {/* Venmo Option (Disabled) */}
              <div className="relative">
                <button
                  type="button"
                  disabled
                  className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/50 
                    flex flex-col items-center justify-center space-y-2 opacity-50 cursor-not-allowed"
                >
                  <img src="/images/venmo icon.png" alt="Venmo" className="h-6 w-6" />
                  <span className="text-sm text-white">Venmo</span>
                </button>
                <span className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-400">
                  Coming Soon
                </span>
              </div>

              {/* Debit Card Option (Disabled) */}
              <div className="relative">
                <button
                  type="button"
                  disabled
                  className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/50 
                    flex flex-col items-center justify-center space-y-2 opacity-50 cursor-not-allowed"
                >
                  <CreditCard className="h-6 w-6 text-white" />
                  <span className="text-sm text-white">Debit Card</span>
                </button>
                <span className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-400">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          {/* Preset Amounts */}
          <div className="grid grid-cols-3 gap-2 mt-8">
            {presetAmounts.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className="py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg 
                  transition-colors border border-gray-700"
              >
                ${preset}
              </button>
            ))}
          </div>

          {error && (
            <div className="text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg 
                transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount}
              className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
