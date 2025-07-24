import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Bell, 
  TrendingUp,
  LogOut,
  Menu,
  X,
  Trophy,
  Home,
  Settings,
  Receipt,
  ChevronRight,
  Crown,
  Sun,
  Moon,
  Activity
} from 'lucide-react';

const AdminLayout = ({ children, activeTab = 'transactions' }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('adminTheme') === 'dark';
  });

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home, color: 'text-purple-600', route: '/admin/dashboard' },
    { id: 'funds', label: 'Total Funds', icon: DollarSign, color: 'text-green-600', route: '/admin/dashboard' },
    { id: 'users', label: 'User List', icon: Users, color: 'text-blue-600', route: '/admin/dashboard' },
    { id: 'leagues', label: 'Leagues', icon: Trophy, color: 'text-yellow-600', route: '/admin/leagues' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, color: 'text-cyan-600', route: '/admin/transactions' },
    { id: 'api-status', label: 'API Status', icon: Activity, color: 'text-emerald-600', route: '/admin/api-status' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-orange-600', route: '/admin/notifications' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'text-pink-600', route: '/admin/dashboard' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600', route: '/admin/dashboard' }
  ];

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('adminTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('adminTheme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bankroll_admin_auth');
    localStorage.removeItem('bankroll_admin_expiry');
    navigate('/');
  };

  const handleNavigation = (item) => {
    if (item.route === '/admin/dashboard') {
      // For dashboard items, navigate to dashboard with the tab
      navigate(`/admin/dashboard?tab=${item.id}`);
    } else {
      // For separate pages, navigate directly
      navigate(item.route);
    }
  };

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
            {sidebarItems.map(({ id, label, icon: Icon, color, route }) => (
              <button
                key={id}
                onClick={() => handleNavigation({ id, route })}
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {sidebarOpen && <span className="font-medium">Toggle Theme</span>}
            </button>
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
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;