import React, { useState, useEffect } from 'react';
import { userManagementService } from '../../services/firebase/UserManagementService';
import UserDetailsModal from './UserDetailsModal';
import { CardModern, CardHeaderModern, CardTitleModern, CardContentModern } from '../ui/card-modern';
import { ButtonModern } from '../ui/button-modern';
import { InputModern, SearchInputModern } from '../ui/input-modern';
import { AlertModal } from '../ui/modal-modern';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  RefreshCw,
  UserCheck,
  UserX,
  Shield,
  Clock,
  TrendingUp,
  Eye,
  Ban,
  Unlock,
  Trash2,
  Edit,
  Star,
  Award
} from 'lucide-react';

const UserManagementModern = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadUsers();
    loadStatistics();
  }, [filterStatus, sortBy]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await userManagementService.getUsersPaginated(50);
      setUsers(result.users);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await userManagementService.getUserStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      loadUsers();
      return;
    }
    // Search implementation
  };

  const handleUserAction = async (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmUserAction = async () => {
    try {
      switch (actionType) {
        case 'suspend':
          await userManagementService.suspendUser(selectedUser.id, 'Suspended by admin');
          break;
        case 'activate':
          await userManagementService.activateUser(selectedUser.id);
          break;
        case 'delete':
          await userManagementService.deleteUser(selectedUser.id);
          break;
      }
      setShowActionModal(false);
      loadUsers();
    } catch (err) {
      console.error(`Error performing ${actionType}:`, err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
      suspended: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: XCircle },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Clock },
      inactive: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400', icon: UserX }
    };
    
    const badge = badges[status] || badges.inactive;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {change && (
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );

  const UserRow = ({ user }) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{user.displayName || 'No name'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {getStatusBadge(user.status || 'active')}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <p className="text-gray-900 dark:text-white font-medium">${user.balance?.toFixed(2) || '0.00'}</p>
          <p className="text-gray-600 dark:text-gray-400">Lifetime: ${user.lifetimeEarnings?.toFixed(2) || '0.00'}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <ButtonModern
            size="sm"
            variant="ghost"
            icon={Eye}
            onClick={() => {
              setSelectedUser(user);
              setShowDetailsModal(true);
            }}
          >
            View
          </ButtonModern>
          
          <div className="relative group">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              {user.status === 'active' ? (
                <button
                  onClick={() => handleUserAction(user, 'suspend')}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Suspend User
                </button>
              ) : (
                <button
                  onClick={() => handleUserAction(user, 'activate')}
                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 flex items-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Activate User
                </button>
              )}
              <button
                onClick={() => handleUserAction(user, 'delete')}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            User Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor all platform users
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ButtonModern variant="outline" icon={Download}>
            Export
          </ButtonModern>
          <ButtonModern icon={RefreshCw} onClick={loadUsers}>
            Refresh
          </ButtonModern>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            title="Total Users"
            value={statistics.total.toLocaleString()}
            change={5.2}
            color="purple"
          />
          <StatCard
            icon={UserCheck}
            title="Active Users"
            value={statistics.active.toLocaleString()}
            change={2.1}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="New This Week"
            value={statistics.newThisWeek || 0}
            change={12.5}
            color="blue"
          />
          <StatCard
            icon={DollarSign}
            title="Avg. Balance"
            value={`$${(statistics.avgBalance || 0).toFixed(2)}`}
            color="yellow"
          />
        </div>
      )}

      {/* Filters and Search */}
      <CardModern>
        <CardContentModern className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInputModern
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, email, or ID..."
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none transition-colors"
              >
                <option value="createdAt">Newest First</option>
                <option value="lastActive">Recently Active</option>
                <option value="balance">Highest Balance</option>
                <option value="displayName">Name (A-Z)</option>
              </select>
              
              <ButtonModern onClick={handleSearch}>
                Search
              </ButtonModern>
            </div>
          </div>
        </CardContentModern>
      </CardModern>

      {/* Users Table */}
      <CardModern>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {users.length} of {statistics?.total || 0} users
            </p>
            
            <div className="flex items-center gap-2">
              <ButtonModern
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </ButtonModern>
              
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                Page {page}
              </span>
              
              <ButtonModern
                variant="outline"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                disabled={!hasMore}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </ButtonModern>
            </div>
          </div>
        </div>
      </CardModern>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowDetailsModal(false)}
          onUpdate={loadUsers}
        />
      )}

      {/* Action Confirmation Modal */}
      <AlertModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        onConfirm={confirmUserAction}
        type={actionType === 'delete' ? 'error' : 'warning'}
        title={`${actionType?.charAt(0).toUpperCase() + actionType?.slice(1)} User`}
        description={`Are you sure you want to ${actionType} ${selectedUser?.displayName || selectedUser?.email}? This action ${actionType === 'delete' ? 'cannot be undone' : 'can be reversed later'}.`}
        confirmText={actionType?.charAt(0).toUpperCase() + actionType?.slice(1)}
      />
    </div>
  );
};

export default UserManagementModern;