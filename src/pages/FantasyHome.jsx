import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useSleeperContext } from '../contexts/SleeperContext';
import { useTheme } from '../contexts/ThemeContext';
// import SleeperLeagueView from '../components/sleeper/SleeperLeagueView';
import { SleeperService } from '../services/sleeper/SleeperService';
import { 
  Trophy,
  Users,
  ChevronRight,
  Link2,
  LogOut,
  Loader2,
  Calendar,
  TrendingUp
} from 'lucide-react';

const FantasyHome = () => {
  const { currentUser } = useAuth();
  const { user: sleeperUser, fetchUser, disconnectSleeper, isLoading, errorMessage } = useSleeperContext();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState({
    totalLeagues: 0,
    totalTeams: 0,
    currentSeason: '2024'
  });

  useEffect(() => {
    // Check if user needs to connect Sleeper account
    if (!sleeperUser && !isLoading) {
      setShowConnectModal(true);
    }
  }, [sleeperUser, isLoading]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (username.trim()) {
      await fetchUser(username);
      if (!errorMessage) {
        setShowConnectModal(false);
        setUsername('');
      }
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect your Sleeper account?')) {
      disconnectSleeper();
      setShowConnectModal(true);
    }
  };

  // Loading state
  if (isLoading && !sleeperUser) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading fantasy data...</p>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!sleeperUser || showConnectModal) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/profile')}
              className={`flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Profile
            </button>
          </div>

          {/* Connect Card */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 max-w-md mx-auto`}>
            <div className="text-center mb-6">
              <div className={`inline-flex p-4 rounded-full ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'} mb-4`}>
                <Trophy className="w-12 h-12 text-purple-600" />
              </div>
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Fantasy Home
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Connect your Sleeper account to view all your fantasy leagues and players
              </p>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sleeper Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your Sleeper username"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-600`}
                  required
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Connect Sleeper Account
                  </>
                )}
              </button>
            </form>

            <div className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have a Sleeper account?{' '}
              <a 
                href="https://sleeper.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700"
              >
                Sign up here
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Connected state - Show leagues and players
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile')}
                className={`flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back
              </button>
              <div className={`h-6 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Fantasy Home
              </h1>
            </div>

            {/* Connected User Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {sleeperUser.avatar && (
                  <img
                    src={SleeperService.getAvatarUrl(sleeperUser.avatar)}
                    alt={sleeperUser.username}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p className="font-medium">{sleeperUser.display_name}</p>
                  <p className="text-xs opacity-75">@{sleeperUser.username}</p>
                </div>
              </div>
              
              <button
                onClick={handleDisconnect}
                className={`p-2 rounded-lg ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
                title="Disconnect Sleeper account"
              >
                <LogOut className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Leagues</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalLeagues}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Teams</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalTeams}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current Season</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.currentSeason}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Main Content - League View */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* <SleeperLeagueView username={sleeperUser.username} /> */}
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>League view coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FantasyHome;