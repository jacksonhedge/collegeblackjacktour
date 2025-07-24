import React, { useEffect, useState } from 'react';
import { useYahoo } from '../../contexts/YahooContext';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { CheckCircle, Trophy } from 'lucide-react';
import YahooLeagueDetailsModal from './YahooLeagueDetailsModal';

const YahooLeaguesList = () => {
  const { leagues, fetchLeagues, loading, error } = useYahoo();
  const { user } = useAuth();
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [convertedGroups, setConvertedGroups] = useState(new Set());

  useEffect(() => {
    if (user) {
      fetchLeagues();
    }
  }, [user]);

  const handleGroupCreated = (leagueId) => {
    setConvertedGroups(prev => new Set([...prev, leagueId]));
  };

  // Generate placeholder avatars for the league size
  const renderPlaceholderAvatars = (league) => {
    const colors = ['bg-indigo-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-cyan-500'];
    const displayCount = Math.min(league.leagueSize, 5);
    const avatars = Array.from({ length: displayCount }, (_, index) => (
      <div
        key={`${league.id}-avatar-${index}`}
        className={`inline-block h-8 w-8 rounded-full ring-2 ring-purple-900 ${colors[index % colors.length]} flex items-center justify-center`}
      >
        <span className="text-xs text-white font-bold">
          {String.fromCharCode(65 + index)}
        </span>
      </div>
    ));

    if (league.leagueSize > 5) {
      avatars.push(
        <div
          key={`${league.id}-avatar-more`}
          className="inline-block h-8 w-8 rounded-full bg-purple-700 ring-2 ring-purple-900 flex items-center justify-center"
        >
          <span className="text-xs text-white">
            +{league.leagueSize - 5}
          </span>
        </div>
      );
    }

    return (
      <div key={`${league.id}-avatars`} className="mt-2 flex -space-x-2 overflow-hidden">
        {avatars}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!leagues || leagues.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        No Yahoo leagues added yet.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {leagues.map((league) => (
          <div 
            key={league.id}
            className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-300 
              dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500/40 
              transition-all cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/40"
            onClick={() => setSelectedLeague(league)}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-purple-800 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {league.isCommissioner ? '👑 ' : ''}{league.name || 'League Details'}
                  </h3>
                  {convertedGroups.has(league.id) && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {league.leagueSize} participants • Season 2023
                </p>
                {renderPlaceholderAvatars(league)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedLeague && (
        <YahooLeagueDetailsModal 
          league={selectedLeague}
          onClose={() => setSelectedLeague(null)}
          onGroupCreated={() => handleGroupCreated(selectedLeague.id)}
        />
      )}
    </>
  );
};

export default YahooLeaguesList;
