import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../contexts/WalletContext';
import { useGroup } from '../contexts/GroupContext';
import { useLocation } from '../contexts/LocationContext';
import { 
  User,
  Wallet,
  CreditCard,
  TrendingUp,
  RefreshCw,
  FileText,
  Calculator,
  Clock,
  Settings,
  HelpCircle,
  Keyboard,
  LogOut,
  AlertCircle,
  Trophy,
  Camera,
  Shield,
  Bell,
  ChevronRight,
  Users,
  Award,
  DollarSign,
  MapPin
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const Profile = () => {
  const { currentUser, signOut } = useAuth();
  const { isDark } = useTheme();
  const { wallets } = useWallet();
  const { groups } = useGroup();
  const { userLocation } = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);

  // Calculate stats
  const totalBalance = wallets?.bankroll?.balance || 0;
  const totalGroups = groups?.length || 0;
  const memberSince = currentUser?.created_at ? new Date(currentUser.created_at).getFullYear() : new Date().getFullYear();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        // Here you would upload to storage and update user profile
      };
      reader.readAsDataURL(file);
    }
  };

  const quickActions = [
    {
      icon: DollarSign,
      label: 'Add Funds',
      color: 'bg-green-500',
      onClick: () => navigate('/wallet')
    },
    {
      icon: Users,
      label: 'My Groups',
      color: 'bg-blue-500',
      onClick: () => navigate('/groups')
    },
    {
      icon: Award,
      label: 'Rewards',
      color: 'bg-purple-500',
      onClick: () => navigate('/rewards')
    },
    {
      icon: Trophy,
      label: 'Fantasy',
      color: 'bg-orange-500',
      onClick: () => navigate('/fantasy-home')
    }
  ];

  const accountMenuItems = [
    {
      icon: User,
      label: 'Edit Profile',
      description: 'Update your personal information',
      onClick: () => navigate('/profile/settings')
    },
    {
      icon: Shield,
      label: 'Security',
      description: 'Password and authentication',
      onClick: () => navigate('/security')
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage your notification preferences',
      onClick: () => navigate('/notification-settings')
    },
    {
      icon: CreditCard,
      label: 'Payment Methods',
      description: 'Manage cards and bank accounts',
      onClick: () => navigate('/payment-methods')
    }
  ];

  const activityMenuItems = [
    {
      icon: Clock,
      label: 'Transaction History',
      description: 'View all your transactions',
      onClick: () => navigate('/history')
    },
    {
      icon: FileText,
      label: 'Reports & Statements',
      description: 'Download your account statements',
      onClick: () => navigate('/reports')
    },
    {
      icon: Calculator,
      label: 'Tax Center',
      description: 'Tax documents and information',
      onClick: () => navigate('/tax-center')
    }
  ];

  const supportMenuItems = [
    {
      icon: HelpCircle,
      label: 'Help Center',
      description: 'Get help and support',
      onClick: () => navigate('/help')
    },
    {
      icon: Keyboard,
      label: 'Keyboard Shortcuts',
      description: 'Learn keyboard shortcuts',
      onClick: () => navigate('/shortcuts')
    }
  ];

  const displayName = currentUser?.profile?.first_name && currentUser?.profile?.last_name
    ? `${currentUser.profile.first_name} ${currentUser.profile.last_name}`
    : currentUser?.profile?.username || currentUser?.email?.split('@')[0] || 'User';

  const email = currentUser?.email || '';

  return (
    <div className="min-h-screen p-4 md:p-6 transition-colors duration-200">
      {/* Profile Header Card */}
      <Card className={`mb-6 ${
        isDark 
          ? 'bg-gradient-to-br from-purple-900 to-purple-700 border-purple-600' 
          : 'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400'
      } text-white`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white/80" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition-colors">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-sm opacity-80">{email}</p>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-xs opacity-70">Member since {memberSince}</p>
                {userLocation?.state && (
                  <p className="text-xs opacity-70 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {userLocation.state}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
              <p className="text-xs opacity-80">Balance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalGroups}</p>
              <p className="text-xs opacity-80">Groups</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs opacity-80">Referrals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white p-3 rounded-lg flex flex-col items-center justify-center space-y-1 hover:opacity-90 transition-opacity`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Account Settings Section */}
      <div className="mb-6">
        <h2 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          ACCOUNT
        </h2>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-0">
            {accountMenuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between p-4 transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  } ${index !== accountMenuItems.length - 1 ? `border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}` : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Activity Section */}
      <div className="mb-6">
        <h2 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          ACTIVITY
        </h2>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-0">
            {activityMenuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between p-4 transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  } ${index !== activityMenuItems.length - 1 ? `border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}` : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Support Section */}
      <div className="mb-6">
        <h2 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          SUPPORT
        </h2>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-0">
            {supportMenuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between p-4 transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  } ${index !== supportMenuItems.length - 1 ? `border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}` : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Sportsbook Recovery Card */}
      <Card className={`mb-6 ${
        isDark 
          ? 'bg-gradient-to-br from-indigo-900 to-purple-700 border-indigo-600' 
          : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400'
      } text-white cursor-pointer hover:scale-[1.02] transition-transform`}
      onClick={() => navigate('/sportsbook-recovery')}>
        <CardContent className="p-5">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-8 h-8" />
            <div>
              <h3 className="font-semibold">Can't access your sportsbook?</h3>
              <p className="text-sm opacity-80">We can help you recover your account</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Out Button */}
      <button
        onClick={handleSignOut}
        className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
      >
        <LogOut className="w-5 h-5" />
        <span>Log Out</span>
      </button>

      {/* Version Info */}
      <div className={`text-center py-6 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Bankroll v1.0.0
      </div>
    </div>
  );
};

export default Profile;