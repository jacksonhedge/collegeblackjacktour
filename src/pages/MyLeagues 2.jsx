import React, { useState } from 'react';
import { Link2, X, LogOut, Plus } from 'lucide-react';
import { useSleeperContext } from '../contexts/SleeperContext';
import SleeperLeaguesList from '../components/Leagues/SleeperLeaguesList';

const MyLeagues = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showSleeperModal, setShowSleeperModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const { user, fetchUser, isLoading, errorMessage, disconnectSleeper } = useSleeperContext();

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'sleeper', label: 'Sleeper' },
    { id: 'espn', label: 'ESPN' },
    { id: 'underdog', label: 'Underdog' }
  ];

  const handleSleeperSubmit = async (e) => {
    e.preventDefault();
    await fetchUser(usernameInput);
    if (!errorMessage) {
      setShowSleeperModal(false);
      setUsernameInput('');
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect your Sleeper account?')) {
      disconnectSleeper();
    }
  };

  const renderConnectedSleeperContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-purple-900/30 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          {user.avatar && (
            <img
              src={`https://sleepercdn.com/avatars/${user.avatar}`}
              alt={user.username}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <h3 className="text-white font-medium">Connected as: {user.username}</h3>
            <p className="text-sm text-gray-400">User ID: {user.user_id}</p>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 text-red-400 
            rounded-lg hover:bg-red-500/30 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </button>
      </div>
      <SleeperLeaguesList />
    </div>
  );

  const renderComingSoonContent = (platform) => (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="text-center space-y-4">
        <div className="p-4 rounded-full bg-purple-900/30 inline-block">
          <Link2 className="h-8 w-8 text-purple-400" />
        </div>
        <h3 className="text-xl font-medium text-white">Integration Coming Soon</h3>
        <p className="text-sm text-gray-400">
          Support for {platform} integration is coming soon
        </p>
      </div>

      <div className="w-full max-w-md text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-sm text-gray-400 bg-gray-900">or</span>
          </div>
        </div>

        <button 
          className="group px-6 py-3 bg-purple-900/50 text-white rounded-lg hover:bg-purple-900/70 
            transition-all duration-200 flex items-center justify-center space-x-2 w-full"
        >
          <Plus className="h-5 w-5" />
          <span>Add Your League Manually</span>
        </button>
        <p className="text-sm text-gray-400">
          Create your league and add leaguemates manually
        </p>
      </div>
    </div>
  );

  const renderTabContent = (tabId) => {
    if (tabId === 'all') {
      if (user) {
        return (
          <div className="space-y-6">
            {/* Show connected platforms */}
            {user && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Connected Platforms</h3>
                {renderConnectedSleeperContent()}
              </div>
            )}
          </div>
        );
      }
      return (
        <div className="text-center text-gray-400 py-12">
          Connect your fantasy platforms to view all your leagues in one place
        </div>
      );
    }

    if (tabId === 'sleeper') {
      if (user) {
        return renderConnectedSleeperContent();
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="p-4 rounded-full bg-purple-900/30">
            <Link2 className="h-8 w-8 text-purple-400" />
          </div>
          <button 
            onClick={() => setShowSleeperModal(true)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 
              transition-all duration-200 transform hover:scale-105 shadow-lg 
              hover:shadow-green-500/25"
          >
            Connect Sleeper Account
          </button>
          <p className="text-sm text-gray-400">
            Import all your Sleeper fantasy leagues
          </p>
        </div>
      );
    }

    return renderComingSoonContent(tabId.charAt(0).toUpperCase() + tabId.slice(1));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 border border-purple-500/20 rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-medium text-purple-100">
            My Leagues
          </h2>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-purple-900/50">
          <div className="flex space-x-1 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                  ${activeTab === tab.id 
                    ? 'bg-purple-900/50 text-white border-b-2 border-green-500' 
                    : 'text-gray-400 hover:text-white hover:bg-purple-900/30'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent(activeTab)}
        </div>
      </div>

      {/* Sleeper Username Modal */}
      {showSleeperModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-purple-900/90 p-8 rounded-2xl max-w-md w-full mx-4 relative border border-purple-700">
            <button
              onClick={() => setShowSleeperModal(false)}
              className="absolute top-4 right-4 text-purple-300 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4">Connect Sleeper Account</h2>
            <form onSubmit={handleSleeperSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Sleeper Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full px-4 py-2 bg-purple-800/50 border border-purple-600 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-purple-500 text-white 
                      placeholder-gray-400"
                    placeholder="Enter your Sleeper username"
                  />
                </div>
                {errorMessage && (
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 
                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connecting...' : 'Connect Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLeagues;
