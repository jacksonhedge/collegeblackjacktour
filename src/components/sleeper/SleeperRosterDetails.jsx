import React, { useState, useEffect } from 'react';
import { SleeperService } from '../../services/sleeper/SleeperService';
import SleeperPlayerCache from '../../services/sleeper/SleeperPlayerCache';
import { motion } from 'framer-motion';
import {
  User,
  Filter,
  Search,
  ArrowUpDown
} from 'lucide-react';

const SleeperRosterDetails = ({ leagueId, rosterId, season }) => {
  const [roster, setRoster] = useState(null);
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('position');

  const positions = ['all', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
  const sortOptions = [
    { value: 'position', label: 'Position' },
    { value: 'name', label: 'Name' },
    { value: 'team', label: 'Team' }
  ];

  useEffect(() => {
    fetchRosterData();
  }, [leagueId, rosterId]);

  const fetchRosterData = async () => {
    try {
      setLoading(true);

      // Get all required data
      const [rostersData, usersData] = await Promise.all([
        SleeperService.getLeagueRosters(leagueId),
        SleeperService.getLeagueUsers(leagueId)
      ]);

      // Find specific roster
      const rosterData = rostersData.find(r => r.roster_id === parseInt(rosterId));
      setRoster(rosterData);

      // Find user for this roster
      const userData = usersData.find(u => u.user_id === rosterData?.owner_id);
      setUser(userData);

      // Get player data
      const playerData = await SleeperPlayerCache.getPlayers();
      
      // Get all players for this roster
      const rosterPlayerIds = [
        ...(rosterData?.players || []),
        ...(rosterData?.reserve || []),
        ...(rosterData?.taxi || [])
      ];

      const rosterPlayers = rosterPlayerIds
        .map(playerId => ({
          ...playerData[playerId],
          rosterSlot: getRosterSlot(rosterData, playerId)
        }))
        .filter(player => player);

      setPlayers(rosterPlayers);
    } catch (error) {
      console.error('Error fetching roster data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRosterSlot = (roster, playerId) => {
    if (roster.reserve?.includes(playerId)) return 'IR';
    if (roster.taxi?.includes(playerId)) return 'TAXI';
    return 'ACTIVE';
  };

  const getPositionOrder = (position) => {
    const order = { 'QB': 1, 'RB': 2, 'WR': 3, 'TE': 4, 'K': 5, 'DEF': 6 };
    return order[position] || 7;
  };

  const filteredAndSortedPlayers = () => {
    let filtered = players;

    // Apply position filter
    if (filter !== 'all') {
      filtered = filtered.filter(player => player.position === filter);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(player => {
        const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
        return fullName.includes(search) || player.team?.toLowerCase().includes(search);
      });
    }

    // Sort players
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'team':
          return (a.team || 'ZZZ').localeCompare(b.team || 'ZZZ');
        case 'position':
        default:
          return getPositionOrder(a.position) - getPositionOrder(b.position);
      }
    });
  };

  const getPlayerStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-400';
      case 'Injured Reserve': return 'text-red-400';
      case 'Out': return 'text-red-400';
      case 'Doubtful': return 'text-orange-400';
      case 'Questionable': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Roster Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={SleeperService.getAvatarUrl(user.avatar)}
              alt={user.display_name}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-purple-800 rounded-full flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{user?.display_name || 'Unknown'}'s Roster</h2>
            <p className="opacity-90">
              {roster?.settings?.wins || 0}-{roster?.settings?.losses || 0}
              {roster?.settings?.ties > 0 && `-${roster.settings.ties}`} • 
              {players.length} Players
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex flex-wrap gap-4">
          {/* Position Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-purple-600 focus:outline-none"
            >
              {positions.map(pos => (
                <option key={pos} value={pos}>
                  {pos === 'all' ? 'All Positions' : pos}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-purple-600 focus:outline-none"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search players..."
              className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-700 focus:border-purple-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedPlayers().map((player) => (
          <motion.div
            key={player.player_id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-purple-600 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Player Headshot */}
              <div className="relative">
                <img
                  src={SleeperService.getPlayerHeadshotUrl(player.player_id)}
                  alt={`${player.first_name} ${player.last_name}`}
                  className="w-16 h-16 rounded-lg object-cover bg-gray-800"
                  onError={(e) => {
                    e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
                  }}
                />
                {player.rosterSlot !== 'ACTIVE' && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {player.rosterSlot}
                  </span>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  {player.first_name} {player.last_name}
                  {player.number && (
                    <span className="text-gray-500 text-sm ml-2">#{player.number}</span>
                  )}
                </h3>
                
                <div className="flex items-center gap-3 text-sm mt-1">
                  <span className="text-purple-400 font-medium">{player.position}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{player.team || 'FA'}</span>
                </div>

                <div className="flex items-center gap-3 text-sm mt-2">
                  <span className={getPlayerStatusColor(player.injury_status)}>
                    {player.injury_status || 'Active'}
                  </span>
                  {player.age && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">Age {player.age}</span>
                    </>
                  )}
                </div>

                {/* Additional Info */}
                {player.years_exp !== undefined && (
                  <p className="text-xs text-gray-500 mt-2">
                    Year {player.years_exp + 1} • {player.height || 'N/A'} • {player.weight || 'N/A'} lbs
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredAndSortedPlayers().length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No players found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default SleeperRosterDetails;