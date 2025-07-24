import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Home,
  TrendingUp,
  Wallet,
  History,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User,
  CreditCard,
  Trophy,
  Users,
  BarChart3,
  FileText,
  Gift
} from 'lucide-react';

const LeftSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/dashboard',
      badge: null
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: TrendingUp,
      path: '/portfolio',
      badge: null
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: Wallet,
      path: '/wallet',
      badge: null
    },
    {
      id: 'bets',
      label: 'My Bets',
      icon: Trophy,
      path: '/bets',
      badge: '3' // Active bets
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: Users,
      path: '/groups',
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      badge: null
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      path: '/history',
      badge: null
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: Gift,
      path: '/rewards',
      badge: 'New'
    }
  ];

  const bottomMenuItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      path: '/help'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r`}>
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Bankroll
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex flex-col h-[calc(100%-4rem)]">
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    active
                      ? isDark 
                        ? 'bg-purple-900/20 text-purple-400' 
                        : 'bg-purple-50 text-purple-600'
                      : isDark
                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-purple-500' : ''}`} />
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      item.badge === 'New'
                        ? 'bg-green-500 text-white'
                        : isDark
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-2">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  active
                    ? isDark 
                      ? 'bg-purple-900/20 text-purple-400' 
                      : 'bg-purple-50 text-purple-600'
                    : isDark
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </button>
            );
          })}

          {/* User Profile Section */}
          {!isCollapsed && (
            <div className={`mt-4 p-3 rounded-lg ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    John Doe
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Gold Tier
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;