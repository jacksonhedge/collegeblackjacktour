import React, { useState } from 'react';
import { 
  FundType, 
  UserFunds,
  canWithdraw,
  canTransfer
} from '../../types/funds';
import { fundManager } from '../../services/FundManagerService';
import { formatCurrency } from '../../lib/utils';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface FundOperationsProps {
  userId: string;
  userFunds: UserFunds | null;
  onSuccess?: () => void;
  className?: string;
}

type OperationType = 'deposit' | 'withdraw' | 'transfer';

interface OperationState {
  type: OperationType | null;
  fundType: FundType;
  amount: string;
  recipientId: string;
  description: string;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export function FundOperations({
  userId,
  userFunds,
  onSuccess,
  className = ''
}: FundOperationsProps) {
  const [state, setState] = useState<OperationState>({
    type: null,
    fundType: FundType.CASH,
    amount: '',
    recipientId: '',
    description: '',
    loading: false,
    error: null,
    success: false
  });

  const resetForm = () => {
    setState({
      type: null,
      fundType: FundType.CASH,
      amount: '',
      recipientId: '',
      description: '',
      loading: false,
      error: null,
      success: false
    });
  };

  const handleDeposit = async () => {
    if (!state.amount || parseFloat(state.amount) <= 0) {
      setState(prev => ({ ...prev, error: 'Please enter a valid amount' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fundManager.deposit({
        userId,
        amount: parseFloat(state.amount),
        fundType: state.fundType as FundType.CASH | FundType.SENDABLE,
        paymentMethodId: 'demo-payment-method' // Replace with actual payment method
      });

      if (result.success) {
        setState(prev => ({ ...prev, success: true, loading: false }));
        setTimeout(() => {
          resetForm();
          onSuccess?.();
        }, 2000);
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Deposit failed', loading: false }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'An error occurred', loading: false }));
    }
  };

  const handleWithdraw = async () => {
    if (!state.amount || parseFloat(state.amount) <= 0) {
      setState(prev => ({ ...prev, error: 'Please enter a valid amount' }));
      return;
    }

    if (!userFunds || parseFloat(state.amount) > userFunds.balances[FundType.CASH].available) {
      setState(prev => ({ ...prev, error: 'Insufficient funds' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fundManager.withdraw({
        userId,
        amount: parseFloat(state.amount),
        withdrawalMethodId: 'demo-withdrawal-method' // Replace with actual withdrawal method
      });

      if (result.success) {
        setState(prev => ({ ...prev, success: true, loading: false }));
        setTimeout(() => {
          resetForm();
          onSuccess?.();
        }, 2000);
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Withdrawal failed', loading: false }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'An error occurred', loading: false }));
    }
  };

  const handleTransfer = async () => {
    if (!state.amount || parseFloat(state.amount) <= 0) {
      setState(prev => ({ ...prev, error: 'Please enter a valid amount' }));
      return;
    }

    if (!state.recipientId) {
      setState(prev => ({ ...prev, error: 'Please enter recipient ID' }));
      return;
    }

    if (!userFunds || parseFloat(state.amount) > userFunds.balances[state.fundType].available) {
      setState(prev => ({ ...prev, error: 'Insufficient funds' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fundManager.transfer({
        fromUserId: userId,
        toUserId: state.recipientId,
        amount: parseFloat(state.amount),
        fundType: state.fundType as FundType.CASH | FundType.SENDABLE,
        description: state.description || undefined
      });

      if (result.success) {
        setState(prev => ({ ...prev, success: true, loading: false }));
        setTimeout(() => {
          resetForm();
          onSuccess?.();
        }, 2000);
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Transfer failed', loading: false }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'An error occurred', loading: false }));
    }
  };

  const handleSubmit = () => {
    switch (state.type) {
      case 'deposit':
        handleDeposit();
        break;
      case 'withdraw':
        handleWithdraw();
        break;
      case 'transfer':
        handleTransfer();
        break;
    }
  };

  if (!userFunds) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fund Operations</h3>

      {state.type === null ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setState(prev => ({ ...prev, type: 'deposit' }))}
            className="flex flex-col items-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <ArrowDownLeft className="h-8 w-8 text-green-600 mb-2" />
            <span className="font-medium text-gray-900">Deposit</span>
            <span className="text-sm text-gray-600 mt-1">Add funds</span>
          </button>

          <button
            onClick={() => setState(prev => ({ ...prev, type: 'withdraw' }))}
            className="flex flex-col items-center p-6 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <ArrowUpRight className="h-8 w-8 text-red-600 mb-2" />
            <span className="font-medium text-gray-900">Withdraw</span>
            <span className="text-sm text-gray-600 mt-1">Cash out</span>
          </button>

          <button
            onClick={() => setState(prev => ({ ...prev, type: 'transfer' }))}
            className="flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Send className="h-8 w-8 text-blue-600 mb-2" />
            <span className="font-medium text-gray-900">Transfer</span>
            <span className="text-sm text-gray-600 mt-1">Send funds</span>
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 capitalize">{state.type} Funds</h4>
            <button
              onClick={resetForm}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>

          {state.success ? (
            <div className="bg-green-50 rounded-lg p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">Success!</p>
              <p className="text-sm text-gray-600 mt-1">Your {state.type} has been processed</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              {/* Fund Type Selection (for deposit and transfer) */}
              {(state.type === 'deposit' || state.type === 'transfer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fund Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {state.type === 'deposit' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setState(prev => ({ ...prev, fundType: FundType.CASH }))}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            state.fundType === FundType.CASH
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Wallet className="h-5 w-5 mx-auto mb-1 text-gray-700" />
                          <span className="text-sm font-medium">Cash</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setState(prev => ({ ...prev, fundType: FundType.SENDABLE }))}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            state.fundType === FundType.SENDABLE
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Send className="h-5 w-5 mx-auto mb-1 text-gray-700" />
                          <span className="text-sm font-medium">Sendable</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setState(prev => ({ ...prev, fundType: FundType.CASH }))}
                          disabled={!canTransfer(FundType.CASH)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            state.fundType === FundType.CASH
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${!canTransfer(FundType.CASH) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Wallet className="h-5 w-5 mx-auto mb-1 text-gray-700" />
                          <span className="text-sm font-medium">Cash</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setState(prev => ({ ...prev, fundType: FundType.SENDABLE }))}
                          disabled={!canTransfer(FundType.SENDABLE)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            state.fundType === FundType.SENDABLE
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${!canTransfer(FundType.SENDABLE) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Send className="h-5 w-5 mx-auto mb-1 text-gray-700" />
                          <span className="text-sm font-medium">Sendable</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={state.amount}
                    onChange={(e) => setState(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {state.type !== 'deposit' && (
                  <p className="mt-1 text-sm text-gray-500">
                    Available: {formatCurrency(userFunds.balances[state.fundType].available)}
                  </p>
                )}
              </div>

              {/* Recipient ID (for transfer) */}
              {state.type === 'transfer' && (
                <>
                  <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient ID
                    </label>
                    <input
                      id="recipient"
                      type="text"
                      placeholder="Enter recipient user ID"
                      value={state.recipientId}
                      onChange={(e) => setState(prev => ({ ...prev, recipientId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <input
                      id="description"
                      type="text"
                      placeholder="What's this for?"
                      value={state.description}
                      onChange={(e) => setState(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Error Message */}
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                  <span className="text-sm text-red-700">{state.error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={state.loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {state.loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>Confirm {state.type}</>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}