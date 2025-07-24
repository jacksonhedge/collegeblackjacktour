import React, { useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Navigate, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Wallet,
  Trophy, 
  CreditCard, 
  Users,
  UserCircle,
  Handshake,
  Search,
  Plus
} from 'lucide-react';
import { useSleeperContext } from '../contexts/SleeperContext';
import NotificationCenter from '../components/notifications/NotificationCenter';
import NotificationPermissionBanner from '../components/notifications/NotificationPermissionBanner';
import BottomTabBar from '../components/navigation/BottomTabBar';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ReferralNudge from '../components/referral/ReferralNudge';
import AIChatWidget from '../components/chat/AIChatWidget';

const ProtectedLayout = () => {
  const { currentUser, loading, sessionChecked } = useAuth();
  const { leagues } = useSleeperContext();
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [spinnerCount, setSpinnerCount] = React.useState(0);
  const [showReferralNudge, setShowReferralNudge] = React.useState(false);
  // console.log("Current location:", location);

  // Show referral nudge occasionally (not on every page load)
  useEffect(() => {
    const lastShown = localStorage.getItem('lastReferralNudge');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Show if never shown before or if it's been more than 24 hours
    if (!lastShown || now - parseInt(lastShown) > oneDay) {
      // Show after a delay so it's not immediately in the user's face
      const timer = setTimeout(() => {
        setShowReferralNudge(true);
        localStorage.setItem('lastReferralNudge', now.toString());
      }, 10000); // Show after 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle hash-based URLs for backward compatibility during transition
  useEffect(() => {
    // If there's a hash in the URL like "#/home", convert it to a regular route
    if (location.hash && location.hash.startsWith('#/')) {
      const path = location.hash.substring(1); // remove the # character
      console.log(`Converting hash route "${location.hash}" to regular route "${path}"`);
      navigate(path, { replace: true });
    }
  }, [location.hash, navigate]);

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

    // Listen for storage events (changes from other tabs)
    window.addEventListener('storage', checkSpinnerCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkSpinnerCount);
    };
  }, []);

  const navigation = [
    { 
      name: 'Wallet', 
      path: '/wallet', 
      icon: Wallet
    },
    { 
      name: 'Groups', 
      path: '/groups', 
      icon: Users
    },
    { 
      name: 'Partners', 
      path: '/partner-platforms', 
      icon: Handshake
    },
    { 
      name: 'Rewards', 
      path: '/rewards', 
      icon: Trophy,
      badge: spinnerCount > 0 ? spinnerCount : null
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: UserCircle
    },
  ];

  // Show loading while auth is being checked
  if (loading || !sessionChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <img 
              src="/images/Bankroll Gradient.jpg" 
              alt="Bankroll" 
              className="h-20 w-auto mx-auto mb-4"
            />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-sm">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Only redirect after we know auth state
  if (!currentUser) {
    // Only redirect to login if not on the landing page
    if (location.pathname !== '/' && location.pathname !== '/home') {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-orange-800">
        <div className="absolute inset-0 bg-wavy-gradient opacity-40"></div>
      </div>
      
      {/* Animated blob shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-lava-1"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-lava-2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-lava-3"></div>
      </div>
      
      <div className="relative z-10">

      {/* Top Navigation - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block bg-black/50 backdrop-blur-md border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            {/* Left section - Logo and Search */}
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0 flex items-center mr-8">
                <img
                  src="/images/Bankroll Gradient.jpg"
                  alt="Bankroll"
                  className="h-10 w-auto"
                />
              </div>
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg text-sm transition-colors ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                      : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } border focus:outline-none focus:ring-1 focus:ring-purple-500`}
                />
              </div>
            </div>

            {/* Right section - Navigation */}
            <div className="flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path || 
                  (location.pathname === "/" && item.path === "/platforms");
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`
                      px-4 py-2 rounded-lg flex items-center space-x-2
                      transition-colors duration-200 text-sm font-medium relative
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'}
                      ${item.name === 'Profile' ? 'pl-2' : ''}
                    `}
                  >
                    <Icon className={item.name === 'Profile' ? '' : 'h-5 w-5'} />
                    <span className={item.name === 'Profile' ? 'ml-2' : ''}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Notification Center */}
              <NotificationCenter />
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <img
            src="/images/Bankroll Gradient.jpg"
            alt="Bankroll"
            className="h-8 w-auto"
          />
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </div>
      </div>

      {/* Notification Permission Banner */}
      <NotificationPermissionBanner />

      {/* Main Content Area - Add padding bottom for mobile tab bar */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Tab Bar - Only visible on mobile */}
      <BottomTabBar currentUser={currentUser} />
      
      {/* Referral Nudge - Shows occasionally */}
      {showReferralNudge && (
        <ReferralNudge 
          variant="floating" 
          onClose={() => setShowReferralNudge(false)} 
        />
      )}
      
      {/* AI Chat Widget */}
      <AIChatWidget />
      </div>
    </div>
  );
};

export default ProtectedLayout;
