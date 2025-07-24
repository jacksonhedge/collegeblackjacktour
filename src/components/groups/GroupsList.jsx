import React from 'react';
import { useGroup } from '../../contexts/GroupContext';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GroupsList = () => {
  const { groups, loading, error } = useGroup();
  const navigate = useNavigate();

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

  const handleViewGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.id}
          className="bg-white dark:bg-gray-700 shadow rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {group.name || `Group ${group.id}`}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {group.members?.length || 0} members • ${group.wallet?.cashBalance?.toFixed(2) || '0.00'} balance
                </p>
              </div>
            </div>
            <button
              onClick={() => handleViewGroup(group.id)}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded
                       text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
