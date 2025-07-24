import React, { useState } from 'react';
import { 
  Trophy, Share2, Link2, ShoppingBag, DollarSign, 
  Gift, Star, Check, Lock, ChevronRight, Users,
  TrendingUp, Coins, Target
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/SupabaseAuthContext';

const RewardsView = () => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('earn');

  // Mock data - would be fetched from backend
  const userRewards = {
    points: 250,
    level: 2,
    nextLevelPoints: 500,
    totalEarned: 125.50,
    pendingRewards: 15.00
  };

  const rewardCategories = {
    referrals: {
      title: 'Share & Earn',
      icon: Share2,
      color: 'from-blue-500 to-purple-500',
      tasks: [
        {
          id: 'refer-1',
          title: 'Invite your first friend',
          description: 'Get $10 when they sign up and connect a platform',
          reward: 10,
          points: 100,
          completed: false,
          progress: { current: 0, max: 1 }
        },
        {
          id: 'refer-3',
          title: 'Invite 3 friends',
          description: 'Unlock bonus rewards and exclusive features',
          reward: 25,
          points: 250,
          completed: false,
          progress: { current: 0, max: 3 }
        },
        {
          id: 'refer-league',
          title: 'Invite your whole league',
          description: 'Get $50 when 10+ league members join',
          reward: 50,
          points: 500,
          completed: false,
          progress: { current: 0, max: 10 }
        }
      ]
    },
    connections: {
      title: 'Connect Platforms',
      icon: Link2,
      color: 'from-green-500 to-teal-500',
      tasks: [
        {
          id: 'connect-fantasy',
          title: 'Connect a fantasy league',
          description: 'Link ESPN, Yahoo, or Sleeper',
          reward: 5,
          points: 50,
          completed: true,
          platforms: ['ESPN', 'Yahoo', 'Sleeper']
        },
        {
          id: 'connect-betting',
          title: 'Connect betting accounts',
          description: 'Link FanDuel and DraftKings',
          reward: 10,
          points: 100,
          completed: false,
          platforms: ['FanDuel', 'DraftKings'],
          progress: { current: 0, max: 2 }
        },
        {
          id: 'connect-all',
          title: 'Platform Master',
          description: 'Connect 5+ platforms to unlock VIP rewards',
          reward: 25,
          points: 250,
          completed: false,
          progress: { current: 1, max: 5 }
        }
      ]
    },
    spending: {
      title: 'Shop & Save',
      icon: ShoppingBag,
      color: 'from-orange-500 to-red-500',
      tasks: [
        {
          id: 'spend-first',
          title: 'Make your first purchase',
          description: 'Spend at any partner store',
          reward: 5,
          points: 50,
          completed: false,
          progress: { current: 0, max: 1 }
        },
        {
          id: 'spend-100',
          title: 'Spend $100',
          description: 'Get 5% cashback on partner purchases',
          reward: 10,
          points: 100,
          completed: false,
          progress: { current: 0, max: 100 }
        },
        {
          id: 'spend-streak',
          title: '7-day spending streak',
          description: 'Make a purchase 7 days in a row',
          reward: 20,
          points: 200,
          completed: false,
          progress: { current: 0, max: 7 }
        }
      ]
    },
    engagement: {
      title: 'Stay Active',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      tasks: [
        {
          id: 'login-streak',
          title: '7-day login streak',
          description: 'Log in every day for a week',
          reward: 5,
          points: 50,
          completed: false,
          progress: { current: 3, max: 7 }
        },
        {
          id: 'weekly-bet',
          title: 'Weekly bettor',
          description: 'Place bets 4 weeks in a row',
          reward: 15,
          points: 150,
          completed: false,
          progress: { current: 2, max: 4 }
        },
        {
          id: 'season-long',
          title: 'Season-long player',
          description: 'Stay active for an entire season',
          reward: 50,
          points: 500,
          completed: false,
          progress: { current: 45, max: 120 }
        }
      ]
    }
  };

  const partnerStores = [
    { name: 'Nike', discount: '10%', category: 'Sports', logo: '👟' },
    { name: 'Amazon', discount: '5%', category: 'Everything', logo: '📦' },
    { name: 'DoorDash', discount: '15%', category: 'Food', logo: '🍔' },
    { name: 'Uber', discount: '10%', category: 'Transport', logo: '🚗' },
    { name: 'StubHub', discount: '8%', category: 'Tickets', logo: '🎫' },
    { name: 'Hotels.com', discount: '12%', category: 'Travel', logo: '🏨' }
  ];

  const RewardTask = ({ task, categoryColor }) => {
    const isLocked = task.points > userRewards.points && !task.completed;
    
    return (
      <div className={`p-4 rounded-xl border ${
        isDark 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white border-gray-200'
      } ${task.completed ? 'opacity-75' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{task.title}</h4>
              {task.completed && (
                <div className="flex items-center gap-1 text-green-500">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-medium">Completed</span>
                </div>
              )}
              {isLocked && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs">Locked</span>
                </div>
              )}
            </div>
            <p className={`text-sm mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>{task.description}</p>
            
            {/* Platform logos */}
            {task.platforms && (
              <div className="flex gap-2 mb-2">
                {task.platforms.map(platform => (
                  <span key={platform} className={`text-xs px-2 py-1 rounded-full ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {platform}
                  </span>
                ))}
              </div>
            )}
            
            {/* Progress bar */}
            {task.progress && !task.completed && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Progress
                  </span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {task.progress.current}/{task.progress.max}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`h-full bg-gradient-to-r ${categoryColor} transition-all duration-300`}
                    style={{ width: `${(task.progress.current / task.progress.max) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="ml-4 text-right">
            <div className={`text-lg font-bold ${
              task.completed ? 'text-gray-500' : 'text-green-500'
            }`}>
              ${task.reward}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.points} pts
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header with user stats */}
      <Card className={`mb-6 overflow-hidden ${
        isDark ? 'bg-gray-900/50 border-purple-500/20' : 'bg-white border-gray-200'
      }`}>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Rewards Center</h1>
              <p className="text-white/80">Earn money by using Bankroll</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-white/80 text-sm">Points</span>
              </div>
              <div className="text-xl font-bold text-white">{userRewards.points}</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white/80 text-sm">Level {userRewards.level}</span>
              </div>
              <div className="text-xl font-bold text-white">
                {userRewards.points}/{userRewards.nextLevelPoints}
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-white/80 text-sm">Earned</span>
              </div>
              <div className="text-xl font-bold text-white">
                ${userRewards.totalEarned.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-blue-400" />
                <span className="text-white/80 text-sm">Pending</span>
              </div>
              <div className="text-xl font-bold text-white">
                ${userRewards.pendingRewards.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['earn', 'spend', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? isDark
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'earn' && (
        <div className="space-y-6">
          {Object.entries(rewardCategories).map(([key, category]) => (
            <Card key={key} className={`overflow-hidden ${
              isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`p-4 bg-gradient-to-r ${category.color}`}>
                <div className="flex items-center gap-3">
                  <category.icon className="w-6 h-6 text-white" />
                  <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                {category.tasks.map(task => (
                  <RewardTask 
                    key={task.id} 
                    task={task} 
                    categoryColor={category.color}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'spend' && (
        <Card className={isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Partner Stores</h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Use your rewards at these partner stores and earn cashback on every purchase
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partnerStores.map((store) => (
                <div
                  key={store.name}
                  className={`p-4 rounded-lg border transition-all hover:shadow-lg cursor-pointer ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 hover:border-purple-500' 
                      : 'bg-gray-50 border-gray-200 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{store.logo}</span>
                      <div>
                        <h4 className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{store.name}</h4>
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>{store.category}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Cashback</span>
                    <span className="text-green-500 font-bold">{store.discount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card className={isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Reward History</h3>
            <div className={`text-center py-12 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rewards earned yet</p>
              <p className="text-sm mt-2">Complete tasks to start earning!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RewardsView;