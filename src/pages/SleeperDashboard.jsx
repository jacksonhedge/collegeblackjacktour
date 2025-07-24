import React, { useState, useEffect } from 'react';
import { useSleeperContext } from '../contexts/SleeperContext';
import SleeperLeagueView from '../components/sleeper/SleeperLeagueView';
import { TrophyIcon, ChartBarIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline';

const SleeperDashboard = () => {
  const { user, leagues, fetchUser, isLoading, errorMessage } = useSleeperContext();
  const [stats, setStats] = useState({
    totalLeagues: 0,
    totalTeams: 0,
    activeSeasons: []
  });

  useEffect(() => {
    if (leagues && leagues.length > 0) {
      const totalTeams = leagues.reduce((sum, league) => sum + (league.total_rosters || 0), 0);
      const seasons = [...new Set(leagues.map(l => l.season))].sort().reverse();
      
      setStats({
        totalLeagues: leagues.length,
        totalTeams,
        activeSeasons: seasons
      });
    }
  }, [leagues]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <TrophyIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Connect Your Sleeper Account</h2>
            <p className="text-gray-400 mb-8">View all your fantasy leagues and player rosters in one place</p>
            
            <div className="max-w-md mx-auto">
              <SleeperConnectForm onConnect={fetchUser} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Sleeper Fantasy Dashboard</h1>
              <p className="mt-2 text-gray-400">Manage all your fantasy football leagues</p>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-4">
              {user.avatar && (
                <img
                  src={`https://sleepercdn.com/avatars/${user.avatar}`}
                  alt={user.display_name}
                  className="w-12 h-12 rounded-full border-2 border-purple-600"
                />
              )}
              <div className="text-right">
                <p className="text-white font-medium">{user.display_name}</p>
                <p className="text-sm text-gray-400">@{user.username}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<TrophyIcon className="h-8 w-8" />}
            label="Total Leagues"
            value={stats.totalLeagues}
            color="purple"
          />
          <StatsCard
            icon={<UserGroupIcon className="h-8 w-8" />}
            label="Total Teams"
            value={stats.totalTeams}
            color="blue"
          />
          <StatsCard
            icon={<CalendarIcon className="h-8 w-8" />}
            label="Active Seasons"
            value={stats.activeSeasons.length}
            color="green"
          />
          <StatsCard
            icon={<ChartBarIcon className="h-8 w-8" />}
            label="Latest Season"
            value={stats.activeSeasons[0] || 'N/A'}
            color="yellow"
          />
        </div>

        {/* Main Content */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <SleeperLeagueView username={user.username} />
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    purple: 'from-purple-600 to-purple-700 border-purple-500',
    blue: 'from-blue-600 to-blue-700 border-blue-500',
    green: 'from-green-600 to-green-700 border-green-500',
    yellow: 'from-yellow-600 to-yellow-700 border-yellow-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-lg border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className="text-white/40">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Connect Form Component
const SleeperConnectForm = ({ onConnect }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoading(true);
    await onConnect(username);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
          Sleeper Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your Sleeper username"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Connecting...' : 'Connect Account'}
      </button>
    </form>
  );
};

export default SleeperDashboard;