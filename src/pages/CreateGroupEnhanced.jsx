import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { groupService } from '../services/firebase/GroupService.ts';
import { SleeperService } from '../services/sleeper/SleeperService';
import { Input } from '../components/ui/input';
import InviteUsersModalEnhanced from '../components/groups/InviteUsersModalEnhanced';
import { 
  Users, 
  Trophy, 
  ChevronRight, 
  ArrowLeft,
  Search,
  X,
  UserPlus,
  Loader2,
  Smartphone,
  Link2,
  Check
} from 'lucide-react';

const CreateGroupEnhanced = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [step, setStep] = useState('type'); // type, platform, details, league-select, members
  const [groupType, setGroupType] = useState('');
  const [platform, setPlatform] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupEmoji, setGroupEmoji] = useState('👥');
  const [sleeperUsername, setSleeperUsername] = useState('');
  const [sleeperUser, setSleeperUser] = useState(null);
  const [sleeperLeagues, setSleeperLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [leagueMembers, setLeagueMembers] = useState([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null);

  const groupTypes = [
    {
      id: 'friends',
      title: 'Group of Friends',
      description: 'Create a casual group to share bankrolls and compete',
      icon: Users,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'fantasy',
      title: 'Fantasy League',
      description: 'Connect your fantasy league for automated tracking',
      icon: Trophy,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const fantasyPlatforms = [
    {
      id: 'sleeper',
      name: 'Sleeper Fantasy League',
      logo: '/images/sleeperFantasy.png',
      color: '#F7B500',
      description: 'Import your Sleeper league'
    },
    {
      id: 'espn',
      name: 'ESPN Fantasy League',
      logo: '/images/espnFantasy.png',
      color: '#D50A0A',
      description: 'Connect your ESPN league'
    },
    {
      id: 'yahoo',
      name: 'Yahoo Fantasy League',
      logo: '/images/yahoofantasy.png',
      color: '#7B0099',
      description: 'Link your Yahoo league'
    },
    {
      id: 'nfl',
      name: 'NFL App Fantasy League',
      logo: '/images/nfl-logo.png',
      color: '#013369',
      description: 'Connect your NFL league'
    },
    {
      id: 'cbs',
      name: 'CBS Fantasy League',
      logo: '/images/cbs.png',
      color: '#0066CC',
      description: 'Add your CBS league'
    },
    {
      id: 'other',
      name: 'Other Fantasy League',
      logo: null,
      color: '#666666',
      description: 'Manual fantasy league setup'
    }
  ];

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        try {
          const results = await groupService.searchUsers(searchTerm);
          const filteredResults = results.filter(user => 
            user.uid !== currentUser.uid && 
            !selectedUsers.some(selected => selected.uid === user.uid)
          );
          setSearchResults(filteredResults);
        } catch (err) {
          console.error('Error searching users:', err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentUser.uid, selectedUsers]);

  const fetchSleeperLeagues = async () => {
    setLoadingLeagues(true);
    setError('');
    
    try {
      // Get Sleeper user
      const user = await SleeperService.getUser(sleeperUsername);
      if (!user) {
        setError('Sleeper username not found');
        return;
      }
      
      setSleeperUser(user);
      
      // Get user's leagues for current season
      const currentYear = new Date().getFullYear();
      const leagues = await SleeperService.getUserLeagues(user.user_id, currentYear, 'nfl');
      
      // Filter for active leagues
      const activeLeagues = leagues.filter(league => 
        league.status === 'in_season' || league.status === 'complete'
      );
      
      setSleeperLeagues(activeLeagues);
      
      if (activeLeagues.length === 0) {
        setError('No active leagues found for this user');
      }
    } catch (err) {
      console.error('Error fetching Sleeper leagues:', err);
      setError('Failed to fetch Sleeper leagues');
    } finally {
      setLoadingLeagues(false);
    }
  };

  const fetchLeagueMembers = async (leagueId) => {
    try {
      const members = await SleeperService.getLeagueUsers(leagueId);
      setLeagueMembers(members);
    } catch (err) {
      console.error('Error fetching league members:', err);
    }
  };

  const handleNext = async () => {
    if (step === 'type') {
      if (groupType === 'fantasy') {
        setStep('platform');
      } else {
        setStep('details');
      }
    } else if (step === 'platform') {
      setStep('details');
    } else if (step === 'details') {
      if (platform === 'sleeper' && sleeperUsername) {
        // Fetch Sleeper leagues before proceeding
        await fetchSleeperLeagues();
        setStep('league-select');
      } else {
        setStep('members');
      }
    } else if (step === 'league-select') {
      if (selectedLeague) {
        // Fetch league members
        await fetchLeagueMembers(selectedLeague.league_id);
        setStep('members');
      }
    }
  };

  const handleBack = () => {
    if (step === 'platform') {
      setStep('type');
    } else if (step === 'details') {
      if (groupType === 'fantasy') {
        setStep('platform');
      } else {
        setStep('type');
      }
    } else if (step === 'league-select') {
      setStep('details');
    } else if (step === 'members') {
      if (platform === 'sleeper' && selectedLeague) {
        setStep('league-select');
      } else {
        setStep('details');
      }
    }
  };

  const handleCreateGroup = async () => {
    setIsLoading(true);
    setError('');

    try {
      let allPendingMembers = [...selectedUsers];
      
      // If it's a Sleeper league, add league members as pending invites
      if (platform === 'sleeper' && selectedLeague && leagueMembers.length > 0) {
        // Create pending members from Sleeper users
        const sleeperPendingMembers = leagueMembers
          .filter(member => member.user_id !== sleeperUser?.user_id) // Don't add the creator
          .map(member => ({
            identifier: member.user_id, // Sleeper user ID as identifier
            type: 'sleeper',
            status: 'pending',
            sleeperData: {
              user_id: member.user_id,
              username: member.username || member.display_name,
              display_name: member.display_name,
              avatar: member.avatar,
              team_name: member.metadata?.team_name
            }
          }));
        
        allPendingMembers = [...allPendingMembers, ...sleeperPendingMembers];
      }

      const groupData = {
        name: groupName || selectedLeague?.name || 'Untitled Group',
        type: groupType,
        platform: platform || 'bankroll',
        emoji: groupEmoji || (platform === 'sleeper' ? '🏈' : '👥'),
        sleeperUsername: platform === 'sleeper' ? sleeperUsername : null,
        leagueInfo: platform === 'sleeper' && selectedLeague ? {
          leagueId: selectedLeague.league_id,
          leagueName: selectedLeague.name,
          sport: selectedLeague.sport || 'nfl',
          season: selectedLeague.season,
          platform: 'sleeper',
          totalRosters: selectedLeague.total_rosters,
          status: selectedLeague.status,
          settings: selectedLeague.settings
        } : null,
        pendingMembers: allPendingMembers.map(user => 
          user.type === 'sleeper' ? user : {
            uid: user.uid,
            displayName: user.displayName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            photoURL: user.photoURL
          }
        )
      };

      const newGroup = await groupService.createGroup(groupData, currentUser);
      setCreatedGroup(newGroup);
      
      // If there are members to invite, show the invite modal
      if (allPendingMembers.length > 0 || (platform === 'sleeper' && leagueMembers.length > 0)) {
        setShowInviteModal(true);
      } else {
        navigate(`/groups/${newGroup.id}`);
      }
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(u => u.uid !== user.uid));
    setSearchTerm('');
  };

  const handleRemoveUser = (user) => {
    setSelectedUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const renderTypeSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          What type of group?
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Choose how you want to organize your group
        </p>
      </div>

      <div className="grid gap-4">
        {groupTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => {
                setGroupType(type.id);
                handleNext();
              }}
              className={`relative overflow-hidden rounded-xl p-6 text-left transition-all hover:scale-[1.02] ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${type.color} opacity-10`} />
              <div className="relative flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${type.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {type.title}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {type.description}
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderPlatformSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Select your platform
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Which fantasy platform is your league on?
        </p>
      </div>

      <div className="grid gap-3">
        {fantasyPlatforms.map((plat) => (
          <button
            key={plat.id}
            onClick={() => {
              setPlatform(plat.id);
              handleNext();
            }}
            className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:scale-[1.01] ${
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
          >
            {plat.logo ? (
              <img 
                src={plat.logo} 
                alt={plat.name}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/images/BankrollLogoTransparent.png';
                }}
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: plat.color }}
              >
                {plat.name[0]}
              </div>
            )}
            <div className="flex-1 text-left">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {plat.name}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {plat.description}
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const renderLeagueSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Select your league
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Choose which Sleeper league to import
        </p>
      </div>

      {loadingLeagues ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : sleeperLeagues.length > 0 ? (
        <div className="space-y-3">
          {sleeperLeagues.map((league) => (
            <button
              key={league.league_id}
              onClick={() => {
                setSelectedLeague(league);
                setGroupName(league.name);
              }}
              className={`w-full p-4 rounded-lg border transition-all ${
                selectedLeague?.league_id === league.league_id
                  ? 'border-purple-600 bg-purple-600/10'
                  : isDark 
                    ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {league.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {league.total_rosters} teams • {league.sport?.toUpperCase()} • {league.season}
                  </p>
                </div>
                {selectedLeague?.league_id === league.league_id && (
                  <div className="bg-purple-600 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 rounded-lg border ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'
        }`}>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {error || 'No leagues found for this user'}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleBack}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            isDark 
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedLeague}
          className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Group details
        </h2>
        <p className="text-sm text-gray-300">
          {platform === 'sleeper' ? 'Enter your Sleeper username' : 'Set up your group'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Group Name
          </label>
          <Input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            className={isDark ? 'bg-gray-800 border-gray-700' : ''}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Group Icon
          </label>
          <div className="space-y-3">
            {/* Emoji Selection Grid */}
            <div className="grid grid-cols-8 gap-2">
              {['👥', '🏈', '🏀', '⚾', '⚽', '🏒', '🎯', '💰', '🎲', '🃏', '🎰', '🏆', '💎', '🚀', '🔥', '⭐'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setGroupEmoji(emoji)}
                  className={`p-2 text-2xl rounded-lg transition-all ${
                    groupEmoji === emoji
                      ? 'bg-purple-600 ring-2 ring-purple-500 ring-offset-2' + (isDark ? ' ring-offset-gray-900' : ' ring-offset-white')
                      : isDark
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            {/* Custom Image Upload (disabled for now) */}
            <div className={`p-3 rounded-lg border-2 border-dashed ${
              isDark ? 'border-gray-700' : 'border-gray-300'
            }`}>
              <p className={`text-xs text-center ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Custom image upload coming soon
              </p>
            </div>
          </div>
        </div>

        {platform === 'sleeper' && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Sleeper Username
            </label>
            <Input
              type="text"
              value={sleeperUsername}
              onChange={(e) => setSleeperUsername(e.target.value)}
              placeholder="Enter your Sleeper username"
              className={isDark ? 'bg-gray-800 border-gray-700' : ''}
            />
            <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              We'll import your leagues and rosters automatically
            </p>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!groupName.trim() || (platform === 'sleeper' && !sleeperUsername.trim())}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderMemberSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {platform === 'sleeper' && leagueMembers.length > 0 ? 'League Members' : 'Invite members'}
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {platform === 'sleeper' && leagueMembers.length > 0 
            ? `${leagueMembers.length} members will be invited from your Sleeper league`
            : 'Add friends to your group (optional)'
          }
        </p>
      </div>

      {/* Show Sleeper league members if available */}
      {platform === 'sleeper' && leagueMembers.length > 0 && (
        <div className="mb-6">
          <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Sleeper League Members
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {leagueMembers.map((member) => (
              <div
                key={member.user_id}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                }`}
              >
                {member.avatar ? (
                  <img
                    src={SleeperService.getAvatarUrl(member.avatar)}
                    alt={member.display_name || member.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {(member.display_name || member.username || '?')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {member.display_name || member.username}
                  </div>
                  {member.metadata?.team_name && (
                    <div className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {member.metadata.team_name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-300">
            These members will receive invites to join your Bankroll group. They'll need to create or connect their Bankroll account.
          </p>
          <div className="mt-3 p-3 bg-purple-600/10 border border-purple-600/20 rounded-lg">
            <p className="text-xs text-purple-300">
              After creating the group, you'll be able to invite them via text message or email.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username, email, or phone"
            className={`pl-10 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className={`border rounded-lg overflow-hidden ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            {searchResults.map((user, index) => (
              <button
                key={`search-${user.uid}-${index}`}
                onClick={() => handleSelectUser(user)}
                className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  index !== searchResults.length - 1 ? 'border-b dark:border-gray-700' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="text-left">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.displayName}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user.username || user.email || user.phone}
                    </div>
                  </div>
                </div>
                <UserPlus className="w-5 h-5 text-purple-600" />
              </button>
            ))}
          </div>
        )}

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="space-y-2">
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Selected Members ({selectedUsers.length})
            </h3>
            <div className="space-y-2">
              {selectedUsers.map((user, index) => (
                <div
                  key={`selected-${user.uid}-${index}`}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user.displayName}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.username || user.email || user.phone}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveUser(user)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleCreateGroup}
          disabled={isLoading}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Group...
            </>
          ) : (
            'Create Group'
          )}
        </button>

        <button
          onClick={handleCreateGroup}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg transition-colors font-medium ${
            isDark 
              ? 'text-gray-400 hover:text-gray-300' 
              : 'text-gray-600 hover:text-gray-700'
          }`}
        >
          Skip and Create Group
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Navigation */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => step === 'type' ? navigate('/groups') : handleBack()}
          className={`flex items-center gap-2 text-sm ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          } transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {(() => {
            const steps = groupType === 'friends' 
              ? ['type', 'details', 'members']
              : platform === 'sleeper' 
                ? ['type', 'platform', 'details', 'league-select', 'members']
                : ['type', 'platform', 'details', 'members'];
            
            return steps.map((s, index) => {
              const isActive = s === step;
              const isPast = steps.indexOf(step) > index;
              
              return (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isActive 
                      ? 'w-8 bg-purple-600' 
                      : isPast 
                        ? 'bg-purple-600' 
                        : isDark ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                />
              );
            });
          })()}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Step Content */}
      {step === 'type' && renderTypeSelection()}
      {step === 'platform' && renderPlatformSelection()}
      {step === 'details' && renderDetailsForm()}
      {step === 'league-select' && renderLeagueSelection()}
      {step === 'members' && renderMemberSelection()}
      
      {/* Invite Modal */}
      {showInviteModal && createdGroup && (
        <InviteUsersModalEnhanced
          groupId={createdGroup.id}
          groupName={createdGroup.name}
          onClose={() => {
            setShowInviteModal(false);
            navigate(`/groups/${createdGroup.id}`);
          }}
          onInvite={() => {
            setShowInviteModal(false);
            navigate(`/groups/${createdGroup.id}`);
          }}
        />
      )}
    </div>
  );
};

export default CreateGroupEnhanced;