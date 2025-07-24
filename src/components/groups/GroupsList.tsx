import React from 'react';
import { useGroup } from '../../contexts/GroupContext';
import { Users, Crown, Shield, Clock, UserCheck } from 'lucide-react';
import type { Group, MemberStatus } from '../../types/group';
import { useNavigate } from 'react-router-dom';

export const GroupsList: React.FC = () => {
  const { groups, loading, error } = useGroup();
  const navigate = useNavigate();

  const getStatusIcon = (status: MemberStatus) => {
    switch (status) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'member':
        return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'invited':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: MemberStatus) => {
    switch (status) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      case 'invited':
        return 'Invited';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadgeColor = (status: MemberStatus) => {
    switch (status) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'invited':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No groups</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new group.
        </p>
      </div>
    );
  }

  const handleViewGroup = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  const getCurrentUserStatus = (group: Group): MemberStatus => {
    // This would need to be implemented based on current user context
    // For now, we'll assume member status
    return 'member';
  };

  return (
    <div className="space-y-4">
      {groups.map((group: Group) => {
        const userStatus = getCurrentUserStatus(group);
        const activeMemberCount = group.members?.filter(m => m.status === 'member' || m.status === 'admin' || m.status === 'owner').length || 0;
        const pendingInviteCount = group.pendingMembers?.length || 0;
        
        return (
          <div
            key={group.id}
            className="bg-white dark:bg-gray-700 shadow rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="text-2xl">{group.emoji || '👥'}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {group.name || `Group ${group.id}`}
                    </h3>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(userStatus)}`}>
                      {getStatusIcon(userStatus)}
                      <span className="ml-1">{getStatusText(userStatus)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{activeMemberCount} active</span>
                    </span>
                    {pendingInviteCount > 0 && (
                      <span className="flex items-center space-x-1 text-orange-500">
                        <Clock className="w-3 h-3" />
                        <span>{pendingInviteCount} pending</span>
                      </span>
                    )}
                    <span>${group.wallet?.cashBalance?.toFixed(2) || '0.00'} balance</span>
                  </div>
                  {group.description && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                      {group.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleViewGroup(group.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded
                           text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View
                </button>
                {userStatus === 'invited' && (
                  <button
                    onClick={() => {/* Handle accept invitation */}}
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Accept
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
