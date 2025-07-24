import React, { useState } from 'react';
import { useGroup } from '../../contexts/GroupContext';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';
import type { Group } from '../../types/group';

export const CreateGroupForm: React.FC = () => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createGroup } = useGroup();
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (!currentUser) {
      toast.error('You must be logged in to create a group');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const groupData: Partial<Group> = {
        name: groupName.trim(),
        description: description.trim(),
        dateCreated: new Date().toISOString(),
        ownerId: currentUser.uid,
        memberIds: [currentUser.uid],
        visibility: 'private',
        isHidden: false,
        status: 'active',
        type: 'default'
      };

      await createGroup(groupData);
      
      // Reset form
      setGroupName('');
      setDescription('');
      
      toast.success('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label 
          htmlFor="groupName" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Group Name
        </label>
        <input
          type="text"
          id="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                   shadow-sm focus:border-blue-500 focus:ring-blue-500 
                   dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="Enter group name"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label 
          htmlFor="description" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                   shadow-sm focus:border-blue-500 focus:ring-blue-500 
                   dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="Enter group description"
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center py-2 px-4 border border-transparent 
                   rounded-md shadow-sm text-sm font-medium text-white 
                   ${isSubmitting 
                     ? 'bg-gray-400 cursor-not-allowed' 
                     : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                   }`}
      >
        {isSubmitting ? 'Creating...' : 'Create Group'}
      </button>
    </form>
  );
};
