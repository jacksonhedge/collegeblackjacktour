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

class UserManagementService {
  constructor() {
    this.usersCollection = 'users';
    this.transactionsCollection = 'transactions';
    this.depositsCollection = 'deposits';
    this.withdrawalsCollection = 'withdrawals';
  }

  // Get paginated users with detailed information
  async getUsersPaginated(pageSize = 50, lastDoc = null) {
    try {
      let q = query(
        collection(db, this.usersCollection),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(
          collection(db, this.usersCollection),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const users = [];
      
      for (const doc of snapshot.docs) {
        const userData = doc.data();
        const userWithDetails = await this.enrichUserData(doc.id, userData);
        users.push(userWithDetails);
      }

      return {
        users,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === pageSize
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Enrich user data with additional information
  async enrichUserData(userId, userData) {
    try {
      // Get transaction summary
      const transactionSummary = await this.getUserTransactionSummary(userId);
      
      // Get deposit/withdrawal totals
      const financialSummary = await this.getUserFinancialSummary(userId);
      
      // Calculate account age
      const accountAge = this.calculateAccountAge(userData.createdAt);
      
      // Get last activity
      const lastActivity = await this.getUserLastActivity(userId);

      return {
        id: userId,
        ...userData,
        username: userData.username || 'N/A',
        email: userData.email || 'N/A',
        phoneNumber: userData.phoneNumber || 'N/A',
        createdAt: userData.createdAt || Timestamp.now(),
        lastSeen: userData.lastSeen || userData.createdAt,
        lastActivity,
        accountAge,
        balance: {
          cash: userData.balance?.cash || 0,
          bonus: userData.balance?.bonus || 0,
          total: (userData.balance?.cash || 0) + (userData.balance?.bonus || 0)
        },
        transactions: transactionSummary,
        financials: financialSummary,
        status: this.getUserStatus(userData),
        riskLevel: this.calculateRiskLevel(userData, transactionSummary, financialSummary),
        referralCode: userData.referralCode || 'N/A',
        referredBy: userData.referredBy || null,
        referralCount: userData.referrals?.length || 0,
        leagues: userData.leagues?.length || 0,
        friends: userData.friends?.length || 0,
        emailVerified: userData.emailVerified || false,
        phoneVerified: userData.phoneVerified || false,
        kycStatus: userData.kycStatus || 'pending',
        notifications: {
          email: userData.emailSubscribed || false,
          push: userData.pushNotifications || false,
          sms: userData.smsNotifications || false
        }
      };
    } catch (error) {
      console.error('Error enriching user data:', error);
      return {
        id: userId,
        ...userData,
        error: 'Failed to load complete data'
      };
    }
  }

  // Get user transaction summary
  async getUserTransactionSummary(userId) {
    try {
      const q = query(
        collection(db, this.transactionsCollection),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const summary = {
        total: transactions.length,
        volume: 0,
        sent: { count: 0, amount: 0 },
        received: { count: 0, amount: 0 },
        deposits: { count: 0, amount: 0 },
        withdrawals: { count: 0, amount: 0 },
        lastTransaction: null
      };

      transactions.forEach(tx => {
        const amount = tx.amount || 0;
        summary.volume += Math.abs(amount);

        if (tx.type === 'deposit') {
          summary.deposits.count++;
          summary.deposits.amount += amount;
        } else if (tx.type === 'withdrawal') {
          summary.withdrawals.count++;
          summary.withdrawals.amount += Math.abs(amount);
        } else if (tx.type === 'send' || tx.fromUserId === userId) {
          summary.sent.count++;
          summary.sent.amount += Math.abs(amount);
        } else if (tx.type === 'receive' || tx.toUserId === userId) {
          summary.received.count++;
          summary.received.amount += amount;
        }
      });

      // Get last transaction
      if (transactions.length > 0) {
        const sorted = transactions.sort((a, b) => 
          (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
        );
        summary.lastTransaction = sorted[0];
      }

      return summary;
    } catch (error) {
      console.error('Error getting transaction summary:', error);
      return {
        total: 0,
        volume: 0,
        sent: { count: 0, amount: 0 },
        received: { count: 0, amount: 0 },
        deposits: { count: 0, amount: 0 },
        withdrawals: { count: 0, amount: 0 },
        lastTransaction: null
      };
    }
  }

  // Get user financial summary
  async getUserFinancialSummary(userId) {
    try {
      // Get deposits
      const depositsQuery = query(
        collection(db, this.depositsCollection),
        where('userId', '==', userId)
      );
      const depositsSnapshot = await getDocs(depositsQuery);
      
      let totalDeposits = 0;
      let firstDeposit = null;
      let lastDeposit = null;
      
      depositsSnapshot.forEach(doc => {
        const data = doc.data();
        totalDeposits += data.amount || 0;
        
        if (!firstDeposit || (data.createdAt && data.createdAt < firstDeposit.createdAt)) {
          firstDeposit = data;
        }
        if (!lastDeposit || (data.createdAt && data.createdAt > lastDeposit.createdAt)) {
          lastDeposit = data;
        }
      });

      // Get withdrawals
      const withdrawalsQuery = query(
        collection(db, this.withdrawalsCollection),
        where('userId', '==', userId)
      );
      const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
      
      let totalWithdrawals = 0;
      let lastWithdrawal = null;
      
      withdrawalsSnapshot.forEach(doc => {
        const data = doc.data();
        totalWithdrawals += data.amount || 0;
        
        if (!lastWithdrawal || (data.createdAt && data.createdAt > lastWithdrawal.createdAt)) {
          lastWithdrawal = data;
        }
      });

      return {
        deposits: {
          total: totalDeposits,
          count: depositsSnapshot.size,
          first: firstDeposit,
          last: lastDeposit
        },
        withdrawals: {
          total: totalWithdrawals,
          count: withdrawalsSnapshot.size,
          last: lastWithdrawal
        },
        netDeposits: totalDeposits - totalWithdrawals,
        lifetime: totalDeposits
      };
    } catch (error) {
      console.error('Error getting financial summary:', error);
      return {
        deposits: { total: 0, count: 0, first: null, last: null },
        withdrawals: { total: 0, count: 0, last: null },
        netDeposits: 0,
        lifetime: 0
      };
    }
  }

  // Get user's last activity
  async getUserLastActivity(userId) {
    try {
      // Check various collections for last activity
      const activities = [];

      // Check transactions
      const txQuery = query(
        collection(db, this.transactionsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const txSnapshot = await getDocs(txQuery);
      if (!txSnapshot.empty) {
        const tx = txSnapshot.docs[0].data();
        activities.push({
          type: 'transaction',
          timestamp: tx.createdAt,
          description: `${tx.type} - $${tx.amount}`
        });
      }

      // Return most recent activity
      if (activities.length > 0) {
        activities.sort((a, b) => b.timestamp - a.timestamp);
        return activities[0];
      }

      return null;
    } catch (error) {
      console.error('Error getting last activity:', error);
      return null;
    }
  }

  // Calculate account age
  calculateAccountAge(createdAt) {
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

  // Get user status
  getUserStatus(userData) {
    if (!userData.emailVerified) return 'unverified';
    if (userData.suspended) return 'suspended';
    if (userData.inactive) return 'inactive';
    
    const lastSeen = userData.lastSeen?.toDate ? userData.lastSeen.toDate() : new Date(userData.lastSeen);
    const daysSinceLastSeen = Math.floor((new Date() - lastSeen) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastSeen > 30) return 'dormant';
    if (daysSinceLastSeen > 7) return 'inactive';
    return 'active';
  }

  // Calculate risk level
  calculateRiskLevel(userData, transactionSummary, financialSummary) {
    let riskScore = 0;
    
    // Check for verification
    if (!userData.emailVerified) riskScore += 2;
    if (!userData.phoneVerified) riskScore += 2;
    if (userData.kycStatus !== 'approved') riskScore += 3;
    
    // Check transaction patterns
    const avgTransactionSize = transactionSummary.volume / (transactionSummary.total || 1);
    if (avgTransactionSize > 1000) riskScore += 2;
    if (transactionSummary.withdrawals.amount > financialSummary.deposits.total * 0.9) riskScore += 3;
    
    // Check account age
    const accountAge = this.calculateAccountAge(userData.createdAt);
    if (accountAge.includes('day') || accountAge === 'Today') riskScore += 2;
    
    if (riskScore >= 7) return 'high';
    if (riskScore >= 4) return 'medium';
    return 'low';
  }

  // Search users
  async searchUsers(searchTerm) {
    try {
      const users = [];
      
      // Search by email
      const emailQuery = query(
        collection(db, this.usersCollection),
        where('email', '==', searchTerm)
      );
      const emailSnapshot = await getDocs(emailQuery);
      emailSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });

      // Search by username
      const usernameQuery = query(
        collection(db, this.usersCollection),
        where('username', '==', searchTerm)
      );
      const usernameSnapshot = await getDocs(usernameQuery);
      usernameSnapshot.forEach(doc => {
        if (!users.find(u => u.id === doc.id)) {
          users.push({ id: doc.id, ...doc.data() });
        }
      });

      // Enrich user data
      const enrichedUsers = [];
      for (const user of users) {
        const enriched = await this.enrichUserData(user.id, user);
        enrichedUsers.push(enriched);
      }

      return enrichedUsers;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Update user status
  async updateUserStatus(userId, status) {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      await updateDoc(userRef, {
        status,
        statusUpdatedAt: Timestamp.now(),
        statusUpdatedBy: 'admin'
      });
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Suspend user
  async suspendUser(userId, reason) {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      await updateDoc(userRef, {
        suspended: true,
        suspendedAt: Timestamp.now(),
        suspendedReason: reason,
        suspendedBy: 'admin'
      });
      return true;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  // Reactivate user
  async reactivateUser(userId) {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      await updateDoc(userRef, {
        suspended: false,
        reactivatedAt: Timestamp.now(),
        reactivatedBy: 'admin'
      });
      return true;
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStatistics() {
    try {
      const usersSnapshot = await getDocs(collection(db, this.usersCollection));
      
      const stats = {
        total: usersSnapshot.size,
        active: 0,
        inactive: 0,
        suspended: 0,
        verified: 0,
        unverified: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        averageBalance: 0,
        newToday: 0,
        newThisWeek: 0,
        newThisMonth: 0
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      let totalBalance = 0;

      usersSnapshot.forEach(doc => {
        const user = doc.data();
        const status = this.getUserStatus(user);
        
        if (status === 'active') stats.active++;
        else if (status === 'suspended') stats.suspended++;
        else stats.inactive++;

        if (user.emailVerified) stats.verified++;
        else stats.unverified++;

        totalBalance += (user.balance?.cash || 0) + (user.balance?.bonus || 0);

        const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        if (createdAt >= today) stats.newToday++;
        if (createdAt >= weekAgo) stats.newThisWeek++;
        if (createdAt >= monthAgo) stats.newThisMonth++;
      });

      stats.averageBalance = stats.total > 0 ? totalBalance / stats.total : 0;

      return stats;
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();