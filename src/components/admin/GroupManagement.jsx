import React, { useState, useEffect } from 'react';
import { groupManagementService } from '../../services/firebase/GroupManagementService';
import GroupDetailsModal from './GroupDetailsModal';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Activity,
  DollarSign,
  Calendar,
  Shield,
  MoreVertical,
  RefreshCw,
  Hash,
  Eye,
  Archive,
  TrendingUp
} from 'lucide-react';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadGroups();
    loadStatistics();
  }, []);

  const loadGroups = async (append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await groupManagementService.getGroupsPaginated(
        50, 
        append ? lastDoc : null
      );
      
      if (append) {
        setGroups(prev => [...prev, ...result.groups]);
      } else {
        setGroups(result.groups);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await groupManagementService.getGroupStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadGroups();
      return;
    }

    try {
      setLoading(true);
      const results = await groupManagementService.searchGroups(searchTerm);
      setGroups(results);
      setHasMore(false);
    } catch (err) {
      console.error('Error searching groups:', err);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupAction = async (groupId, action) => {
    try {
      switch (action) {
        case 'archive':
          await groupManagementService.archiveGroup(groupId);
          break;
        case 'unarchive':
          await groupManagementService.unarchiveGroup(groupId);
          break;
      }
      // Refresh the group list
      loadGroups();
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      alert(`Failed to ${action} group`);
    }
  };

  const getPlatformBadge = (platform) => {
    const platforms = {
      'Sleeper': { bg: 'bg-purple-100', text: 'text-purple-800', icon: '🏈' },
      'ESPN': { bg: 'bg-red-100', text: 'text-red-800', icon: '🏀' },
      'Yahoo': { bg: 'bg-purple-100', text: 'text-purple-800', icon: '⚾' },
      'DraftKings': { bg: 'bg-orange-100', text: 'text-orange-800', icon: '👑' },
      'FanDuel': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '⚡' },
      'Bankroll': { bg: 'bg-gray-100', text: 'text-gray-800', icon: '💰' },
      'Multiple': { bg: 'bg-green-100', text: 'text-green-800', icon: '🎯' }
    };

    const platform_info = platforms[platform] || platforms['Bankroll'];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${platform_info.bg} ${platform_info.text}`}>
        <span className="mr-1">{platform_info.icon}</span>
        {platform}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      dormant: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badges[status] || badges.inactive}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredGroups = groups.filter(group => {
    if (filterStatus !== 'all' && group.status !== filterStatus) return false;
    if (filterPlatform !== 'all' && group.platform !== filterPlatform) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Group Management</h2>
          <button
            onClick={() => loadGroups()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Sleeper</p>
              <p className="text-2xl font-bold text-purple-600">{statistics.byPlatform.sleeper}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">ESPN</p>
              <p className="text-2xl font-bold text-red-600">{statistics.byPlatform.espn}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Fantasy</p>
              <p className="text-2xl font-bold text-blue-600">{statistics.byType.fantasy}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Avg Members</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.averageMembers}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">New Today</p>
              <p className="text-2xl font-bold text-indigo-600">{statistics.newToday}</p>
            </div>
          </div>
        )}

        {/* Platform Distribution */}
        {statistics && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Platform Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(statistics.byPlatform).map(([platform, count]) => (
                <div key={platform} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-600">{platform}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or invite code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="dormant">Dormant</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Platforms</option>
            <option value="Sleeper">Sleeper</option>
            <option value="ESPN">ESPN</option>
            <option value="Yahoo">Yahoo</option>
            <option value="DraftKings">DraftKings</option>
            <option value="FanDuel">FanDuel</option>
            <option value="Bankroll">Bankroll</option>
          </select>

          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type/Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Financials
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && groups.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  Loading groups...
                </td>
              </tr>
            ) : filteredGroups.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  No groups found
                </td>
              </tr>
            ) : (
              filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {group.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {group.inviteCode || 'No code'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      {getPlatformBadge(group.platform)}
                      <div className="text-xs text-gray-500 mt-1">
                        {group.type}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {group.memberCount} members
                    </div>
                    <div className="text-sm text-gray-500">
                      {group.activity.activeMembers} active
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {group.activity.totalTransactions} txns
                    </div>
                    <div className="text-sm text-gray-500">
                      {group.activity.last24Hours} today
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(group.financials.totalPoolBalance)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Pool balance
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(group.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(group.createdAt)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {group.groupAge}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowDetailsModal(true);
                      }}
                      className="text-purple-600 hover:text-purple-900 mr-3"
                    >
                      View
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {hasMore && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => loadGroups()}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-gray-700">
            Showing {groups.length} groups
          </span>
          
          <button
            onClick={() => loadGroups(true)}
            disabled={!hasMore || loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Group Details Modal */}
      {showDetailsModal && selectedGroup && (
        <GroupDetailsModal
          group={selectedGroup}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedGroup(null);
          }}
          onAction={handleGroupAction}
        />
      )}
    </div>
  );
};

export default GroupManagement;