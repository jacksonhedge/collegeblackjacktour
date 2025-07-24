import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';

export default function CashAppModal({ isOpen, onClose, type = 'deposit', currentUsername, onSave }) {
  const [username, setUsername] = useState(currentUsername || '');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ username, amount: parseFloat(amount) });
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
          <img
            src="/images/cashapp-icon.svg"
            alt="Cash App"
            className="w-16 h-16"
          />
        </div>

        <h2 className="text-xl font-bold text-white mb-4 text-center">
          {type === 'deposit' ? 'Deposit with Cash App' : 'Withdraw to Cash App'}
        </h2>

        <p className="text-gray-400 mb-6 text-center">
          {type === 'deposit' 
            ? 'Enter your Cash App $Cashtag and the amount you want to deposit.'
            : 'Enter your Cash App $Cashtag and the amount you want to withdraw.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Cash App $Cashtag
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="$cashtag"
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>

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
            {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
          </button>
        </form>
      </div>
    </div>
  );
}
