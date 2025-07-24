import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send,
  Trophy,
  Activity,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

const LeagueGroupsManagement = () => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    totalGroups: 0,
    activeGroups: 0,
    totalFundsPooled: 0,
    pendingInvites: 0
  });

  useEffect(() => {
    loadLeaguesAndGroups();
  }, []);

  const loadLeaguesAndGroups = async () => {
    try {
      setLoading(true);
      
      // Fetch all groups
      const groupsSnapshot = await getDocs(collection(db, 'groups'));
      const groupsData = [];
      let totalFunds = 0;
      let pendingInvitesCount = 0;
      let activeCount = 0;

      for (const groupDoc of groupsSnapshot.docs) {
        const group = { id: groupDoc.id, ...groupDoc.data() };
        
        // Get member details
        const memberDetails = [];
        // Handle different member storage formats
        let membersList = [];
        if (group.members) {
          if (Array.isArray(group.members)) {
            membersList = group.members;
          } else if (typeof group.members === 'object') {
            // Handle case where members might be stored as an object
            membersList = Object.keys(group.members);
          }
        }
        
        if (membersList.length > 0) {
          for (const memberId of membersList) {
            try {
              // Ensure memberId is a string
              const memberIdStr = String(memberId);
              if (!memberIdStr || memberIdStr === 'undefined' || memberIdStr === 'null') {
                console.warn('Invalid member ID:', memberId);
                continue;
              }
              
              const userDoc = await getDoc(doc(db, 'users', memberIdStr));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                memberDetails.push({
                  id: memberIdStr,
                  username: userData.username || 'Unknown',
                  email: userData.email
                });
              }
            } catch (error) {
              console.error('Error fetching member:', error, 'Member ID:', memberId);
            }
          }
        }

        // Calculate funds pooled (from group wallets or transactions)
        const groupFunds = group.totalBalance || 0;
        totalFunds += groupFunds;

        // Count pending invites
        const invites = group.pendingInvites || [];
        pendingInvitesCount += invites.length;

        // Check if group is active
        const isActive = group.status === 'active' || (!group.status && membersList.length > 0);
        if (isActive) activeCount++;

        // Get activity data
        let lastActivity = null;
        try {
          const transactionsQuery = query(
            collection(db, 'transactions'),
            where('groupId', '==', groupDoc.id),
            orderBy('createdAt', 'desc')
          );
          const transactionsSnapshot = await getDocs(transactionsQuery);
          if (!transactionsSnapshot.empty) {
            const lastTransaction = transactionsSnapshot.docs[0].data();
            lastActivity = lastTransaction.createdAt?.toDate() || null;
          }
        } catch (error) {
          // Index might not exist yet - this is fine, we'll just not show activity
          if (error.message?.includes('index')) {
            // console.log('Firestore index not yet created for group transactions');
          } else {
            console.warn('Could not fetch group transactions:', error);
          }
        }

        groupsData.push({
          ...group,
          memberDetails,
          memberCount: membersList.length,
          fundsPooled: groupFunds,
          pendingInvites: invites,
          lastActivity,
          isActive
        });
      }

      setLeagues(groupsData);
      setStats({
        totalGroups: groupsData.length,
        activeGroups: activeCount,
        totalFundsPooled: totalFunds,
        pendingInvites: pendingInvitesCount
      });
    } catch (error) {
      console.error('Error loading leagues/groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeagues = leagues.filter(league => {
    const matchesSearch = searchTerm === '' || 
      league.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
      (filterType === 'active' && league.isActive) ||
      (filterType === 'inactive' && !league.isActive) ||
      (filterType === 'pending' && league.pendingInvites.length > 0);
    
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGroups}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeGroups}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Funds Pooled</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalFundsPooled)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Invites</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingInvites}</p>
            </div>
            <Send className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by group name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Groups</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">With Pending Invites</option>
        </select>
        
        <button
          onClick={loadLeaguesAndGroups}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funds Pooled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending Invites
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeagues.map((league) => (
                <tr key={league.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {league.isFantasyLeague ? (
                          <Trophy className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Shield className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {league.name || 'Unnamed Group'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {league.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      league.isFantasyLeague 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {league.isFantasyLeague ? 'Fantasy League' : 'Social Group'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{league.memberCount} members</div>
                    <div className="text-xs text-gray-500">
                      {league.memberDetails.slice(0, 2).map(m => m.username).join(', ')}
                      {league.memberCount > 2 && ` +${league.memberCount - 2} more`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(league.fundsPooled)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {league.isActive ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Inactive</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {league.pendingInvites.length > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {league.pendingInvites.length} pending
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(league.lastActivity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(league.createdAt?.toDate?.())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLeagues.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No groups found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueGroupsManagement;