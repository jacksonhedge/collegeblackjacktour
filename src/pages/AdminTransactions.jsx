import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase/client';
import { format } from 'date-fns';
import AdminLayout from '../components/admin/AdminLayout';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
  Users,
  Calendar,
  ChevronDown,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTransactions = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalVolume: 0,
    totalCount: 0,
    avgTransaction: 0,
    todayVolume: 0,
    todayCount: 0,
    pendingCount: 0
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  
  // Selected transaction
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadAllTransactions();
    
    // Auto-reload every 20 seconds
    const interval = setInterval(() => {
      loadAllTransactions();
    }, 20000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, typeFilter, statusFilter, dateRange, sortBy, sortOrder]);

  const loadAllTransactions = async () => {
    try {
      setLoading(true);
      
      // Load all transaction types in parallel
      const [
        fundTransactions,
        p2pTransfers,
        achTransfers,
        bankTransactions,
        walletTransactions
      ] = await Promise.all([
        // Fund transactions (deposits/withdrawals)
        supabase
          .from('fund_transactions')
          .select(`
            *,
            user:profiles(id, username, email)
          `)
          .order('created_at', { ascending: false })
          .limit(1000),
        
        // P2P transfers
        supabase
          .from('p2p_transfers')
          .select(`
            *,
            sender:profiles!p2p_transfers_sender_id_fkey(id, username, email),
            receiver:profiles!p2p_transfers_receiver_id_fkey(id, username, email)
          `)
          .order('created_at', { ascending: false })
          .limit(1000),
        
        // ACH transfers
        supabase
          .from('ach_transfers')
          .select(`
            *,
            user:profiles(id, username, email),
            bank_account:bank_accounts(*)
          `)
          .order('created_at', { ascending: false })
          .limit(1000),
        
        // Bank transactions (from connected accounts)
        supabase
          .from('bank_transactions')
          .select(`
            *,
            account:bank_accounts(*, user:profiles(id, username, email))
          `)
          .order('transaction_date', { ascending: false })
          .limit(1000),
        
        // Wallet transactions
        supabase
          .from('transactions')
          .select(`
            *,
            user:profiles(id, username, email)
          `)
          .order('created_at', { ascending: false })
          .limit(1000)
      ]);

      // Normalize all transactions into a unified format
      const normalizedTransactions = [];

      // Process fund transactions
      if (fundTransactions.data) {
        fundTransactions.data.forEach(tx => {
          normalizedTransactions.push({
            id: tx.id,
            type: tx.type || 'fund_transaction',
            category: tx.fund_type,
            amount: tx.amount,
            status: tx.status,
            user: tx.user,
            description: tx.description || `${tx.fund_type} ${tx.type}`,
            created_at: tx.created_at,
            metadata: tx.metadata,
            source: 'fund_transactions'
          });
        });
      }

      // Process P2P transfers
      if (p2pTransfers.data) {
        p2pTransfers.data.forEach(tx => {
          normalizedTransactions.push({
            id: tx.id,
            type: 'p2p_transfer',
            category: tx.type,
            amount: tx.amount,
            status: tx.status,
            user: tx.sender,
            receiver: tx.receiver,
            description: tx.description || 'P2P Transfer',
            created_at: tx.created_at,
            metadata: tx.metadata,
            risk_score: tx.risk_score,
            source: 'p2p_transfers'
          });
        });
      }

      // Process ACH transfers
      if (achTransfers.data) {
        achTransfers.data.forEach(tx => {
          normalizedTransactions.push({
            id: tx.id,
            type: 'ach_transfer',
            category: 'bank_transfer',
            amount: tx.amount,
            status: tx.status,
            user: tx.user,
            bank_account: tx.bank_account,
            description: tx.description || 'ACH Transfer',
            created_at: tx.created_at,
            completed_at: tx.completed_at,
            metadata: tx.metadata,
            source: 'ach_transfers'
          });
        });
      }

      // Process bank transactions
      if (bankTransactions.data) {
        bankTransactions.data.forEach(tx => {
          normalizedTransactions.push({
            id: tx.id,
            type: 'bank_transaction',
            category: tx.category || 'uncategorized',
            amount: tx.amount,
            status: 'completed',
            user: tx.account?.user,
            description: tx.description || tx.merchant_name || 'Bank Transaction',
            created_at: tx.transaction_date,
            metadata: {
              merchant: tx.merchant_name,
              pending: tx.pending,
              account_id: tx.account_id
            },
            source: 'bank_transactions'
          });
        });
      }

      // Process wallet transactions
      if (walletTransactions.data) {
        walletTransactions.data.forEach(tx => {
          normalizedTransactions.push({
            id: tx.id,
            type: tx.type || 'wallet_transaction',
            category: tx.category || 'wallet',
            amount: tx.amount,
            status: 'completed',
            user: tx.user,
            description: tx.description || 'Wallet Transaction',
            created_at: tx.created_at,
            balance_after: tx.balance_after,
            metadata: tx.metadata,
            source: 'transactions'
          });
        });
      }

      // Sort by date
      normalizedTransactions.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setTransactions(normalizedTransactions);
      calculateStats(normalizedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (txList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = txList.reduce((acc, tx) => {
      const amount = Math.abs(tx.amount || 0);
      const txDate = new Date(tx.created_at);
      
      acc.totalVolume += amount;
      acc.totalCount += 1;
      
      if (txDate >= today) {
        acc.todayVolume += amount;
        acc.todayCount += 1;
      }
      
      if (tx.status === 'pending' || tx.status === 'processing') {
        acc.pendingCount += 1;
      }
      
      return acc;
    }, {
      totalVolume: 0,
      totalCount: 0,
      todayVolume: 0,
      todayCount: 0,
      pendingCount: 0
    });

    stats.avgTransaction = stats.totalCount > 0 ? stats.totalVolume / stats.totalCount : 0;
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.id?.toLowerCase().includes(query) ||
        tx.description?.toLowerCase().includes(query) ||
        tx.user?.username?.toLowerCase().includes(query) ||
        tx.user?.email?.toLowerCase().includes(query) ||
        tx.receiver?.username?.toLowerCase().includes(query) ||
        tx.receiver?.email?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(tx => new Date(tx.created_at) >= startDate);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'amount') {
        aVal = Math.abs(aVal || 0);
        bVal = Math.abs(bVal || 0);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'p2p_transfer':
        return <Send className="w-4 h-4" />;
      case 'ach_transfer':
        return <Building2 className="w-4 h-4" />;
      case 'bank_transaction':
        return <CreditCard className="w-4 h-4" />;
      case 'deposit':
        return <ArrowDownRight className="w-4 h-4" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
      pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
      processing: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      failed: { icon: X, color: 'text-red-500', bg: 'bg-red-500/10' },
      cancelled: { icon: X, color: 'text-gray-500', bg: 'bg-gray-500/10' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const exportTransactions = () => {
    const csv = [
      ['ID', 'Date', 'Type', 'Status', 'Amount', 'User', 'Description', 'Source'].join(','),
      ...filteredTransactions.map(tx => [
        tx.id,
        format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm:ss'),
        tx.type,
        tx.status,
        tx.amount,
        tx.user?.email || '',
        `"${tx.description || ''}"`,
        tx.source
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    
    toast.success('Transactions exported successfully');
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  return (
    <AdminLayout activeTab="transactions">
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Transaction Management
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              View and manage all platform transactions • Auto-refreshes every 20 seconds
            </p>
          </div>
          <button
            onClick={loadAllTransactions}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <DollarSign className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Volume</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${stats.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <Users className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                {stats.totalCount}
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Transactions</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${stats.avgTransaction.toFixed(2)}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Avg. Transaction</p>
          </div>

          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <Calendar className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.todayCount} txns
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Today's Volume</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${stats.todayVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <Clock className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              {stats.pendingCount > 0 && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
              )}
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.pendingCount}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, user, email, or description..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="all">All Types</option>
              <option value="p2p_transfer">P2P Transfer</option>
              <option value="ach_transfer">ACH Transfer</option>
              <option value="bank_transaction">Bank Transaction</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="fund_transaction">Fund Transaction</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>

            {/* Actions */}
            <button
              onClick={loadAllTransactions}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={exportTransactions}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Transaction
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    User
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Amount
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No transactions found
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((tx) => (
                    <tr key={tx.id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isDark ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {tx.description}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {tx.id.slice(0, 8)}... • {tx.type}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {tx.user?.username || 'Unknown'}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {tx.user?.email}
                          </p>
                          {tx.receiver && (
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              → {tx.receiver.username}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm font-medium ${
                          tx.amount >= 0 
                            ? isDark ? 'text-green-400' : 'text-green-600'
                            : isDark ? 'text-red-400' : 'text-red-600'
                        }`}>
                          ${Math.abs(tx.amount).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(tx.status || 'completed')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {format(new Date(tx.created_at), 'MMM d, yyyy')}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {format(new Date(tx.created_at), 'h:mm a')}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTransaction(tx)}
                          className={`p-1 rounded transition-colors ${
                            isDark 
                              ? 'hover:bg-gray-700 text-gray-400' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'
                        : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedTransaction(null)}
            />
            <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl ${
              isDark ? 'bg-gray-900' : 'bg-white'
            }`}>
              <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Transaction Details
                  </h3>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-gray-800 text-gray-400' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Transaction ID</p>
                    <p className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTransaction.id}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Type</p>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTransaction.type}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Amount</p>
                    <p className={`text-xl font-bold ${
                      selectedTransaction.amount >= 0 
                        ? isDark ? 'text-green-400' : 'text-green-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      ${Math.abs(selectedTransaction.amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
                    {getStatusBadge(selectedTransaction.status || 'completed')}
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Created</p>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {format(new Date(selectedTransaction.created_at), 'PPpp')}
                    </p>
                  </div>
                  {selectedTransaction.completed_at && (
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {format(new Date(selectedTransaction.completed_at), 'PPpp')}
                      </p>
                    </div>
                  )}
                </div>

                {selectedTransaction.user && (
                  <div>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>User</p>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedTransaction.user.username}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedTransaction.user.email}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTransaction.receiver && (
                  <div>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Receiver</p>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedTransaction.receiver.username}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedTransaction.receiver.email}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTransaction.metadata && (
                  <div>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Metadata</p>
                    <pre className={`p-3 rounded-lg text-xs overflow-auto ${
                      isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {JSON.stringify(selectedTransaction.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminTransactions;