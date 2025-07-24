import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Bell, 
  BarChart3, 
  Settings, 
  Shield, 
  TrendingUp,
  LogOut,
  Menu,
  X,
  Activity,
  Globe,
  MessageSquare,
  Mail,
  Smartphone,
  Trophy,
  UserCheck,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Crown,
  Gift,
  CreditCard,
  UserPlus,
  Home,
  Sun,
  Moon,
  Palette,
  Receipt
} from 'lucide-react';
import { adminDataService } from '../services/AdminDataServiceEnhanced';
import UserManagement from '../components/admin/UserManagement';
import WinnersManager from '../components/admin/WinnersManager';
import NotificationSettings from '../components/NotificationSettings';
import AdminAnalytics from '../components/admin/AdminAnalytics';

const AdminDashboardModern = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, newToday: 0, growth: 0 },
    notifications: { sent: 0, pending: 0, failed: 0, deliveryRate: 0 },
    revenue: { total: 0, today: 0, thisMonth: 0, growth: 0 },
    activity: { sessions: 0, transactions: 0, avgDuration: 0, peakHour: 0 }
  });

  useEffect(() => {
    loadDashboardStats();
    // Check for dark mode preference
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('adminTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('adminTheme', 'light');
    }
  };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      const dashboardStats = await adminDataService.getDashboardStats();
      
      // Check if dashboardStats is valid
      if (!dashboardStats || !dashboardStats.users) {
        throw new Error('Invalid dashboard stats received');
      }
      
      const isMockData = dashboardStats.users.total === 1247;
      setUsingMockData(isMockData);
      
      setStats({
        users: {
          ...dashboardStats.users,
          growth: 5.2
        },
        notifications: { 
          sent: 5643, 
          pending: 12, 
          failed: 7,
          deliveryRate: 98.7
        },
        revenue: {
          ...dashboardStats.revenue,
          growth: 12.5
        },
        activity: { 
          sessions: dashboardStats.transactions.total, 
          transactions: dashboardStats.transactions.deposits, 
          avgDuration: 425,
          peakHour: 19
        }
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setStats({
        users: { total: 1247, active: 892, newToday: 23, growth: 5.2 },
        notifications: { sent: 5643, pending: 12, failed: 7, deliveryRate: 98.7 },
        revenue: { total: 127450, today: 1240, thisMonth: 23450, growth: 12.5 },
        activity: { sessions: 3421, transactions: 892, avgDuration: 425, peakHour: 19 }
      });
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bankroll_admin_auth');
    navigate('/');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home, color: 'text-purple-600' },
    { id: 'funds', label: 'Total Funds', icon: DollarSign, color: 'text-green-600' },
    { id: 'users', label: 'User List', icon: Users, color: 'text-blue-600' },
    { id: 'leagues', label: 'Leagues', icon: Trophy, color: 'text-yellow-600' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, color: 'text-cyan-600' },
    { id: 'api-status', label: 'API Status', icon: Activity, color: 'text-emerald-600' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-orange-600' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'text-pink-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color, trend, subtitle }) => {
    const isPositive = change > 0;
    const gradients = {
      purple: 'from-purple-500 to-purple-700',
      blue: 'from-blue-500 to-blue-700',
      green: 'from-green-500 to-green-700',
      yellow: 'from-yellow-500 to-yellow-700',
      pink: 'from-pink-500 to-pink-700',
      indigo: 'from-indigo-500 to-indigo-700'
    };

    return (
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br opacity-5 dark:opacity-10" 
             style={{backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`}} />
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[color]} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ActivityItem = ({ icon: Icon, title, time, color }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <span className="font-medium text-gray-800 dark:text-gray-200">{title}</span>
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">{time}</span>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, label, color, onClick }) => (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity"
           style={{backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`}} />
      
      <div className="relative flex flex-col items-center gap-3">
        <div className={`p-4 rounded-2xl bg-${color}-100 dark:bg-${color}-900/30 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-8 h-8 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <span className="font-semibold text-gray-800 dark:text-gray-200">{label}</span>
      </div>
    </button>
  );

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome to Hedge, Inc command center
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={loadDashboardStats}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Mock Data Alert */}
      {usingMockData && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Demo Mode Active</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Displaying sample data. Connect your database to see real metrics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={formatNumber(stats.users.total)}
          change={stats.users.growth}
          icon={Users}
          color="purple"
          subtitle={`+${stats.users.newToday} today`}
        />
        <StatCard
          title="Active Users"
          value={formatNumber(stats.users.active)}
          change={2.1}
          icon={UserCheck}
          color="blue"
          subtitle="Last 7 days"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.revenue.thisMonth)}
          change={stats.revenue.growth}
          icon={DollarSign}
          color="green"
          subtitle={`${formatCurrency(stats.revenue.today)} today`}
        />
        <StatCard
          title="Notifications"
          value={formatNumber(stats.notifications.sent)}
          change={8.3}
          icon={Bell}
          color="indigo"
          subtitle={`${stats.notifications.deliveryRate}% delivered`}
        />
      </div>

      {/* Activity and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-600" />
              Recent Activity
            </h3>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            <ActivityItem icon={UserPlus} title="New user registration" time="2 min ago" color="green" />
            <ActivityItem icon={CreditCard} title="Payment processed" time="5 min ago" color="blue" />
            <ActivityItem icon={Trophy} title="Big win alert triggered" time="12 min ago" color="yellow" />
            <ActivityItem icon={Gift} title="Gift card issued" time="18 min ago" color="purple" />
            <ActivityItem icon={Bell} title="Campaign sent" time="25 min ago" color="indigo" />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-green-600" />
              System Health
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">All Systems Go</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700 dark:text-gray-300">API Response</span>
              </div>
              <span className="text-sm font-semibold text-green-600">142ms</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Database</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {usingMockData ? 'Demo Mode' : 'Connected'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Email Service</span>
              </div>
              <span className="text-sm font-semibold text-green-600">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-gray-700 dark:text-gray-300">SMS Gateway</span>
              </div>
              <span className="text-sm font-semibold text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            icon={DollarSign}
            label="View Funds"
            color="green"
            onClick={() => setActiveTab('funds')}
          />
          <QuickActionCard
            icon={Users}
            label="Manage Users"
            color="blue"
            onClick={() => setActiveTab('users')}
          />
          <QuickActionCard
            icon={Trophy}
            label="View Leagues"
            color="yellow"
            onClick={() => setActiveTab('leagues')}
          />
          <QuickActionCard
            icon={Receipt}
            label="Transactions"
            color="cyan"
            onClick={() => navigate('/admin/transactions')}
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white dark:bg-gray-800 shadow-2xl transition-all duration-300 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-6 bg-gradient-to-br from-purple-600 to-purple-700">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-lg">Hedge, Inc</span>
                    <p className="text-purple-200 text-xs">Admin Portal</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => {
                  if (id === 'transactions') {
                    navigate('/admin/transactions');
                  } else if (id === 'notifications') {
                    navigate('/admin/notifications');
                  } else if (id === 'api-status') {
                    navigate('/admin/api-status');
                  } else if (id === 'leagues') {
                    navigate('/admin/leagues');
                  } else {
                    setActiveTab(id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === id
                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === id ? color : ''}`} />
                {sidebarOpen && <span className="font-medium">{label}</span>}
                {sidebarOpen && activeTab === id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'funds' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  Total Funds Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Total funds tracking and management coming soon...</p>
              </div>
            )}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'analytics' && <AdminAnalytics />}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
                <p className="text-gray-600 dark:text-gray-400">Settings panel coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardModern;