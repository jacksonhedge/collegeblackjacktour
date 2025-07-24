import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

class GroupManagementService {
  constructor() {
    this.groupsCollection = 'groups';
    this.usersCollection = 'users';
    this.transactionsCollection = 'transactions';
  }

  // Get paginated groups with detailed information
  async getGroupsPaginated(pageSize = 50, lastDoc = null) {
    try {
      let q = query(
        collection(db, this.groupsCollection),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(
          collection(db, this.groupsCollection),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const groups = [];
      
      for (const doc of snapshot.docs) {
        const groupData = doc.data();
        const groupWithDetails = await this.enrichGroupData(doc.id, groupData);
        groups.push(groupWithDetails);
      }

      return {
        groups,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === pageSize
      };
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  // Enrich group data with additional information
  async enrichGroupData(groupId, groupData) {
    try {
      // Get member details
      const memberDetails = await this.getGroupMembers(groupId, groupData.members || []);
      
      // Get activity summary
      const activitySummary = await this.getGroupActivitySummary(groupId);
      
      // Calculate group age
      const groupAge = this.calculateGroupAge(groupData.createdAt);
      
      // Determine group type and platform
      const groupType = this.determineGroupType(groupData);
      
      // Get financial summary
      const financialSummary = await this.getGroupFinancialSummary(groupId, groupData.members || []);

      return {
        id: groupId,
        ...groupData,
        name: groupData.name || 'Unnamed Group',
        description: groupData.description || '',
        type: groupType.type,
        platform: groupType.platform,
        platformDetails: groupType.details,
        createdAt: groupData.createdAt || Timestamp.now(),
        createdBy: groupData.createdBy || 'Unknown',
        memberCount: groupData.members?.length || 0,
        memberDetails,
        inviteCode: groupData.inviteCode || '',
        privacy: groupData.privacy || 'private',
        status: this.getGroupStatus(groupData),
        groupAge,
        activity: activitySummary,
        financials: financialSummary,
        settings: {
          autoSplit: groupData.autoSplit || false,
          weeklyDues: groupData.weeklyDues || 0,
          defaultSplitPercentage: groupData.defaultSplitPercentage || 100,
          allowGuestBets: groupData.allowGuestBets || false
        },
        leagues: groupData.leagues || [],
        tags: groupData.tags || [],
        lastActive: groupData.lastActive || groupData.createdAt
      };
    } catch (error) {
      console.error('Error enriching group data:', error);
      return {
        id: groupId,
        ...groupData,
        error: 'Failed to load complete data'
      };
    }
  }

  // Determine group type and platform
  determineGroupType(groupData) {
    const types = {
      sleeper: {
        type: 'Fantasy League',
        platform: 'Sleeper',
        icon: '🏈',
        color: 'purple'
      },
      espn: {
        type: 'Fantasy League',
        platform: 'ESPN',
        icon: '🏀',
        color: 'red'
      },
      yahoo: {
        type: 'Fantasy League',
        platform: 'Yahoo',
        icon: '⚾',
        color: 'purple'
      },
      draftkings: {
        type: 'DFS Group',
        platform: 'DraftKings',
        icon: '👑',
        color: 'orange'
      },
      fanduel: {
        type: 'DFS Group',
        platform: 'FanDuel',
        icon: '⚡',
        color: 'blue'
      },
      betting: {
        type: 'Betting Syndicate',
        platform: 'Multiple',
        icon: '💰',
        color: 'green'
      },
      social: {
        type: 'Social Group',
        platform: 'Bankroll',
        icon: '👥',
        color: 'gray'
      }
    };

    // Check for platform indicators
    if (groupData.sleeperLeagueId || groupData.platform === 'sleeper') {
      return { ...types.sleeper, details: { leagueId: groupData.sleeperLeagueId } };
    }
    if (groupData.espnLeagueId || groupData.platform === 'espn') {
      return { ...types.espn, details: { leagueId: groupData.espnLeagueId } };
    }
    if (groupData.yahooLeagueId || groupData.platform === 'yahoo') {
      return { ...types.yahoo, details: { leagueId: groupData.yahooLeagueId } };
    }
    if (groupData.platform === 'draftkings' || groupData.tags?.includes('dfs')) {
      return { ...types.draftkings, details: {} };
    }
    if (groupData.platform === 'fanduel') {
      return { ...types.fanduel, details: {} };
    }
    if (groupData.tags?.includes('betting') || groupData.tags?.includes('sportsbook')) {
      return { ...types.betting, details: {} };
    }

    // Default to social group
    return { ...types.social, details: {} };
  }

  // Get group members with details
  async getGroupMembers(groupId, memberIds) {
    try {
      if (!memberIds || memberIds.length === 0) return [];

      const members = [];
      
      // Batch fetch member details
      for (const memberId of memberIds.slice(0, 10)) { // Limit to first 10 for performance
        try {
          const userDoc = await getDoc(doc(db, this.usersCollection, memberId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            members.push({
              id: memberId,
              username: userData.username || 'Unknown',
              email: userData.email || '',
              joinedAt: userData.groups?.[groupId]?.joinedAt || null,
              role: userData.groups?.[groupId]?.role || 'member',
              balance: (userData.balance?.cash || 0) + (userData.balance?.bonus || 0)
            });
          }
        } catch (err) {
          console.error(`Error fetching member ${memberId}:`, err);
        }
      }

      return members;
    } catch (error) {
      console.error('Error getting group members:', error);
      return [];
    }
  }

  // Get group activity summary
  async getGroupActivitySummary(groupId) {
    try {
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get recent transactions for the group
      const transactionsQuery = query(
        collection(db, this.transactionsCollection),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const activity = {
        totalTransactions: transactions.length,
        last24Hours: 0,
        lastWeek: 0,
        lastMonth: 0,
        totalVolume: 0,
        lastTransaction: null,
        activeMembers: new Set(),
        transactionTypes: {
          bets: 0,
          dues: 0,
          payouts: 0,
          other: 0
        }
      };

      transactions.forEach(tx => {
        const txDate = tx.createdAt?.toDate() || new Date(tx.createdAt);
        
        if (txDate >= dayAgo) activity.last24Hours++;
        if (txDate >= weekAgo) activity.lastWeek++;
        if (txDate >= monthAgo) activity.lastMonth++;
        
        activity.totalVolume += Math.abs(tx.amount || 0);
        activity.activeMembers.add(tx.userId);

        // Categorize transaction types
        if (tx.type === 'bet' || tx.description?.includes('bet')) {
          activity.transactionTypes.bets++;
        } else if (tx.type === 'dues' || tx.description?.includes('dues')) {
          activity.transactionTypes.dues++;
        } else if (tx.type === 'payout' || tx.description?.includes('payout')) {
          activity.transactionTypes.payouts++;
        } else {
          activity.transactionTypes.other++;
        }
      });

      activity.activeMembers = activity.activeMembers.size;
      activity.lastTransaction = transactions[0] || null;

      return activity;
    } catch (error) {
      console.error('Error getting group activity:', error);
      return {
        totalTransactions: 0,
        last24Hours: 0,
        lastWeek: 0,
        lastMonth: 0,
        totalVolume: 0,
        lastTransaction: null,
        activeMembers: 0,
        transactionTypes: {
          bets: 0,
          dues: 0,
          payouts: 0,
          other: 0
        }
      };
    }
  }

  // Get group financial summary
  async getGroupFinancialSummary(groupId, memberIds) {
    try {
      const summary = {
        totalPoolBalance: 0,
        totalMemberBalances: 0,
        totalInflows: 0,
        totalOutflows: 0,
        pendingDues: 0,
        upcomingPayouts: 0
      };

      // Get group pool balance if exists
      const groupDoc = await getDoc(doc(db, this.groupsCollection, groupId));
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        summary.totalPoolBalance = groupData.poolBalance || 0;
        summary.pendingDues = groupData.pendingDues || 0;
        summary.upcomingPayouts = groupData.upcomingPayouts || 0;
      }

      // Calculate total member balances
      for (const memberId of memberIds) {
        try {
          const userDoc = await getDoc(doc(db, this.usersCollection, memberId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            summary.totalMemberBalances += (userData.balance?.cash || 0) + (userData.balance?.bonus || 0);
          }
        } catch (err) {
          console.error(`Error fetching member balance ${memberId}:`, err);
        }
      }

      return summary;
    } catch (error) {
      console.error('Error getting financial summary:', error);
      return {
        totalPoolBalance: 0,
        totalMemberBalances: 0,
        totalInflows: 0,
        totalOutflows: 0,
        pendingDues: 0,
        upcomingPayouts: 0
      };
    }
  }

  // Calculate group age
  calculateGroupAge(createdAt) {
    if (!createdAt) return 'Unknown';
    
    const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  }

  // Get group status
  getGroupStatus(groupData) {
    if (groupData.archived) return 'archived';
    if (groupData.suspended) return 'suspended';
    
    const lastActive = groupData.lastActive?.toDate ? groupData.lastActive.toDate() : new Date(groupData.lastActive || 0);
    const daysSinceActive = Math.floor((new Date() - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActive > 30) return 'dormant';
    if (daysSinceActive > 7) return 'inactive';
    return 'active';
  }

  // Search groups
  async searchGroups(searchTerm) {
    try {
      const groups = [];
      
      // Search by name
      const nameQuery = query(
        collection(db, this.groupsCollection),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        limit(20)
      );
      const nameSnapshot = await getDocs(nameQuery);
      nameSnapshot.forEach(doc => {
        groups.push({ id: doc.id, ...doc.data() });
      });

      // Search by invite code
      const inviteQuery = query(
        collection(db, this.groupsCollection),
        where('inviteCode', '==', searchTerm)
      );
      const inviteSnapshot = await getDocs(inviteQuery);
      inviteSnapshot.forEach(doc => {
        if (!groups.find(g => g.id === doc.id)) {
          groups.push({ id: doc.id, ...doc.data() });
        }
      });

      // Enrich group data
      const enrichedGroups = [];
      for (const group of groups) {
        const enriched = await this.enrichGroupData(group.id, group);
        enrichedGroups.push(enriched);
      }

      return enrichedGroups;
    } catch (error) {
      console.error('Error searching groups:', error);
      throw error;
    }
  }

  // Update group status
  async updateGroupStatus(groupId, status) {
    try {
      const groupRef = doc(db, this.groupsCollection, groupId);
      await updateDoc(groupRef, {
        status,
        statusUpdatedAt: Timestamp.now(),
        statusUpdatedBy: 'admin'
      });
      return true;
    } catch (error) {
      console.error('Error updating group status:', error);
      throw error;
    }
  }

  // Archive group
  async archiveGroup(groupId) {
    try {
      const groupRef = doc(db, this.groupsCollection, groupId);
      await updateDoc(groupRef, {
        archived: true,
        archivedAt: Timestamp.now(),
        archivedBy: 'admin'
      });
      return true;
    } catch (error) {
      console.error('Error archiving group:', error);
      throw error;
    }
  }

  // Unarchive group
  async unarchiveGroup(groupId) {
    try {
      const groupRef = doc(db, this.groupsCollection, groupId);
      await updateDoc(groupRef, {
        archived: false,
        unarchivedAt: Timestamp.now(),
        unarchivedBy: 'admin'
      });
      return true;
    } catch (error) {
      console.error('Error unarchiving group:', error);
      throw error;
    }
  }

  // Get group statistics
  async getGroupStatistics() {
    try {
      const groupsSnapshot = await getDocs(collection(db, this.groupsCollection));
      
      const stats = {
        total: groupsSnapshot.size,
        active: 0,
        inactive: 0,
        dormant: 0,
        archived: 0,
        byPlatform: {
          sleeper: 0,
          espn: 0,
          yahoo: 0,
          draftkings: 0,
          fanduel: 0,
          bankroll: 0,
          other: 0
        },
        byType: {
          fantasy: 0,
          dfs: 0,
          betting: 0,
          social: 0
        },
        totalMembers: 0,
        averageMembers: 0,
        newToday: 0,
        newThisWeek: 0,
        newThisMonth: 0
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      groupsSnapshot.forEach(doc => {
        const group = doc.data();
        const groupType = this.determineGroupType(group);
        const status = this.getGroupStatus(group);
        
        // Status counts
        if (status === 'active') stats.active++;
        else if (status === 'inactive') stats.inactive++;
        else if (status === 'dormant') stats.dormant++;
        else if (status === 'archived') stats.archived++;

        // Platform counts
        const platform = groupType.platform.toLowerCase();
        if (stats.byPlatform[platform] !== undefined) {
          stats.byPlatform[platform]++;
        } else {
          stats.byPlatform.other++;
        }

        // Type counts
        if (groupType.type.includes('Fantasy')) stats.byType.fantasy++;
        else if (groupType.type.includes('DFS')) stats.byType.dfs++;
        else if (groupType.type.includes('Betting')) stats.byType.betting++;
        else stats.byType.social++;

        // Member counts
        const memberCount = group.members?.length || 0;
        stats.totalMembers += memberCount;

        // New group counts
        const createdAt = group.createdAt?.toDate ? group.createdAt.toDate() : new Date(group.createdAt);
        if (createdAt >= today) stats.newToday++;
        if (createdAt >= weekAgo) stats.newThisWeek++;
        if (createdAt >= monthAgo) stats.newThisMonth++;
      });

      stats.averageMembers = stats.total > 0 ? Math.round(stats.totalMembers / stats.total) : 0;

      return stats;
    } catch (error) {
      console.error('Error getting group statistics:', error);
      throw error;
    }
  }
}

export const groupManagementService = new GroupManagementService();