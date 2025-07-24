import React, { useState, useEffect } from 'react';
import { X, Settings, Plus } from 'lucide-react';
import { groupService } from '../../services/firebase/GroupService';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const GroupViewModal = ({ groupId, onClose }) => {
  const { currentUser } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  // Temporary mock data for UI development
  const mockMembers = [
    '/images/profile_1.png',
    '/images/profile_2.png',
    '/images/profile_3.png',
    '/images/profile_4.png',
    '/images/profile_5.png'
  ];

  const mockActivity = [
    { type: 'join', user: 'Jon', time: '20d' },
    { type: 'join', user: 'Dan', time: '20d' },
    { type: 'join', user: 'You', time: '20d' },
    { type: 'create', user: 'You', time: '20d' }
  ];

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupData = await groupService.getGroup(groupId);
        setGroup(groupData);
      } catch (error) {
        console.error('Error fetching group:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl">
          <div className="p-4">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-black" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Settings className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Group Info */}
        <div className="px-4 pt-6 pb-8 space-y-6">
          {/* Group Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 flex items-center justify-center text-4xl">
              {group?.emoji || '🏈'}
            </div>
          </div>

          {/* Member Avatars */}
          <div className="flex justify-center -space-x-2">
            {mockMembers.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Member ${index + 1}`}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
            ))}
          </div>

          {/* Group Name */}
          <h1 className="text-3xl font-bold text-center">
            {group?.name || 'Test'}
          </h1>

          {/* Add Expense Button */}
          <button className="w-full py-3 px-4 bg-blue-500 text-white rounded-full font-medium flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add an expense</span>
          </button>

          {/* Payment Status */}
          <div className="text-center">
            <h2 className="text-2xl font-bold">You're all paid up!</h2>
          </div>

          {/* Pooled Amount */}
          <div className="text-center">
            <div className="text-6xl font-bold">$0</div>
            <button className="text-blue-500 font-medium mt-2">
              How we do the math
            </button>
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Activity</h3>
              <button className="text-blue-500 font-medium">
                Group summary
              </button>
            </div>

            <div className="space-y-4">
              {mockActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src="/images/profile_1.png"
                    alt={activity.user}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">
                      {activity.type === 'create' 
                        ? `${activity.user} created the group`
                        : `${activity.user} joined the group`}
                    </p>
                    <p className="text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupViewModal;
