import React, { useState, useEffect } from 'react';
import { X, Settings, UserPlus, Trash2, Link, Users, Check, XIcon, Mail, Copy } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useGroup } from '../../contexts/GroupContext';
import { groupService } from '../../services/firebase/GroupService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { Button } from '../ui/button';
import InviteUsersModalEnhanced from './InviteUsersModalEnhanced';
import UserAvatar from '../ui/UserAvatar';
import { toast } from 'react-hot-toast';
import { generateInviteCodeLink } from '../../utils/urlHelpers';

const GroupViewModalEnhanced = ({ groupId, onClose }) => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('members'); // members | activity | requests
  const [showInviteOptions, setShowInviteOptions] = useState(false);

  const { currentUser } = useAuth();
  const { getGroup, deleteGroup, refreshGroups } = useGroup();

  const isOwner = group?.ownerId === currentUser?.uid;
  const isAdmin = isOwner || group?.adminIds?.includes(currentUser?.uid);

  useEffect(() => {
    // Generate invite link with invite code
    const inviteCode = groupId.substring(0, 8); // Simple invite code from group ID
    setInviteLink(generateInviteCodeLink(inviteCode));
  }, [groupId]);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!currentUser || !groupId) {
        setError('Invalid request');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const groupData = await getGroup(groupId);
        setGroup(groupData);
      } catch (error) {
        console.error('Error fetching group:', error);
        setError(error.message || 'Failed to load group');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, currentUser, getGroup]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setShowCopied(true);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleApproveRequest = async (userId) => {
    try {
      await groupService.approveJoinRequest(groupId, userId, currentUser.uid);
      toast.success('Join request approved!');
      
      // Refresh group data
      const updatedGroup = await getGroup(groupId);
      setGroup(updatedGroup);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await groupService.rejectJoinRequest(groupId, userId, currentUser.uid);
      toast.success('Join request rejected');
      
      // Refresh group data
      const updatedGroup = await getGroup(groupId);
      setGroup(updatedGroup);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'Failed to reject request');
    }
  };

  const handleDeleteGroup = async () => {
    if (!isOwner) {
      toast.error('Only the group owner can delete the group');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteGroup(groupId);
      toast.success('Group deleted successfully');
      await refreshGroups();
      onClose();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const pendingRequests = group?.joinRequests?.filter(r => r.status === 'pending') || [];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8">
          <div className="text-red-500">{error}</div>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 border-b border-gray-800">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-5xl bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-4 shadow-lg">
                {group?.emoji || '👥'}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {group?.name}
                </h2>
                <p className="text-gray-300 text-sm mt-1 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {group?.members?.length || 0} members
                  {group?.visibility === 'private' && (
                    <span className="bg-gray-800 px-2 py-0.5 rounded text-xs">Private</span>
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowInviteOptions(!showInviteOptions)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center space-x-2 shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Members</span>
              </Button>
              
              {isOwner && (
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Invite Options */}
            {showInviteOptions && (
              <div className="bg-gray-800/80 backdrop-blur rounded-xl p-4 mt-4 space-y-3 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-600/20 rounded-lg">
                      <Link className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-sm text-gray-200 font-medium">Share invite link</span>
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-600/50 text-sm px-3 py-1"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {showCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 break-all font-mono">{inviteLink}</div>
                </div>
                
                <div className="border-t border-gray-700 pt-3">
                  <Button
                    onClick={() => {
                      setShowInviteModal(true);
                      setShowInviteOptions(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Invite via Email</span>
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* Tabs */}
          <div className="flex bg-gray-800/50 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === 'members' 
                  ? 'text-white bg-gray-900/50 border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/30'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Members
              </div>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === 'activity' 
                  ? 'text-white bg-gray-900/50 border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/30'
              }`}
            >
              Activity
            </button>
            {isAdmin && pendingRequests.length > 0 && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 px-4 py-3 text-sm font-medium relative transition-all ${
                  activeTab === 'requests' 
                    ? 'text-white bg-gray-900/50 border-b-2 border-purple-500' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/30'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  Requests
                  <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                    {pendingRequests.length}
                  </span>
                </div>
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[50vh] p-6">
            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-3">
                {group?.members?.map((member) => (
                  <div key={member.uid} className="flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur rounded-xl hover:bg-gray-800/70 transition-all border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <UserAvatar user={member} size="sm" />
                      <div>
                        <p className="text-white font-medium">{member.displayName || member.email}</p>
                        {member.uid === group.ownerId && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <p className="text-xs text-purple-400">Group Owner</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-gray-600 mb-4">
                  <Users className="w-16 h-16" />
                </div>
                <p className="text-gray-400 text-lg">No activity yet</p>
                <p className="text-gray-500 text-sm mt-2">Group activities will appear here</p>
              </div>
            )}

            {/* Join Requests Tab */}
            {activeTab === 'requests' && isAdmin && (
              <div className="space-y-3">
                {pendingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="text-gray-600 mb-4">
                      <UserPlus className="w-16 h-16" />
                    </div>
                    <p className="text-gray-400 text-lg">No pending requests</p>
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request.userId} className="flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <UserAvatar user={request.user} size="sm" />
                        <div>
                          <p className="text-white font-medium">
                            {request.user.displayName || request.user.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleApproveRequest(request.userId)}
                          className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/50 px-3 py-1 text-sm"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request.userId)}
                          className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 px-3 py-1 text-sm"
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Settings Section */}
            {showSettings && isOwner && (
              <div className="mt-6 p-4 bg-red-900/10 rounded-xl border border-red-900/20">
                <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Danger Zone
                </h3>
                <p className="text-gray-400 text-sm mb-4">Once you delete a group, there is no going back.</p>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Group
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Users Modal */}
      {showInviteModal && (
        <InviteUsersModalEnhanced
          groupId={groupId}
          groupName={group?.name}
          onClose={() => setShowInviteModal(false)}
          onInvite={async () => {
            const updatedGroup = await getGroup(groupId);
            setGroup(updatedGroup);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-900 border border-red-900/50 rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-900/20 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-400">Delete Group</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold text-white">"{group?.name}"</span>? 
                This will permanently remove the group and all its data. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteGroup}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Group'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupViewModalEnhanced;