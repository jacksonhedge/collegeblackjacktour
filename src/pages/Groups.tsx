import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useGroup } from '../contexts/GroupContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import GroupViewModalEnhanced from '../components/groups/GroupViewModalEnhanced';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Group } from '../types/group';

const Groups: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { groups, loading, error } = useGroup();
  const navigate = useNavigate();

  const handleCreateGroup = () => {
    navigate('/groups/create');
  };

  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner color="purple" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-purple-500" />
          <h1 className="text-2xl font-bold text-white">My Groups</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleCreateGroup}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </Button>
          <Button
            onClick={() => navigate('/groups/join')}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Join Group</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Groups Grid */}
      {!error && groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-gray-400">You haven't joined any groups yet</p>
          <Button
            onClick={handleCreateGroup}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Create Your First Group
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group: Group) => (
            <Card
              key={group.id}
              className="bg-gray-800/50 border-purple-500/20 hover:border-purple-500/40 
                cursor-pointer transition-all duration-200"
              onClick={() => handleGroupClick(group.id)}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{group.emoji || '👥'}</span>
                  <h3 className="text-xl font-semibold text-white">{group.name}</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Members</span>
                    <span className="text-sm text-white">{group.members.length}</span>
                  </div>
                  {group.wallet && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Balance</span>
                      <span className="text-sm text-white">
                        ${group.wallet.cashBalance.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {group.type === 'league' && group.leagueInfo && (
                  <div className="pt-2 border-t border-gray-700">
                    <span className="text-xs text-purple-400 capitalize">
                      {group.leagueInfo.platform} League Group
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Group View Modal */}
      {selectedGroupId && (
        <GroupViewModalEnhanced
          groupId={selectedGroupId}
          onClose={() => setSelectedGroupId(null)}
        />
      )}
    </div>
  );
};

export default Groups;
