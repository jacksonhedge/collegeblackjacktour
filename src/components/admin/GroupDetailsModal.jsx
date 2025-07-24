import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Activity,
  DollarSign,
  Calendar,
  Shield,
  Hash,
  Link2,
  Settings,
  TrendingUp,
  UserCheck,
  Clock,
  Archive,
  BarChart3,
  AlertTriangle,
  Info
} from 'lucide-react';

const GroupDetailsModal = ({ group, onClose, onAction }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!group) return null;

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      'Sleeper': '🏈',
      'ESPN': '🏀',
      'Yahoo': '⚾',
      'DraftKings': '👑',
      'FanDuel': '⚡',
      'Bankroll': '💰',
      'Multiple': '🎯'
    };
    return icons[platform] || '👥';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Basic Information
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Group ID</span>
            <span className="text-sm font-medium text-gray-900">{group.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Name</span>
            <span className="text-sm font-medium text-gray-900">{group.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Invite Code</span>
            <span className="text-sm font-medium text-gray-900 font-mono">
              {group.inviteCode || 'None'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Privacy</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {group.privacy}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Created By</span>
            <span className="text-sm font-medium text-gray-900">
              {group.createdBy}
            </span>
          </div>
        </div>
      </div>

      {/* Platform Details */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Platform Information
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Type</span>
            <span className="text-sm font-medium text-gray-900">
              {group.type}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Platform</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getPlatformIcon(group.platform)}</span>
              <span className="text-sm font-medium text-gray-900">
                {group.platform}
              </span>
            </div>
          </div>
          {group.platformDetails?.leagueId && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">League ID</span>
              <span className="text-sm font-medium text-gray-900 font-mono">
                {group.platformDetails.leagueId}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              group.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : group.status === 'archived'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {group.status}
            </span>
          </div>
        </div>
      </div>

      {/* Time Information */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Timeline
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Created</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(group.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Last Active</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(group.lastActive)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Group Age</span>
            <span className="text-sm font-medium text-gray-900">{group.groupAge}</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Group Settings
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Auto Split</span>
            {group.settings.autoSplit ? (
              <span className="text-green-600">✓ Enabled</span>
            ) : (
              <span className="text-gray-400">✗ Disabled</span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Weekly Dues</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(group.settings.weeklyDues)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Split Percentage</span>
            <span className="text-sm font-medium text-gray-900">
              {group.settings.defaultSplitPercentage}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Guest Bets</span>
            {group.settings.allowGuestBets ? (
              <span className="text-green-600">✓ Allowed</span>
            ) : (
              <span className="text-gray-400">✗ Not Allowed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembersTab = () => (
    <div className="space-y-6">
      {/* Member Summary */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Member Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {group.memberCount}
            </p>
            <p className="text-sm text-gray-600">Total Members</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {group.activity.activeMembers}
            </p>
            <p className="text-sm text-gray-600">Active Members</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {Math.round((group.activity.activeMembers / group.memberCount) * 100)}%
            </p>
            <p className="text-sm text-gray-600">Activity Rate</p>
          </div>
        </div>
      </div>

      {/* Member List */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Top Members
        </h3>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          {group.memberDetails && group.memberDetails.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Member
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Balance
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {group.memberDetails.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.username}
                        </p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        member.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatCurrency(member.balance)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {member.joinedAt ? formatDate(member.joinedAt) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-gray-500">
              No member details available
            </p>
          )}
          {group.memberCount > 10 && (
            <div className="px-4 py-3 bg-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Showing top 10 of {group.memberCount} members
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      {/* Activity Overview */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Activity Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <Activity className="w-5 h-5 text-gray-600 mb-2" />
            <p className="text-xl font-bold text-gray-900">
              {group.activity.totalTransactions}
            </p>
            <p className="text-sm text-gray-600">Total Transactions</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <Clock className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-600">
              {group.activity.last24Hours}
            </p>
            <p className="text-sm text-gray-600">Last 24 Hours</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xl font-bold text-green-600">
              {group.activity.lastWeek}
            </p>
            <p className="text-sm text-gray-600">Last Week</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <DollarSign className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-xl font-bold text-purple-600">
              {formatCurrency(group.activity.totalVolume)}
            </p>
            <p className="text-sm text-gray-600">Total Volume</p>
          </div>
        </div>
      </div>

      {/* Transaction Types */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Transaction Breakdown
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-3">
            {Object.entries(group.activity.transactionTypes).map(([type, count]) => {
              const total = Object.values(group.activity.transactionTypes).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm capitalize text-gray-600">{type}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Last Transaction */}
      {group.activity.lastTransaction && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Last Transaction
          </h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                {group.activity.lastTransaction.type}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {formatCurrency(group.activity.lastTransaction.amount)}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {group.activity.lastTransaction.description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(group.activity.lastTransaction.createdAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderFinancialsTab = () => (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Financial Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <DollarSign className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(group.financials.totalPoolBalance)}
            </p>
            <p className="text-sm text-gray-600">Pool Balance</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <Users className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(group.financials.totalMemberBalances)}
            </p>
            <p className="text-sm text-gray-600">Member Balances</p>
          </div>
        </div>
      </div>

      {/* Pending Items */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Pending Items
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Pending Dues</span>
            <span className="text-sm font-medium text-orange-600">
              {formatCurrency(group.financials.pendingDues)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Upcoming Payouts</span>
            <span className="text-sm font-medium text-green-600">
              {formatCurrency(group.financials.upcomingPayouts)}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Health */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Financial Health
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            {group.financials.totalPoolBalance > 0 ? (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Healthy</p>
                  <p className="text-xs text-gray-600">
                    Group has sufficient pool balance
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Low Balance</p>
                  <p className="text-xs text-gray-600">
                    Group pool balance is empty
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'financials', label: 'Financials', icon: DollarSign }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
              {getPlatformIcon(group.platform)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
              <p className="text-sm text-gray-500">
                {group.type} • {group.platform}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'members' && renderMembersTab()}
          {activeTab === 'activity' && renderActivityTab()}
          {activeTab === 'financials' && renderFinancialsTab()}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <div className="flex gap-2">
            {group.status === 'archived' ? (
              <button
                onClick={() => onAction(group.id, 'unarchive')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Unarchive Group
              </button>
            ) : (
              <button
                onClick={() => onAction(group.id, 'archive')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Archive Group
              </button>
            )}
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsModal;