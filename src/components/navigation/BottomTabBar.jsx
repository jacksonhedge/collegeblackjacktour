import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Wallet,
  Trophy, 
  CreditCard, 
  Users,
  UserCircle,
  Handshake
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const BottomTabBar = ({ currentUser }) => {
  const location = useLocation();
  const { isDark } = useTheme();
  const [spinnerCount, setSpinnerCount] = useState(0);

  // Monitor spinner count for notification badge
  useEffect(() => {
    const checkSpinnerCount = () => {
      const count = parseInt(localStorage.getItem('spinnerCount') || '0');
      setSpinnerCount(count);
    };

    // Check immediately
    checkSpinnerCount();

    // Check periodically
    const interval = setInterval(checkSpinnerCount, 1000);

    // Listen for storage events
    window.addEventListener('storage', checkSpinnerCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkSpinnerCount);
    };
  }, []);

  const tabs = [
    { 
      name: 'Wallet', 
      path: '/wallet', 
      icon: Wallet,
      label: 'Wallet'
    },
    { 
      name: 'Rewards', 
      path: '/rewards', 
      icon: Trophy,
      label: 'Rewards',
      badge: spinnerCount > 0 ? spinnerCount : null
    },
    { 
      name: 'Groups', 
      path: '/groups', 
      icon: Users,
      label: 'Groups'
    },
    { 
      name: 'Partners', 
      path: '/partner-platforms', 
      icon: Handshake,
      label: 'Partners'
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: UserCircle,
      label: 'Profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 px-2 pb-safe z-50 md:hidden bg-black/50 backdrop-blur-md border-t border-white/10">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || 
            (location.pathname === '/' && tab.path === '/home');
          
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex flex-col items-center justify-center flex-1 h-full px-2 transition-all duration-200 ${
                isActive 
                  ? 'text-orange-400' 
                  : 'text-white/60'
              }`}
            >
              <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon 
                  className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} 
                />
                {/* Notification badge */}
                {tab.badge && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {tab.badge}
                  </div>
                )}
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${
                isActive 
                  ? 'text-purple-600' 
                  : isDark ? 'text-gray-400' : 'text-purple-700'
              }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;