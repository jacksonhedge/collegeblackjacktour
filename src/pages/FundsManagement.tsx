import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase/config';
import { useFunds } from '../hooks/useFunds';
import { FundBalanceDisplay } from '../components/funds/FundBalanceDisplay';
import { FundTransactionsList } from '../components/funds/FundTransactionsList';
import { FundOperations } from '../components/funds/FundOperations';
import { FundType } from '../types/funds';
import { 
  Wallet, 
  History, 
  Send, 
  ArrowUpDown,
  RefreshCw,
  Info
} from 'lucide-react';

export function FundsManagement() {
  const [user] = useAuthState(auth);
  const { userFunds, transactions, loading, error, refreshFunds, refreshTransactions } = useFunds(user?.uid || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'history'>('overview');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Please sign in to manage your funds</h3>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your funds...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Wallet },
    { id: 'operations', label: 'Operations', icon: ArrowUpDown },
    { id: 'history', label: 'History', icon: History }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Funds Management</h1>
          <p className="mt-2 text-gray-600">Manage your cash, sendable, and promo funds</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <nav className="flex space-x-1 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Fund Balances */}
              <FundBalanceDisplay 
                userFunds={userFunds} 
                showDetails={true}
                className="mb-6"
              />

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Fund Types Explained
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Cash Funds</h4>
                      <p className="text-sm text-gray-600">
                        Your primary balance. Can be withdrawn to your bank account or sent to other users.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Sendable Funds</h4>
                      <p className="text-sm text-gray-600">
                        Can be sent to other users but cannot be withdrawn. Perfect for group activities.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Promo Funds</h4>
                      <p className="text-sm text-gray-600">
                        Bonus funds for platform use only. Cannot be withdrawn or transferred but great for trying new games.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  {transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-sm font-medium ${
                            transaction.type.includes('in') || transaction.type.includes('won') || transaction.type === 'deposit'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.type.includes('in') || transaction.type.includes('won') || transaction.type === 'deposit' ? '+' : '-'}
                            ${transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent transactions</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'operations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FundOperations
                userId={user.uid}
                userFunds={userFunds}
                onSuccess={refreshFunds}
              />
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Operation Guidelines</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-1">Deposits</h4>
                    <p className="text-sm text-green-700">
                      Add funds to your cash or sendable balance. Cash funds can be withdrawn later.
                    </p>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-1">Withdrawals</h4>
                    <p className="text-sm text-red-700">
                      Only cash funds can be withdrawn. Daily limit: $1,000.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-1">Transfers</h4>
                    <p className="text-sm text-blue-700">
                      Send cash or sendable funds to other users. Promo funds cannot be transferred.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <FundTransactionsList
              userId={user.uid}
              limit={50}
            />
          )}
        </div>
      </div>
    </div>
  );
}