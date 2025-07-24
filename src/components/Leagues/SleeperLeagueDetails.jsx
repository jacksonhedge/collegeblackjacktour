import React, { useState, useEffect } from 'react';
import { X, Crown, Plus, ChevronDown, Trophy, ChevronRight, Info, Check, CheckCircle, Users } from 'lucide-react';
import { SleeperService } from '../../services/sleeper/SleeperService';
import { groupService } from '../../services/firebase/GroupService';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import SleeperLeagueRosters from '../sleeper/SleeperLeagueRosters';

const SleeperLeagueDetails = ({ league, onClose, onGroupCreated, isConverted }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showPrizeStructure, setShowPrizeStructure] = useState(false);
  const [holdingsType, setHoldingsType] = useState('High-Yield Savings');
  const [showHoldingsDropdown, setShowHoldingsDropdown] = useState(false);
  const [showRosters, setShowRosters] = useState(false);
  const { currentUser } = useAuth();

  const holdingsOptions = [
    { 
      name: 'High-Yield Savings',
      return: '+4.5%',
      icon: '💰',
      isPositive: true
    },
    { 
      name: 'Bitcoin',
      return: '+3.36%',
      icon: <span className="inline-flex items-center justify-center w-5 h-5 bg-black text-white rounded-full">₿</span>,
      isPositive: true
    },
    { 
      name: 'Apple Stock',
      return: '+0.18%',
      icon: '🍎',
      isPositive: true
    }
  ];
  
  // Calculate prizes with APY if High-Yield Savings
  const apyRate = 0.045; // 4.5% APY
  const prizes = {
    first: 700,
    second: 200,
    third: 100
  };

  const calculatePrizeWithAPY = (baseAmount) => {
    if (holdingsType === 'High-Yield Savings') {
      const increase = Math.round(baseAmount * apyRate);
      return { base: baseAmount, increase, total: baseAmount + increase };
    }
    return { base: baseAmount, increase: 0, total: baseAmount };
  };

  useEffect(() => {
    const fetchLeagueUsers = async () => {
      try {
        const leagueUsers = await SleeperService.getLeagueUsers(league.league_id);
        setUsers(leagueUsers);
      } catch (error) {
        console.error('Error fetching league users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueUsers();
  }, [league.league_id]);

  const handleCreateGroup = async () => {
    if (!currentUser) return;
    
    try {
      setCreating(true);
      const commissioner = users.find(user => user.is_owner);
      
      // Create group with both commissioner and creator as co-owners
      const groupData = {
        name: league.name,
        emoji: '🏈',
        coOwners: [currentUser.uid, commissioner.user_id],
        members: users.map(user => ({
          id: user.user_id,
          username: user.username,
          displayName: user.display_name,
          avatar: user.avatar
        })),
        sleeperLeagueId: league.league_id,
        platform: 'sleeper'
      };

      await groupService.createGroup(groupData, currentUser.uid);
      onGroupCreated(league.league_id);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setCreating(false);
    }
  };

  const firstPrize = calculatePrizeWithAPY(prizes.first);
  const secondPrize = calculatePrizeWithAPY(prizes.second);
  const thirdPrize = calculatePrizeWithAPY(prizes.third);

  const renderPrizeAmount = (prize) => (
    <span>
      ${prize.total}
      {prize.increase > 0 && (
        <span className="text-green-500 text-lg ml-1">(+${prize.increase})</span>
      )}
    </span>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-purple-50 dark:bg-purple-900/90 p-8 rounded-2xl max-w-2xl w-full mx-4 relative border border-purple-200 dark:border-purple-700 max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-500 dark:text-purple-300 hover:text-purple-700 dark:hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        {/* League Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {league.avatar && (
              <img
                src={`https://sleepercdn.com/avatars/${league.avatar}`}
                alt={league.name}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{league.name}</h2>
              <p className="text-purple-600 dark:text-purple-300">Season {league.season}</p>
            </div>
          </div>
          
          {!isConverted && (
            <button
              onClick={handleCreateGroup}
              disabled={creating}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 
                text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
              <span>{creating ? 'Creating...' : 'Create Bankroll Group'}</span>
            </button>
          )}
        </div>

        {/* View Rosters Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowRosters(!showRosters)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 font-medium"
          >
            <Users className="h-5 w-5" />
            <span>{showRosters ? 'Hide Rosters' : 'View Team Rosters & Players'}</span>
          </button>
        </div>

        {/* Show Rosters View */}
        {showRosters && (
          <div className="mb-6">
            <SleeperLeagueRosters leagueId={league.league_id} season={league.season} />
          </div>
        )}

        {/* League Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-purple-100/50 dark:bg-purple-800/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600 dark:text-purple-300">Total Teams</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{league.total_rosters}</p>
          </div>
          <div className="bg-purple-100/50 dark:bg-purple-800/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600 dark:text-purple-300">League Type</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{league.status || 'Active'}</p>
          </div>
          
          {/* Prize Structure Box */}
          <div 
            className="bg-purple-100/50 dark:bg-purple-800/30 p-4 rounded-lg cursor-pointer hover:bg-purple-200/50 dark:hover:bg-purple-700/30 transition-colors"
            onClick={() => setShowPrizeStructure(!showPrizeStructure)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-300">Prize Structure</h3>
              <Info className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                1st Prize: {renderPrizeAmount(firstPrize)}
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100">
              <span>See More</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
            {showPrizeStructure && (
              <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p>2nd Prize: {renderPrizeAmount(secondPrize)}</p>
                <p>3rd Prize: {renderPrizeAmount(thirdPrize)}</p>
              </div>
            )}
          </div>

          {/* League Holdings Type Box */}
          <div className="bg-purple-100/50 dark:bg-purple-800/30 p-4 rounded-lg relative">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-300">League Holdings Type</h3>
              <Info className="h-4 w-4 text-purple-400" />
            </div>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowHoldingsDropdown(!showHoldingsDropdown)}
            >
              <div className="flex items-center space-x-2">
                {typeof holdingsOptions.find(opt => opt.name === holdingsType)?.icon === 'string' 
                  ? <span>{holdingsOptions.find(opt => opt.name === holdingsType)?.icon}</span>
                  : holdingsOptions.find(opt => opt.name === holdingsType)?.icon
                }
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{holdingsType}</p>
                  <p className={`text-sm ${holdingsOptions.find(opt => opt.name === holdingsType)?.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {holdingsOptions.find(opt => opt.name === holdingsType)?.return}
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-black dark:text-white transition-transform ${showHoldingsDropdown ? 'transform rotate-180' : ''}`} />
            </div>
            
            {showHoldingsDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-purple-800 rounded-lg shadow-lg z-10 border border-purple-200 dark:border-purple-600">
                {holdingsOptions.map((option) => (
                  <div
                    key={option.name}
                    className="px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-700 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => {
                      setHoldingsType(option.name);
                      setShowHoldingsDropdown(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {typeof option.icon === 'string' ? <span>{option.icon}</span> : option.icon}
                        <span className="text-gray-900 dark:text-white">{option.name}</span>
                      </div>
                      <span className={`${option.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {option.return}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* League Members */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">League Members</h3>
          {loading ? (
            <div className="text-center py-4 text-purple-600 dark:text-purple-300">Loading members...</div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div 
                  key={user.user_id} 
                  className="flex items-center space-x-3 bg-purple-100/50 dark:bg-purple-800/20 p-3 rounded-lg"
                >
                  {user.avatar && (
                    <img
                      src={`https://sleepercdn.com/avatars/${user.avatar}`}
                      alt={user.display_name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">{user.display_name}</span>
                      {user.is_owner && (
                        <Crown className="h-4 w-4 text-yellow-400" title="Commissioner" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <p className="text-purple-500 font-medium text-sm">#{user.username}</p>
                      <CheckCircle className="h-4 w-4 text-green-500" title="Verified User" />
                    </div>
                  </div>
                  <Check className="h-5 w-5 text-green-500" title="Payment Received" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SleeperLeagueDetails;
