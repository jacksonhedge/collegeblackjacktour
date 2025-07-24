import React, { useState } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Wallet, ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Clock } from 'lucide-react';
import DwollaBalance from '../components/dwolla/DwollaBalance';
import DwollaSetupForm from '../components/dwolla/DwollaSetupForm';
import DepositScreen from '../components/dwolla/DepositScreen';
import RewardsAndChallenges from '../components/rewards/RewardsAndChallenges';

export default function BankingView() {
  const { currentUser } = useAuth();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [activeTab, setActiveTab] = useState('rewards'); // 'rewards' or 'activity'
  const pendingBalance = 150.00;
  const recentTransactions = [
    { id: 1, type: 'deposit', amount: 500, description: 'Deposit from Bank', date: '2024-03-15' },
    { id: 2, type: 'withdrawal', amount: -50, description: 'NFL Bet Placement', date: '2024-03-14' },
    { id: 3, type: 'winning', amount: 125, description: 'Bet Payout', date: '2024-03-13' },
  ];

  // If user hasn't set up Dwolla yet, show the setup form
  if (!currentUser?.dwollaCustomerId) {
    return (
      <div className="max-w-2xl mx-auto">
        <DwollaSetupForm />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Status Banner */}
      {currentUser?.dwollaVerificationStatus === 'pending' && (
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Verification In Progress</h3>
                <p className="text-sm text-gray-400">
                  Your account is being verified. This typically takes 1-2 business days.
                  You'll receive a notification once verified.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <DepositScreen onClose={() => setShowDepositModal(false)} />
          </div>
        </div>
      )}

      {/* Account Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dwolla Balance Widget */}
        <DwollaBalance />

        {/* Quick Actions */}
        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-purple-100">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowDepositModal(true)}
                disabled={currentUser?.dwollaVerificationStatus === 'pending'}
                className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownRight className="h-5 w-5" />
                <span>Deposit</span>
              </button>
              <button 
                disabled={currentUser?.dwollaVerificationStatus === 'pending'}
                className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUpRight className="h-5 w-5" />
                <span>Withdraw</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toggle Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`p-4 rounded-lg font-medium transition-colors ${
            activeTab === 'rewards'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-900/50 text-gray-300 hover:bg-gray-900/70'
          }`}
        >
          Rewards & Challenges
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`p-4 rounded-lg font-medium transition-colors ${
            activeTab === 'activity'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-900/50 text-gray-300 hover:bg-gray-900/70'
          }`}
        >
          Recent Activity
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'rewards' ? (
        <RewardsAndChallenges />
      ) : (
        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-purple-100">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map(transaction => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'deposit' ? 'bg-green-500/20 text-green-500' :
                      transaction.type === 'withdrawal' ? 'bg-red-500/20 text-red-500' :
                      'bg-purple-500/20 text-purple-500'
                    }`}>
                      {transaction.type === 'deposit' ? <ArrowDownRight className="h-5 w-5" /> :
                       transaction.type === 'withdrawal' ? <ArrowUpRight className="h-5 w-5" /> :
                       <TrendingUp className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{transaction.description}</p>
                      <p className="text-xs text-gray-400">{transaction.date}</p>
                    </div>
                  </div>
                  <div className={`font-medium ${
                    transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Winnings</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">$1,234.56</div>
            <p className="text-xs text-purple-200 mt-1">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Active Bets</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">5</div>
            <p className="text-xs text-purple-200 mt-1">Total value: $250.00</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">62%</div>
            <p className="text-xs text-purple-200 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Display Dwolla Customer ID for debugging */}
      <div className="text-xs text-gray-500">
        Dwolla ID: {currentUser.dwollaCustomerId}
      </div>
    </div>
  );
}
