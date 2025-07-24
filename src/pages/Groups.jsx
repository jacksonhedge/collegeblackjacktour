import React, { useState } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePostHog } from '../contexts/PostHogContext';
import { useGroup } from '../contexts/GroupContext';
import { Users, Plus, DollarSign, Trophy, TrendingUp, UserPlus, ArrowUpRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import InviteUsersModalEnhanced from '../components/groups/InviteUsersModalEnhanced';
import { mockTrendingGroups } from '../data/mockGroups';

const Groups = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { trackEvent, trackButtonClick, trackFeatureUsage } = usePostHog();
  const { groups, loading: groupsLoading } = useGroup();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-groups');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const platformIcons = {
    sleeper: '/images/sleeperFantasy.png',
    espn: '/images/espnFantasy.png',
    yahoo: '/images/yahoofantasy.png',
    general: null
  };

  const groupFeatures = [
    {
      icon: DollarSign,
      title: 'Shared Bankroll',
      description: 'Pool funds together for bigger plays'
    },
    {
      icon: Trophy,
      title: 'Group Competitions',
      description: 'Compete with friends for bragging rights'
    },
    {
      icon: TrendingUp,
      title: 'Track Performance',
      description: 'See how your group stacks up'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-white">
            Groups
          </h1>
          <p className="text-sm text-gray-300">
            Team up with friends to share bankrolls and compete together
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              trackButtonClick('join_group_header');
              navigate('/groups/join');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Join Group
          </button>
          <button
            onClick={() => {
              trackButtonClick('create_group_header');
              navigate('/groups/create');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['my-groups', 'discover'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              trackButtonClick(`groups_tab_${tab}`);
              trackEvent('groups_tab_changed', { tab });
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {tab === 'my-groups' ? 'My Groups' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>


      {/* Content */}
      {activeTab === 'my-groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupsLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2 text-white">
                No groups yet
              </h3>
              <p className="mb-6 text-gray-300">
                Create your first group or join an existing one
              </p>
              <button
                onClick={() => navigate('/groups/create')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
              >
                Create Group
              </button>
            </div>
          ) : (
            groups.map((group) => (
            <Card key={group.id} className="transition-all hover:scale-[1.02] bg-gray-800/50 border-purple-500/20 hover:border-purple-500/40">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">{group.emoji || '👥'}</div>
                    {group.platform && platformIcons[group.platform] && (
                      <img 
                        src={platformIcons[group.platform]} 
                        alt={group.platform}
                        className="w-6 h-6 rounded"
                      />
                    )}
                  </div>
                  {group.type === 'fantasy' && (
                    <div className="text-xs px-2 py-1 rounded-full bg-purple-900/30 text-purple-400">
                      Fantasy League
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold mb-3 cursor-pointer text-white hover:text-purple-400 transition-colors" onClick={() => navigate(`/group/${group.id}`)}>
                  {group.name}
                </h3>
                
                {/* Stacked member avatars */}
                <div className="flex items-center mb-3">
                  <div className="flex -space-x-2">
                    {group.members?.slice(0, 4).map((member, index) => (
                      member.photoURL ? (
                        <img
                          key={member.uid || member.id || index}
                          src={member.photoURL}
                          alt={member.displayName || member.firstName}
                          className={`w-8 h-8 rounded-full border-2 ${
                            isDark ? 'border-gray-800' : 'border-white'
                          }`}
                        />
                      ) : (
                        <div
                          key={member.uid || member.id || index}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                            isDark 
                              ? 'bg-purple-600 border-gray-800 text-white' 
                              : 'bg-purple-600 border-white text-white'
                          }`}
                        >
                          {(member.displayName || member.firstName || '?')[0].toUpperCase()}
                        </div>
                      )
                    ))}
                    {group.members?.length > 4 && (
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                        isDark 
                          ? 'bg-gray-700 border-gray-800 text-gray-300' 
                          : 'bg-gray-100 border-white text-gray-600'
                      }`}>
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="ml-3 text-sm text-gray-300">
                    {group.members?.length || 0} members
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-300">
                    Balance
                  </span>
                  <span className="font-bold text-white">
                    ${(group.wallet?.cashBalance || 0).toFixed(2)}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      trackButtonClick('group_view', { group_id: group.id, group_name: group.name });
                      trackEvent('group_viewed', { group_id: group.id, group_name: group.name, group_balance: group.balance });
                      navigate(`/group/${group.id}`);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGroup(group);
                      setInviteModalOpen(true);
                      trackButtonClick('group_invite', { group_id: group.id, group_name: group.name });
                      trackFeatureUsage('invite_modal', { context: 'groups_page', group_id: group.id });
                    }}
                    className="px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite
                  </button>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <div>
          {/* Trending Groups Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-white">
                Trending Groups
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-900/30 text-yellow-400">
                🔥 Hot
              </span>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Join high-performing groups and grow your bankroll together
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTrendingGroups.map((group) => {
              const growthColor = group.weeklyGrowth > 10 ? 'text-green-500' : 'text-yellow-500';
              const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);
              
              // Create a simple sparkline from weekly activity
              const maxValue = Math.max(...group.weeklyActivity);
              const minValue = Math.min(...group.weeklyActivity);
              const range = maxValue - minValue;
              
              return (
                <Card 
                  key={group.id} 
                  className={`relative overflow-hidden transition-all hover:scale-[1.02] cursor-pointer ${
                    isDark ? 'bg-gray-800/50 border-purple-500/20' : 'bg-white border-purple-200'
                  }`}
                  onClick={() => {
                    trackEvent('discover_group_clicked', { groupId: group.id, groupName: group.name });
                    // Show join modal or navigate to details
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-3xl">{group.emoji}</div>
                        {group.platform && platformIcons[group.platform] && (
                          <img 
                            src={platformIcons[group.platform]} 
                            alt={group.platform}
                            className="w-6 h-6 rounded"
                          />
                        )}
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-semibold ${growthColor}`}>
                        <TrendingUp className="w-4 h-4" />
                        +{group.weeklyGrowth}%
                      </div>
                    </div>
                    
                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {group.name}
                    </h3>
                    
                    <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {group.description}
                    </p>
                    
                    {/* Mini sparkline chart */}
                    <div className="mb-3 h-12 flex items-end gap-1">
                      {group.weeklyActivity.map((value, index) => {
                        const height = range > 0 ? ((value - minValue) / range) * 100 : 50;
                        return (
                          <div
                            key={index}
                            className={`flex-1 bg-gradient-to-t ${
                              index === group.weeklyActivity.length - 1
                                ? 'from-green-500/40 to-green-500'
                                : 'from-purple-500/20 to-purple-500/40'
                            } rounded-t`}
                            style={{ height: `${height}%` }}
                          />
                        );
                      })}
                    </div>
                    
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pooled Funds</span>
                        <ArrowUpRight className={`w-3 h-3 ${growthColor}`} />
                      </div>
                      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(group.pooledFunds)}
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {group.memberCount} members
                        </span>
                        <button 
                          onClick={() => {
                            trackButtonClick('request_to_join_trending', { group_id: group.id, group_name: group.name });
                            // For now, just navigate to join page
                            // In a real app, this would use the group ID to request joining
                            navigate('/groups/join');
                          }}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                            isDark 
                              ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30' 
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }`}>
                          Request to Join
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}


      {/* Invite Modal */}
      {inviteModalOpen && selectedGroup && (
        <InviteUsersModalEnhanced
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          onClose={() => {
            setInviteModalOpen(false);
            setSelectedGroup(null);
          }}
          onInvite={() => {
            setInviteModalOpen(false);
            setSelectedGroup(null);
          }}
        />
      )}
    </div>
  );
};

export default Groups;