import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Wallet, ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Clock, Building2, Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import DwollaBalance from '../components/dwolla/DwollaBalance';
import DwollaSetupForm from '../components/dwolla/DwollaSetupForm';
import DepositScreen from '../components/dwolla/DepositScreen';
import RewardsAndChallenges from '../components/rewards/RewardsAndChallenges';
import MeldBankConnect from '../components/banking/MeldBankConnect';

export default function BankingView() {
  const { currentUser } = useAuth();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showBankConnectModal, setShowBankConnectModal] = useState(false);
  const [activeTab, setActiveTab] = useState('rewards'); // 'rewards' or 'activity'
  const [connectedBanks, setConnectedBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const pendingBalance = 150.00;
  const recentTransactions = [
    { id: 1, type: 'deposit', amount: 500, description: 'Deposit from Bank', date: '2024-03-15' },
    { id: 2, type: 'withdrawal', amount: -50, description: 'NFL Bet Placement', date: '2024-03-14' },
    { id: 3, type: 'winning', amount: 125, description: 'Bet Payout', date: '2024-03-13' },
  ];

  const fetchConnectedBanks = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/meld/user/${currentUser.id}/connections`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setConnectedBanks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching connected banks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBankConnectSuccess = async (connectionData) => {
    console.log('Bank connected:', connectionData);
    setShowBankConnectModal(false);
    // Refresh connected banks list
    await fetchConnectedBanks();
  };

  useEffect(() => {
    fetchConnectedBanks();
  }, [currentUser]);

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

      {/* Bank Connect Modal */}
      {showBankConnectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <MeldBankConnect 
              onSuccess={(data) => {
                console.log('Bank connected:', data);
                setShowBankConnectModal(false);
                // Refresh bank accounts or show success message
              }}
              onClose={() => setShowBankConnectModal(false)} 
            />
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

      {/* Connected Banks Section */}
      <Card className="bg-gray-900/50 border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium text-purple-100">Connected Banks</CardTitle>
          <button 
            onClick={() => setShowBankConnectModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Bank</span>
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Placeholder for connected banks */}
            <div className="text-center py-8 text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No banks connected yet</p>
              <p className="text-xs mt-1">Connect your bank to easily fund your wallet</p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Connected Banks Section */}
      <Card className="bg-gray-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-purple-100">Connected Banks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : connectedBanks.length > 0 ? (
            <div className="space-y-3">
              {connectedBanks.map((connection) => (
                <div
                  key={connection.id}
                  className="p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-10 h-10 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-white">
                          {connection.institution_name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {connection.bank_accounts?.length || 0} accounts • Connected {new Date(connection.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {connection.status === 'connected' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : connection.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
                      )}
                    </div>
                  </div>
                  {connection.bank_accounts && connection.bank_accounts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {connection.bank_accounts.map((account) => (
                        <div
                          key={account.id}
                          className="flex justify-between text-sm p-2 rounded bg-gray-900/50"
                        >
                          <span className="text-gray-300">
                            {account.account_name} (•••• {account.account_number_last4})
                          </span>
                          <span className="font-medium text-white">
                            ${account.current_balance?.toLocaleString() || '0.00'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => setShowBankConnectModal(true)}
                className="w-full p-4 border-2 border-dashed rounded-lg hover:border-purple-600 transition-colors border-gray-700 text-center"
              >
                <Plus className="w-5 h-5 mx-auto text-gray-400" />
                <p className="text-sm mt-1 text-gray-400">
                  Add Another Bank
                </p>
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-lg border-2 border-dashed text-center border-gray-700">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-sm text-gray-400">
                No banks connected yet
              </p>
              <button
                onClick={() => setShowBankConnectModal(true)}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Add Bank
              </button>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Bank Connect Modal */}
      {showBankConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <MeldBankConnect
            onSuccess={handleBankConnectSuccess}
            onClose={() => setShowBankConnectModal(false)}
          />
        </div>
      )}
    </div>
  );
}
