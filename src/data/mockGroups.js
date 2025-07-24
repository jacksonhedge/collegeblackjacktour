// Mock trending groups data
export const mockTrendingGroups = [
  {
    id: 'trending-1',
    name: 'Fantasy Kings League',
    emoji: '👑',
    type: 'fantasy',
    platform: 'sleeper',
    memberCount: 12,
    pooledFunds: 45000,
    weeklyGrowth: 12.5,
    previousPooledFunds: 40000,
    topPerformer: 'DraftMaster23',
    description: 'Elite fantasy football league with high stakes',
    trending: true,
    createdAt: '2024-01-15',
    weeklyActivity: [35000, 38000, 40000, 42000, 43500, 44000, 45000]
  },
  {
    id: 'trending-2',
    name: 'Weekend Warriors',
    emoji: '⚔️',
    type: 'fantasy',
    platform: 'espn',
    memberCount: 8,
    pooledFunds: 28500,
    weeklyGrowth: 8.3,
    previousPooledFunds: 26300,
    topPerformer: 'GridironGuru',
    description: 'Competitive weekend betting syndicate',
    trending: true,
    createdAt: '2024-02-01',
    weeklyActivity: [22000, 24000, 25500, 26300, 27000, 27800, 28500]
  },
  {
    id: 'trending-3',
    name: 'Dynasty Builders',
    emoji: '🏰',
    type: 'fantasy',
    platform: 'yahoo',
    memberCount: 16,
    pooledFunds: 67800,
    weeklyGrowth: 15.2,
    previousPooledFunds: 58900,
    topPerformer: 'DynastyDon',
    description: 'Long-term dynasty league with growing pot',
    trending: true,
    createdAt: '2023-12-20',
    weeklyActivity: [50000, 53000, 56000, 58900, 62000, 65000, 67800]
  },
  {
    id: 'trending-4',
    name: 'The Underdogs',
    emoji: '🐕',
    type: 'friends',
    platform: 'bankroll',
    memberCount: 6,
    pooledFunds: 12300,
    weeklyGrowth: 5.7,
    previousPooledFunds: 11600,
    topPerformer: 'LuckyLuke',
    description: 'Friends who beat the odds together',
    trending: true,
    createdAt: '2024-03-01',
    weeklyActivity: [9000, 9500, 10200, 11000, 11600, 12000, 12300]
  },
  {
    id: 'trending-5',
    name: 'NFL Prophets',
    emoji: '🔮',
    type: 'fantasy',
    platform: 'nfl',
    memberCount: 10,
    pooledFunds: 34200,
    weeklyGrowth: 18.9,
    previousPooledFunds: 28800,
    topPerformer: 'ProphetPete',
    description: 'Data-driven NFL betting collective',
    trending: true,
    createdAt: '2024-01-28',
    weeklyActivity: [25000, 26500, 27800, 28800, 30500, 32000, 34200]
  }
];

// Mock groups for wallet page
export const mockWalletGroups = [
  {
    id: 'wallet-group-1',
    name: 'Sunday Night Squad',
    emoji: '🏈',
    memberCount: 4,
    yourContribution: 500,
    totalPooled: 2000,
    platform: 'sleeper',
    type: 'fantasy'
  },
  {
    id: 'wallet-group-2', 
    name: 'College Crew',
    emoji: '🎓',
    memberCount: 6,
    yourContribution: 250,
    totalPooled: 1500,
    platform: 'espn',
    type: 'friends'
  },
  {
    id: 'wallet-group-3',
    name: 'High Rollers',
    emoji: '💰',
    memberCount: 8,
    yourContribution: 1000,
    totalPooled: 8000,
    platform: 'yahoo',
    type: 'fantasy'
  }
];