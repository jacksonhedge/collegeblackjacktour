import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { useGroup } from '../contexts/GroupContext';
import AddFundsModal from '../components/modals/AddFundsModal';
import WithdrawFundsModal from '../components/modals/WithdrawFundsModal';
import GrowthFundsModal from '../components/modals/GrowthFundsModal';
import ReferralNudge from '../components/referral/ReferralNudge';
import ReferralShareBox from '../components/referral/ReferralShareBox';
import MiniGrowthChart from '../components/charts/MiniGrowthChart';
import PortfolioDashboard from '../components/dashboard/PortfolioDashboard';
import MechanicalStockTicker from '../components/ticker/MechanicalStockTicker';
import DailySpinner from '../components/banners/DailySpinner';
import SpinnerModal from '../components/modals/SpinnerModal';
import { Wallet as WalletIcon, TrendingUp, Plus, Minus, Zap, Package, Gift, Users } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
  const { currentUser } = useAuth();
  const { wallets } = useWallet();
  const { isDark } = useTheme();
  const { groups } = useGroup();
  const navigate = useNavigate();
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showGrowthFundsModal, setShowGrowthFundsModal] = useState(false);
  const [showReferralNudge, setShowReferralNudge] = useState(true);
  const [showSpinnerModal, setShowSpinnerModal] = useState(false);

  // Calculate total balance across all wallets
  const totalBalance = wallets?.bankroll?.balance || 0;
  const subWalletBalance = Object.values(wallets?.subWallets || {}).reduce(
    (sum, wallet) => sum + (wallet.balance || 0), 
    0
  );
  const combinedBalance = totalBalance + subWalletBalance;

  // Calculate group pooled funds (example: assuming each member has $100)
  const totalGroupMembers = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0);
  const pooledFunds = totalGroupMembers * 100; // $100 per member example

  // Set up global function to open spinner modal
  useEffect(() => {
    window.openDailySpinner = () => {
      setShowSpinnerModal(true);
    };

    return () => {
      delete window.openDailySpinner;
    };
  }, []);


  return (
    <div className="min-h-screen transition-colors duration-200">
      {/* Stock Ticker */}
      <MechanicalStockTicker />
      
      {/* Welcome Message */}
      <div className="px-4 md:px-6 pt-4">
        <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Welcome back, {currentUser?.profile?.first_name || 'User'}!
        </h1>
      </div>
      
      {/* Portfolio Dashboard - Stock View */}
      <PortfolioDashboard 
        onAddFunds={() => setShowAddFundsModal(true)} 
        onViewBundles={() => setShowGrowthFundsModal(true)}
      />
      
      {/* Wallet Content */}
      <div className="p-4 md:p-6">
        {/* Wallet Header with Referral Box */}
        <div className="mb-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Wallet Overview
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-white' : 'text-gray-600'}`}>
              Manage your funds and track your portfolio
            </p>
          </div>
          
          {/* Referral Box - Top Right */}
          <div className="w-full md:w-auto md:min-w-[300px]">
            <ReferralShareBox />
          </div>
        </div>

      {/* Optional: Keep the banner nudge but hidden by default */}
      {false && showReferralNudge && (
        <ReferralNudge 
          variant="banner" 
          onClose={() => setShowReferralNudge(false)} 
        />
      )}

      {/* FanDuel Match Banner */}
      <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'} border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'}`}>
              NEW
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-semibold">Add From FanDuel</span> - Get 1% match on withdrawals
            </p>
          </div>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Coming Soon
          </span>
        </div>
      </div>

      {/* Wallet Overview - Total Balance and Growth Funds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Total Balance */}
        <Card className={`${
          isDark 
            ? 'bg-gradient-to-br from-purple-900 to-purple-700 border-purple-600' 
            : 'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400'
        } text-white`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <WalletIcon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-300" />
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">Total Balance</p>
              <p className="text-2xl font-bold">${combinedBalance.toFixed(2)}</p>
              <p className="text-xs mt-1 opacity-70">+12.5% from last week</p>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowAddFundsModal(true)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
              {combinedBalance > 0 && (
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                >
                  <Minus className="w-3 h-3" />
                  Withdraw
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Growth Funds */}
        <Card className={`${
          isDark 
            ? 'bg-gradient-to-br from-green-900 to-green-700 border-green-600' 
            : 'bg-gradient-to-br from-green-500 to-green-600 border-green-400'
        } text-white`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-yellow-300" />
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">Total Growth Funds</p>
              <p className="text-2xl font-bold">$0.00</p>
              <p className="text-xs mt-1 opacity-70">Earn up to 8.1% APY</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Daily Spinner Card */}
      <div className="mb-8">
        <DailySpinner onClick={() => setShowSpinnerModal(true)} />
      </div>

      {/* Referral Program Card */}
      <Card className={`mb-8 ${
        isDark 
          ? 'bg-gradient-to-br from-amber-900 to-orange-700 border-amber-600' 
          : 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400'
      } text-white cursor-pointer hover:scale-[1.02] transition-transform`}
      onClick={() => navigate('/referrals')}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Referral Program</h3>
                <p className="text-sm opacity-80">Earn a $20 Free Sports Bet for each friend you invite</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">$20</p>
              <p className="text-xs opacity-70">free bet per referral</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups Card */}
      <Card className={`mb-8 ${
        isDark 
          ? 'bg-gradient-to-br from-blue-900 to-indigo-700 border-blue-600' 
          : 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400'
      } text-white cursor-pointer hover:scale-[1.02] transition-transform`}
      onClick={() => navigate('/groups')}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Groups</h3>
                <p className="text-sm opacity-80">Pool funds with your group members</p>
                <p className="text-xs opacity-70 mt-1">
                  {totalGroupMembers} members across {groups.length} groups
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold">${pooledFunds.toLocaleString()}</p>
                <p className="text-xs opacity-70">pooled funds</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <MiniGrowthChart />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Funds Modal */}
      <AddFundsModal 
        isOpen={showAddFundsModal} 
        onClose={() => setShowAddFundsModal(false)} 
      />

      {/* Withdraw Funds Modal */}
      <WithdrawFundsModal 
        isOpen={showWithdrawModal} 
        onClose={() => setShowWithdrawModal(false)}
        currentBalance={combinedBalance}
      />

      {/* Growth Funds Modal */}
      <GrowthFundsModal
        isOpen={showGrowthFundsModal}
        onClose={() => setShowGrowthFundsModal(false)}
      />

      {/* Spinner Modal */}
      <SpinnerModal
        isOpen={showSpinnerModal}
        onClose={() => setShowSpinnerModal(false)}
      />
      </div>
    </div>
  );
};

export default Wallet;