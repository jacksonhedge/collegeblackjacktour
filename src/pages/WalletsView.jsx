import React, { useState } from 'react';
import { CheckCircle, Plus, LayoutGrid, List, Gift, Loader2, Users, TrendingUp, ArrowRight, Settings, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConnectWalletModal from '../components/wallets/ConnectWalletModal';
import WalletDetailsModal from '../components/wallets/WalletDetailsModal';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { mockWalletGroups } from '../data/mockGroups';

// Card component inline definition
const Card = ({ className = '', children, onClick, ...props }) => (
  <div
    className={`rounded-lg shadow-sm overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
);

const WalletsView = () => {
  console.log('WalletsView rendering'); // Debug log

  const [viewMode, setViewMode] = useState('list');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { wallets } = useWallet();
  const { currentUser } = useAuth();

  console.log('WalletsView - currentUser:', currentUser); // Debug log
  console.log('WalletsView - wallets:', wallets); // Debug log

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance || 0); // Use 0 if balance is undefined or NaN
  };

  const handleWalletClick = (wallet) => {
    setSelectedWallet(wallet);
    setShowDetailsModal(wallet.connected);
  };

  // Calculate total balance across all connected wallets
  const calculateTotalBalance = () => {
    const bankrollBalance = wallets.bankroll?.balance || 0;
    const subWalletsTotal = Object.values(wallets.subWallets || {})
      .filter(wallet => wallet.connected)
      .reduce((sum, wallet) => sum + (wallet.cashBalance || 0), 0);
    return bankrollBalance + subWalletsTotal;
  };

  // Mock growth funds data (in real app, this would come from API)
  const growthFundsData = {
    total: 12500,
    monthlyGrowth: 15.2,
    weeklyGrowth: 3.8,
    invested: 10000
  };

  // Early return if no user or wallets
  if (!currentUser || !wallets) {
    console.log('WalletsView - No user or wallets, returning loading state'); // Debug log
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const TreeView = () => {
    console.log('TreeView rendering'); // Debug log
    return (
      <div className="relative min-h-[800px] flex flex-col items-center bg-white dark:bg-gray-900 p-6 rounded-lg">
        {/* Tree view implementation remains the same */}
      </div>
    );
  };

  const ListView = () => {
    console.log('ListView rendering'); // Debug log
    // Convert subWallets record to array and ensure balance is initialized to 0
    const subWalletsArray = Object.entries(wallets.subWallets).map(([platformId, wallet]) => ({
      platformId,
      name: wallet.name,
      logo: wallet.logo,
      balance: wallet.cashBalance || 0, // Initialize to 0 if undefined
      connected: wallet.connected || false,
      created: wallet.created || false,
      loading: wallet.loading
    }));

    return (
      <div className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-lg">
        {/* Total Balance and Growth Funds Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Total Balance Box */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-blue-100">Total Balance</h3>
                <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors">
                  <Gift className="w-4 h-4 mr-1" />
                  Bonus
                </button>
              </div>
              <p className="text-3xl font-bold mb-2">
                {formatBalance(calculateTotalBalance())}
              </p>
              <p className="text-sm text-blue-100">Available for withdrawal</p>
            </div>
          </Card>

          {/* Transfer Arrow - Mobile */}
          <div className="flex lg:hidden justify-center -my-3">
            <div className="bg-purple-600 text-white rounded-full p-3">
              <ArrowRight className="w-6 h-6 rotate-90" />
            </div>
          </div>

          {/* Total Growth Funds Box */}
          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-green-100">Total Growth Funds</h3>
                <TrendingUp className="w-5 h-5 text-green-200" />
              </div>
              <p className="text-3xl font-bold mb-2">
                {formatBalance(growthFundsData.total)}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-green-100">+{growthFundsData.monthlyGrowth}% this month</p>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
            </div>
          </Card>
        </div>

        {/* Transfer Arrow and Rules Button - Desktop */}
        <div className="hidden lg:block -mt-24 mb-8">
          <div className="flex justify-center items-center relative">
            <div className="absolute inset-x-0 top-1/2 flex items-center px-8">
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
              <div className="mx-4 bg-purple-600 text-white rounded-full p-3 shadow-lg">
                <ArrowRight className="w-6 h-6" />
              </div>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
          <div className="flex justify-center mt-12">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
              <Settings className="w-5 h-5" />
              Automatic Transfer Rules
            </button>
          </div>
        </div>

        {/* Automatic Transfer Rules Button - Mobile */}
        <div className="lg:hidden mb-6">
          <button className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Settings className="w-5 h-5" />
            Automatic Transfer Rules
          </button>
        </div>

        {/* Sub-wallets List */}
        <div className="space-y-4">
          {subWalletsArray.map((wallet) => (
            <Card 
              key={wallet.platformId}
              onClick={() => !wallet.loading && handleWalletClick(wallet)}
              className={`bg-white dark:bg-gray-800 border ${
                wallet.connected ? 'border-green-500' : 'border-gray-200 dark:border-gray-700'
              } p-4 transform hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={wallet.logo}
                    alt={wallet.name}
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{wallet.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatBalance(wallet.balance)}
                    </p>
                  </div>
                </div>
                {wallet.loading ? (
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </div>
                ) : wallet.connected ? (
                  <div className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Connected
                  </div>
                ) : (
                  <div className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center">
                    <Gift className="w-5 h-5 mr-2" />
                    Configure Wallet
                  </div>
                )}
              </div>
            </Card>
          ))}

          {/* Add Platform Button */}
          <Link to="/spend">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-lg font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
                  Add Platform
                </p>
              </div>
            </Card>
          </Link>
        </div>
        
        {/* Groups Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Groups
            </h3>
            <Link 
              to="/groups" 
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockWalletGroups.map((group) => {
              const platformIcons = {
                sleeper: '/images/sleeperFantasy.png',
                espn: '/images/espnFantasy.png',
                yahoo: '/images/yahoofantasy.png',
                bankroll: '/images/BankrollLogoTransparent.png'
              };
              
              return (
                <Card 
                  key={group.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 hover:scale-[1.02] transition-all cursor-pointer"
                  onClick={() => {
                    // Navigate to group details
                    window.location.href = `/groups/${group.id}`;
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{group.emoji}</span>
                      {group.platform && platformIcons[group.platform] && (
                        <img 
                          src={platformIcons[group.platform]} 
                          alt={group.platform}
                          className="w-5 h-5 rounded"
                        />
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      group.type === 'fantasy' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {group.type === 'fantasy' ? 'Fantasy' : 'Friends'}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {group.name}
                  </h4>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Your share:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatBalance(group.yourContribution)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Total pooled:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatBalance(group.totalPooled)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {group.memberCount} members
                    </span>
                  </div>
                </Card>
              );
            })}
            
            {/* Create/Join Group Card */}
            <Link to="/groups/create">
              <Card className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 p-4 h-full flex flex-col items-center justify-center text-center hover:border-purple-500 dark:hover:border-purple-400 transition-all group cursor-pointer">
                <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mb-2" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Create or Join Group
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  console.log('WalletsView - Rendering view mode:', viewMode); // Debug log

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setViewMode('tree')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'tree'
              ? 'bg-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <LayoutGrid className="h-5 w-5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'list'
              ? 'bg-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <List className="h-5 w-5" />
        </button>
      </div>

      {/* View Content */}
      {viewMode === 'tree' ? <TreeView /> : <ListView />}

      {/* Connect/Details Modal */}
      {selectedWallet && (
        showDetailsModal ? (
          <WalletDetailsModal
            wallet={selectedWallet}
            onClose={() => {
              setSelectedWallet(null);
              setShowDetailsModal(false);
            }}
          />
        ) : (
          <ConnectWalletModal
            wallet={selectedWallet}
            onClose={() => setSelectedWallet(null)}
          />
        )
      )}
    </div>
  );
};

export default WalletsView;
