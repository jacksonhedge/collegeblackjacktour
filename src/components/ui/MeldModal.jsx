import React, { useState } from 'react';
import { X, DollarSign, Building2 } from 'lucide-react';

export default function MeldModal({ isOpen, onClose, type = 'deposit', onSave }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ amount: parseFloat(amount) });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md relative border border-purple-500/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-6 flex items-center justify-center">
          <div className="bg-blue-500 p-4 rounded-full">
            <Building2 className="h-8 w-8 text-white" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-4 text-center">
          {type === 'deposit' ? 'Bank Transfer' : 'Withdraw to Bank'}
        </h2>

        <p className="text-gray-400 mb-6 text-center">
          {type === 'deposit' 
            ? 'Enter the amount you want to deposit from your bank account.'
            : 'Enter the amount you want to withdraw to your bank account.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors ${
              type === 'deposit'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {type === 'deposit' 
              ? 'Continue to Bank Connection'
              : 'Withdraw to Bank'}
          </button>
        </form>
      </div>
    </div>
  );
}
