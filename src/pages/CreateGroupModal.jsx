import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, Search, Plus, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';
import { groupService } from '../services/firebase/GroupService.ts';
import { useGroup } from '../contexts/GroupContext';
import InviteUsersModalEnhanced from '../components/groups/InviteUsersModalEnhanced';

const CreateGroupModal = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const { refreshGroups } = useGroup();
  const [step, setStep] = useState(1);
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    type: 'general',
    emoji: '👥',
    members: [],
    admins: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [createdGroupId, setCreatedGroupId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Mock users for demonstration
  const mockUsers = [
    { id: '1', name: 'Sarah Johnson', username: '@sarah_j', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
    { id: '2', name: 'Mike Chen', username: '@mikechen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' },
    { id: '3', name: 'Emily Davis', username: '@emilyd', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily' },
    { id: '4', name: 'Alex Rivera', username: '@arivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
    { id: '5', name: 'Jordan Lee', username: '@jlee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan' },
    { id: '6', name: 'Taylor Swift', username: '@tswift', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=taylor' },
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleNext = async () => {
    if (step === 1 && groupData.name) {
      setStep(2);
    } else if (step === 2) {
      setIsCreating(true);
      try {
        // Create the group
        console.log('Creating group:', groupData);
        console.log('Current user:', currentUser);
        
        // Ensure we have a user ID
        if (!currentUser || (!currentUser.id && !currentUser.uid)) {
          throw new Error('User not authenticated');
        }
        
        const newGroup = await groupService.createGroup(groupData, currentUser);
        
        if (newGroup && newGroup.id) {
          toast.success('Group created successfully!');
          
          // Refresh the groups list
          await refreshGroups();
          
          // Don't show invite modal for now, just navigate
          navigate('/groups');
        } else {
          toast.error('Failed to create group');
        }
      } catch (error) {
        console.error('Error creating group:', error);
        toast.error(error.message || 'Failed to create group');
      } finally {
        setIsCreating(false);
      }
    }
  };

  const canProceed = step === 1 ? groupData.name.trim() !== '' : true; // Allow creating without members

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => navigate(-1)}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md ${
        isDark ? 'bg-gray-900' : 'bg-white'
      } rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className={`p-4 border-b ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-gray-700 text-gray-400' 
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {step === 1 ? 'Create Group' : 'Add Members'}
              </h2>
            </div>
            {step > 1 && (
              <button
                onClick={() => setStep(1)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Back
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupData.name}
                  onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                  placeholder="Weekend Warriors, Fantasy Squad..."
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  autoFocus
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Group Icon
                </label>
                <div className="space-y-3">
                  {/* Emoji Selection Grid */}
                  <div className="grid grid-cols-8 gap-2">
                    {['👥', '🏈', '🏀', '⚾', '⚽', '🏒', '🎯', '💰', '🎲', '🃏', '🎰', '🏆', '💎', '🚀', '🔥', '⭐'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setGroupData({ ...groupData, emoji })}
                        className={`p-2 text-2xl rounded-lg transition-all ${
                          groupData.emoji === emoji
                            ? 'bg-purple-600 ring-2 ring-purple-500 ring-offset-2' + (isDark ? ' ring-offset-gray-900' : ' ring-offset-white')
                            : isDark
                              ? 'bg-gray-800 hover:bg-gray-700'
                              : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Image Upload (disabled for now) */}
                  <div className={`p-3 rounded-lg border-2 border-dashed ${
                    isDark ? 'border-gray-700' : 'border-gray-300'
                  }`}>
                    <p className={`text-xs text-center ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Custom image upload coming soon
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description (Optional)
                </label>
                <textarea
                  value={groupData.description}
                  onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                  placeholder="What's this group about?"
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Group Type
                </label>
                <select 
                  value={groupData.type}
                  onChange={(e) => setGroupData({ ...groupData, type: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                >
                  <option value="general">General Group</option>
                  <option value="sleeper">Sleeper League</option>
                  <option value="espn">ESPN League</option>
                  <option value="yahoo">Yahoo League</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or username"
                  className={`block w-full pl-10 pr-3 py-3 rounded-lg text-sm transition-colors ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } border focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="pb-2">
                  <p className={`text-xs font-medium mb-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Selected ({selectedUsers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        <img src={user.avatar} alt={user.name} className="w-4 h-4 rounded-full" />
                        <span>{user.name}</span>
                        <button
                          onClick={() => toggleUserSelection(user)}
                          className="ml-1 hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User List */}
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filteredUsers.map(user => {
                  const isSelected = selectedUsers.some(u => u.id === user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleUserSelection(user)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isSelected
                          ? isDark 
                            ? 'bg-purple-900/50 border-purple-600' 
                            : 'bg-purple-50 border-purple-300'
                          : isDark
                            ? 'hover:bg-gray-800'
                            : 'hover:bg-gray-50'
                      } border ${isDark ? 'border-gray-800' : 'border-transparent'}`}
                    >
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user.name}
                        </p>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {user.username}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="p-1 bg-purple-600 rounded-full">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <button
            onClick={handleNext}
            disabled={!canProceed || isCreating}
            className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center ${
              canProceed && !isCreating
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </div>
            ) : (
              step === 1 ? 'Next' : 'Create Group'
            )}
          </button>
        </div>
      </div>
      
      {/* Invite Modal */}
      {showInviteModal && createdGroupId && (
        <InviteUsersModalEnhanced
          groupId={createdGroupId}
          groupName={groupData.name}
          onClose={() => {
            setShowInviteModal(false);
            navigate('/groups');
          }}
          onInvite={() => {
            setShowInviteModal(false);
            navigate('/groups');
          }}
        />
      )}
    </div>
  );
};

export default CreateGroupModal;