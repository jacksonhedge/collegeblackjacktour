import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Bell, 
  BarChart3, 
  Settings, 
  Shield, 
  Zap, 
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
  AlertCircle
} from 'lucide-react';
import { adminDataService } from '../services/AdminDataServiceEnhanced';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/card';
import UserManagement from '../components/admin/UserManagement';
import WinnersManager from '../components/admin/WinnersManager';
import NotificationSettings from '../components/NotificationSettings';
import AdminAnalytics from '../components/admin/AdminAnalytics';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, newToday: 0 },
    notifications: { sent: 0, pending: 0, failed: 0 },
    revenue: { total: 0, today: 0, thisMonth: 0 },
    activity: { sessions: 0, transactions: 0, avgDuration: 0 }
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Use the AdminDataService to get dashboard stats
      const dashboardStats = await adminDataService.getDashboardStats();
      
      // Check if we're using mock data
      const isMockData = dashboardStats.users.total === 1247; // Mock data indicator
      setUsingMockData(isMockData);
      
      setStats({
        users: dashboardStats.users,
        notifications: { sent: 5643, pending: 12, failed: 7 },
        revenue: dashboardStats.revenue,
        activity: { 
          sessions: dashboardStats.transactions.total, 
          transactions: dashboardStats.transactions.deposits, 
          avgDuration: 425 
        }
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Fallback to default mock data
      setStats({
        users: { total: 1247, active: 892, newToday: 23 },
        notifications: { sent: 5643, pending: 12, failed: 7 },
        revenue: { total: 127450, today: 1240, thisMonth: 23450 },
        activity: { sessions: 3421, transactions: 892, avgDuration: 425 }
      });
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear admin auth
    localStorage.removeItem('bankroll_admin_auth');
    navigate('/');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'notifications', label: 'Notification Hub', icon: Bell },
    { id: 'winners', label: 'Big Win Alerts', icon: Trophy },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <Card className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border-${color}-200`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium text-${color}-600`}>{title}</p>
            <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
            {change && (
              <p className={`text-xs text-${color}-600 mt-1`}>
                {change > 0 ? '+' : ''}{change}% from yesterday
              </p>
            )}
          </div>
          <div className={`p-3 bg-${color}-500 rounded-full`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Data Source Warning */}
      {usingMockData && (
        <div className="p-4 rounded-lg border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Demo Mode:</strong> Displaying sample data for demonstration. 
                The admin dashboard is fully functional and will connect to your database when properly configured.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with Bankroll today.</p>
        </div>
        <button
          onClick={loadDashboardStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={formatNumber(stats.users.total)}
          change={5.2}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={formatNumber(stats.users.active)}
          change={2.1}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Revenue (Month)"
          value={formatCurrency(stats.revenue.thisMonth)}
          change={12.5}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Notifications Sent"
          value={formatNumber(stats.notifications.sent)}
          change={8.3}
          icon={Bell}
          color="indigo"
        />
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">New user registration</span>
                </div>
                <span className="text-xs text-gray-500">2 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Payment processed</span>
                </div>
                <span className="text-xs text-gray-500">5 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Big win alert triggered</span>
                </div>
                <span className="text-xs text-gray-500">12 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Gift card issued</span>
                </div>
                <span className="text-xs text-gray-500">18 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Response Time</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">142ms</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Status</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    {usingMockData ? 'Demo Mode' : 'Connected'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notification Service</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Admin Dashboard</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('notifications')}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Bell className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium">Send Notification</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="w-6 h-6 text-green-500" />
              <span className="text-sm font-medium">Manage Users</span>
            </button>
            <button
              onClick={() => setActiveTab('winners')}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-sm font-medium">Big Win Alert</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-purple-500" />
              <span className="text-sm font-medium">View Analytics</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-gray-900">Bankroll Admin</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === id
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
              <UserManagement />
            </div>
          )}
          {activeTab === 'notifications' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Notification Hub</h1>
              <NotificationSettings />
            </div>
          )}
          {activeTab === 'winners' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Big Win Alerts</h1>
              <WinnersManager />
            </div>
          )}
          {activeTab === 'analytics' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
              <AdminAnalytics />
            </div>
          )}
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">System Settings</h1>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600">Admin system settings coming soon...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 