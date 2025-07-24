import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import AdminLayout from '../components/admin/AdminLayout';
import { supabase } from '../services/supabase/client';
import {
  Trophy,
  Users,
  DollarSign,
  Crown,
  TrendingUp,
  Award,
  Calendar,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Wallet,
  Gamepad2,
  Medal,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  CreditCard,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Star,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminLeagues = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState([]);
  const [expandedLeague, setExpandedLeague] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, inactive, fantasy
  const [stats, setStats] = useState({
    totalLeagues: 0,
    activeLeagues: 0,
    totalUsers: 0,
    totalFunds: 0,
    fantasyLeagues: 0
  });

  // Mock data for development
  const mockLeagues = [
    {
      id: '1',
      name: 'High Rollers Fantasy League',
      type: 'fantasy',
      platform: 'sleeper',
      status: 'active',
      created_at: new Date('2024-09-01'),
      member_count: 12,
      pot_size: 2400,
      entry_fee: 200,
      admin: { id: '1', username: 'commish_mike', email: 'mike@example.com' },
      settings: {
        max_members: 12,
        scoring_type: 'PPR',
        playoff_teams: 6,
        trade_deadline: '2024-11-15'
      },
      members: [
        { id: '1', username: 'commish_mike', role: 'admin', paid: true, balance: 200, wins: 8, losses: 2, rank: 1 },
        { id: '2', username: 'fantasy_guru', role: 'member', paid: true, balance: 200, wins: 7, losses: 3, rank: 2 },
        { id: '3', username: 'touchdown_king', role: 'member', paid: true, balance: 200, wins: 6, losses: 4, rank: 3 },
        { id: '4', username: 'gridiron_legend', role: 'member', paid: true, balance: 200, wins: 5, losses: 5, rank: 4 },
        { id: '5', username: 'rookie_sensation', role: 'member', paid: false, balance: 0, wins: 4, losses: 6, rank: 5 }
      ],
      transactions: [
        { id: '1', type: 'entry_fee', amount: 200, user: 'fantasy_guru', date: new Date('2024-09-02'), status: 'completed' },
        { id: '2', type: 'payout', amount: 1200, user: 'commish_mike', date: new Date('2024-01-15'), status: 'pending' },
        { id: '3', type: 'entry_fee', amount: 200, user: 'touchdown_king', date: new Date('2024-09-03'), status: 'completed' }
      ],
      winners: [
        { year: 2023, username: 'fantasy_guru', payout: 1200 },
        { year: 2022, username: 'commish_mike', payout: 1000 },
        { year: 2021, username: 'touchdown_king', payout: 800 }
      ]
    },
    {
      id: '2',
      name: 'Crypto Traders Group',
      type: 'investment',
      platform: 'custom',
      status: 'active',
      created_at: new Date('2024-10-01'),
      member_count: 25,
      pot_size: 50000,
      entry_fee: 2000,
      admin: { id: '6', username: 'crypto_master', email: 'crypto@example.com' },
      settings: {
        max_members: 50,
        min_investment: 1000,
        profit_share: '80/20',
        withdrawal_period: 'monthly'
      },
      members: [
        { id: '6', username: 'crypto_master', role: 'admin', paid: true, balance: 15000, profit: 3000 },
        { id: '7', username: 'btc_believer', role: 'member', paid: true, balance: 5000, profit: 1000 },
        { id: '8', username: 'eth_enthusiast', role: 'member', paid: true, balance: 3000, profit: 600 },
        { id: '9', username: 'defi_degen', role: 'member', paid: true, balance: 2000, profit: -200 }
      ],
      transactions: [
        { id: '4', type: 'deposit', amount: 5000, user: 'btc_believer', date: new Date('2024-10-05'), status: 'completed' },
        { id: '5', type: 'withdrawal', amount: 1000, user: 'eth_enthusiast', date: new Date('2024-11-01'), status: 'processing' },
        { id: '6', type: 'profit_share', amount: 3000, user: 'crypto_master', date: new Date('2024-11-15'), status: 'completed' }
      ]
    },
    {
      id: '3',
      name: 'March Madness Pool',
      type: 'tournament',
      platform: 'custom',
      status: 'completed',
      created_at: new Date('2024-03-01'),
      member_count: 64,
      pot_size: 6400,
      entry_fee: 100,
      admin: { id: '10', username: 'bracket_boss', email: 'brackets@example.com' },
      settings: {
        max_members: 100,
        scoring_system: 'standard',
        payout_structure: '60/30/10'
      },
      winners: [
        { place: 1, username: 'upset_picker', payout: 3840 },
        { place: 2, username: 'chalk_master', payout: 1920 },
        { place: 3, username: 'cinderella_story', payout: 640 }
      ]
    }
  ];

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      setLoading(true);
      
      // In production, this would load from your database
      // For now, using mock data
      setLeagues(mockLeagues);
      
      // Calculate stats
      const stats = {
        totalLeagues: mockLeagues.length,
        activeLeagues: mockLeagues.filter(l => l.status === 'active').length,
        totalUsers: mockLeagues.reduce((sum, l) => sum + l.member_count, 0),
        totalFunds: mockLeagues.reduce((sum, l) => sum + l.pot_size, 0),
        fantasyLeagues: mockLeagues.filter(l => l.type === 'fantasy').length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error loading leagues:', error);
      toast.error('Failed to load leagues');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeagues = leagues.filter(league => {
    const matchesSearch = league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         league.admin.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'active' && league.status === 'active') ||
                         (filterType === 'inactive' && league.status !== 'active') ||
                         (filterType === 'fantasy' && league.type === 'fantasy');
    
    return matchesSearch && matchesFilter;
  });

  const getLeagueIcon = (type) => {
    switch (type) {
      case 'fantasy':
        return Gamepad2;
      case 'investment':
        return TrendingUp;
      case 'tournament':
        return Trophy;
      default:
        return Users;
    }
  };

  const getLeagueColor = (type) => {
    switch (type) {
      case 'fantasy':
        return 'purple';
      case 'investment':
        return 'green';
      case 'tournament':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return isDark ? 'text-green-400' : 'text-green-600';
      case 'completed':
        return isDark ? 'text-gray-400' : 'text-gray-600';
      case 'pending':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const LeagueCard = ({ league }) => {
    const isExpanded = expandedLeague === league.id;
    const Icon = getLeagueIcon(league.type);
    const color = getLeagueColor(league.type);

    return (
      <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm overflow-hidden`}>
        {/* League Header */}
        <div
          onClick={() => setExpandedLeague(isExpanded ? null : league.id)}
          className={`p-6 cursor-pointer transition-colors ${
            isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900/30`}>
                <Icon className={`w-8 h-8 text-${color}-600 dark:text-${color}-400`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {league.name}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-sm capitalize ${getStatusColor(league.status)}`}>
                    {league.status}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {league.member_count} members
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatCurrency(league.pot_size)} pot
                  </span>
                </div>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Admin: {league.admin.username} • Created {format(league.created_at, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLeague(league);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Stats Bar */}
            <div className={`grid grid-cols-4 gap-4 p-4 ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <div className="text-center">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {league.member_count}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Members
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(league.pot_size)}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Pot
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(league.entry_fee)}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Entry Fee
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${
                  league.members?.filter(m => m.paid).length === league.member_count
                    ? isDark ? 'text-green-400' : 'text-green-600'
                    : isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  {league.members?.filter(m => m.paid).length || 0}/{league.member_count}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Paid Members
                </p>
              </div>
            </div>

            {/* Members Section */}
            {league.members && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    League Members
                  </h4>
                  <button className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {league.members.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isDark ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          member.role === 'admin'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          {member.role === 'admin' ? (
                            <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {member.username}
                            {member.rank && ` • Rank #${member.rank}`}
                          </p>
                          {league.type === 'fantasy' && member.wins !== undefined && (
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {member.wins}W - {member.losses}L
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {member.paid ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(member.balance || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions Section */}
            {league.transactions && league.transactions.length > 0 && (
              <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Recent Transactions
                  </h4>
                  <button className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {league.transactions.slice(0, 3).map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isDark ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'entry_fee' || transaction.type === 'deposit'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {transaction.type === 'entry_fee' || transaction.type === 'deposit' ? (
                            <ArrowDownRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {transaction.user}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {transaction.type.replace('_', ' ').charAt(0).toUpperCase() + 
                             transaction.type.replace('_', ' ').slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'entry_fee' || transaction.type === 'deposit'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'entry_fee' || transaction.type === 'deposit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {format(transaction.date, 'MMM d')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Winners Section for Fantasy Leagues */}
            {league.type === 'fantasy' && league.winners && league.winners.length > 0 && (
              <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Past Champions
                </h4>
                <div className="space-y-2">
                  {league.winners.map((winner, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isDark ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {winner.username}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {winner.year} Champion
                          </p>
                        </div>
                      </div>
                      <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        {formatCurrency(winner.payout)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex gap-3 p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                <UserPlus className="w-4 h-4" />
                Add Member
              </button>
              <button className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                <Send className="w-4 h-4" />
                Send Funds
              </button>
              <button className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}>
                <Edit className="w-4 h-4" />
                Manage League
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout activeTab="leagues">
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                League Management
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage groups, fantasy leagues, and member funds
              </p>
            </div>
            <button
              onClick={loadLeagues}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <Trophy className={`w-8 h-8 text-purple-600 dark:text-purple-400`} />
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'
                }`}>
                  Total
                </span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalLeagues}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Leagues
              </p>
            </div>

            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <Activity className={`w-8 h-8 text-green-600 dark:text-green-400`} />
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
                }`}>
                  Active
                </span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.activeLeagues}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Now
              </p>
            </div>

            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <Users className={`w-8 h-8 text-blue-600 dark:text-blue-400`} />
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalUsers}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Members
              </p>
            </div>

            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <DollarSign className={`w-8 h-8 text-green-600 dark:text-green-400`} />
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(stats.totalFunds)}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Funds
              </p>
            </div>

            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <Gamepad2 className={`w-8 h-8 text-purple-600 dark:text-purple-400`} />
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.fantasyLeagues}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Fantasy Leagues
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search leagues, admins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  isDark 
                    ? 'bg-gray-800 text-white placeholder-gray-400' 
                    : 'bg-white text-gray-900 placeholder-gray-500'
                } border ${
                  isDark ? 'border-gray-700' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'active', 'inactive', 'fantasy'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    filterType === type
                      ? 'bg-purple-600 text-white'
                      : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}>
              <Plus className="w-4 h-4" />
              Create League
            </button>
          </div>

          {/* Leagues List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeagues.map((league) => (
                <LeagueCard key={league.id} league={league} />
              ))}
              
              {filteredLeagues.length === 0 && (
                <div className={`text-center py-12 rounded-xl ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <Trophy className={`w-12 h-12 mx-auto mb-4 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-lg font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No leagues found
                  </p>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLeagues;