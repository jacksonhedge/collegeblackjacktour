import React, { useState, useEffect } from 'react';
import { SleeperService } from '../../services/sleeper/SleeperService';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SleeperLeagueRosters = ({ leagueId, season = '2024' }) => {
  const [rosters, setRosters] = useState([]);
  const [users, setUsers] = useState([]);
  const [players, setPlayers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRosters, setExpandedRosters] = useState({});
  const [leagueDetails, setLeagueDetails] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchLeagueData();
  }, [leagueId, season]);

  const fetchLeagueData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [leagueData, rostersData, usersData, playersData] = await Promise.all([
        SleeperService.getLeagueDetails(leagueId),
        SleeperService.getLeagueRosters(leagueId),
        SleeperService.getLeagueUsers(leagueId),
        SleeperService.getNFLPlayers()
      ]);

      setLeagueDetails(leagueData);
      setRosters(rostersData);
      setUsers(usersData);
      setPlayers(playersData);
    } catch (err) {
      console.error('Error fetching league data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserForRoster = (rosterId) => {
    const roster = rosters.find(r => r.roster_id === rosterId);
    if (!roster) return null;
    return users.find(u => u.user_id === roster.owner_id);
  };

  const getPlayerInfo = (playerId) => {
    return players[playerId] || null;
  };

  const getPositionOrder = (position) => {
    const order = { 'QB': 1, 'RB': 2, 'WR': 3, 'TE': 4, 'K': 5, 'DEF': 6 };
    return order[position] || 7;
  };

  const formatPlayerDisplay = (player) => {
    if (!player) return 'Unknown Player';
    
    const team = player.team || 'FA';
    const position = player.position || 'N/A';
    const displayName = `${player.first_name} ${player.last_name}`.trim();
    
    return {
      name: displayName || 'Unknown',
      position,
      team,
      number: player.number || '',
      status: player.injury_status || 'Active',
      playerId: player.player_id
    };
  };

  const toggleRosterExpansion = (rosterId) => {
    setExpandedRosters(prev => ({
      ...prev,
      [rosterId]: !prev[rosterId]
    }));
  };

  const getRosterStats = (roster) => {
    return {
      wins: roster.settings?.wins || 0,
      losses: roster.settings?.losses || 0,
      ties: roster.settings?.ties || 0,
      totalPoints: roster.settings?.fpts || 0,
      pointsAgainst: roster.settings?.fpts_against || 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading rosters: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* League Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Users className="h-8 w-8" />
          {leagueDetails?.name || 'League'} Rosters
        </h2>
        <p className="mt-2 opacity-90">
          Season {season} • {rosters.length} Teams
        </p>
      </div>

      {/* Rosters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rosters
          .sort((a, b) => {
            const statsA = getRosterStats(a);
            const statsB = getRosterStats(b);
            return statsB.wins - statsA.wins || statsB.totalPoints - statsA.totalPoints;
          })
          .map((roster) => {
            const user = getUserForRoster(roster.roster_id);
            const rosterStats = getRosterStats(roster);
            const isExpanded = expandedRosters[roster.roster_id];
            const playerIds = [...(roster.players || []), ...(roster.reserve || [])];
            
            return (
              <motion.div
                key={roster.roster_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-600 transition-colors"
              >
                {/* Roster Header */}
                <div className="p-4 bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user?.avatar && (
                        <img
                          src={SleeperService.getAvatarUrl(user.avatar)}
                          alt={user.display_name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {user?.display_name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {rosterStats.wins}-{rosterStats.losses}
                          {rosterStats.ties > 0 && `-${rosterStats.ties}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRosterExpansion(roster.roster_id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Points For:</span>
                      <span className="ml-2 text-white font-semibold">
                        {rosterStats.totalPoints.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Points Against:</span>
                      <span className="ml-2 text-white font-semibold">
                        {rosterStats.pointsAgainst.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Players List */}
                {isExpanded && (
                  <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                    <div className="grid gap-2">
                      {playerIds
                        .map(playerId => getPlayerInfo(playerId))
                        .filter(player => player)
                        .sort((a, b) => getPositionOrder(a.position) - getPositionOrder(b.position))
                        .map((player) => {
                          const playerData = formatPlayerDisplay(player);
                          return (
                            <div
                              key={player.player_id}
                              className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              {/* Player Headshot */}
                              <img
                                src={SleeperService.getPlayerHeadshotUrl(player.player_id)}
                                alt={playerData.name}
                                className="w-10 h-10 rounded-full object-cover bg-gray-700"
                                onError={(e) => {
                                  e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
                                }}
                              />
                              
                              {/* Player Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-white">
                                    {playerData.name}
                                  </span>
                                  {playerData.number && (
                                    <span className="text-xs text-gray-500">
                                      #{playerData.number}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-purple-400 font-medium">
                                    {playerData.position}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-400">
                                    {playerData.team}
                                  </span>
                                  {playerData.status !== 'Active' && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-red-400 text-xs">
                                        {playerData.status}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {playerIds.length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        No players on roster
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

export default SleeperLeagueRosters;