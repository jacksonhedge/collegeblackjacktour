import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useGroup } from '../contexts/GroupContext';
import { Input } from '../components/ui/input';
import { toast } from 'react-hot-toast';
import type { Group } from '../types/group';

const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createGroup } = useGroup();
  const [groupName, setGroupName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      toast.error('Please sign in to create a group');
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a group');
      toast.error('Please sign in to create a group');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError('');

    if (!groupName.trim()) {
      setError('Group name is required');
      setIsLoading(false);
      return;
    }

    try {
      const groupData: Partial<Group> = {
        name: groupName.trim(),
        description: '',
        dateCreated: new Date().toISOString(),
        ownerId: currentUser.uid,
        memberIds: [currentUser.uid],
        visibility: 'private',
        isHidden: false,
        status: 'active',
        type: 'default',
        emoji: '👥'
      };

      const groupId = await createGroup(groupData);
      toast.success('Group created successfully!');
      navigate(`/groups/${groupId}`);
    } catch (err: any) {
      console.error('Error creating group:', err);
      const errorMessage = err.message || 'Failed to create group. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return null; // Don't render anything if not logged in
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create a New Group</h1>
      
      <form onSubmit={handleCreateGroup} className="space-y-6 max-w-md">
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-white mb-2">
            Enter Group Name
          </label>
          <Input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            required
            className="bg-gray-900/40 text-white placeholder-gray-400"
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-400">
            This will be the display name for your group
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !groupName.trim()}
          className={`w-full py-2 px-4 rounded-md transition-colors
            ${isLoading || !groupName.trim()
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
            } text-white font-medium`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating...</span>
            </div>
          ) : (
            'Create Group'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;
