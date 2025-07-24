import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Users, 
  DollarSign, 
  Trophy,
  TrendingUp,
  Bitcoin,
  Link2,
  Copy,
  Check,
  Bell,
  UserPlus,
  Shield,
  LogOut,
  Trash2,
  Edit2,
  Camera,
  Clock,
  CreditCard,
  Sparkles,
  Crown,
  Lock,
  Unlock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../services/firebase/GroupService';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import MemberInviteModal from './MemberInviteModal';
import { toast } from 'react-hot-toast';

const EnhancedGroupView = ({ groupId, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('members'); // members, funds, rankings
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [payoutSettings, setPayoutSettings] = useState({
    automatic: false,
    schedule: 'weekly',
    threshold: 100,
    method: 'equal'
  });

  const isOwner = group?.ownerId === currentUser?.uid;
  const isAdmin = isOwner || group?.adminIds?.includes(currentUser?.uid);

  // Available emojis for group icon
  const availableEmojis = [
    '👥', '🏆', '💰', '🎯', '🚀', '🔥', '⚡', '🌟', '💎', '🎲',
    '🏈', '🏀', '⚽', '🎾', '⛳', '🥊', '🎮', '🎪', '🎨', '🎭'
  ];

  useEffect(() => {
    fetchGroup();
    generateInviteLink();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const groupData = await groupService.getGroup(groupId);
      setGroup(groupData);
      setJoinRequests(groupData.joinRequests?.filter(r => r.status === 'pending') || []);
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const inviteCode = Math.random().toString(36).substring(2, 15);
    setInviteLink(`${baseUrl}/invite/${groupId}/${inviteCode}`);
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast.success('Invite link copied!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleApproveRequest = async (userId) => {
    try {
      await groupService.approveJoinRequest(groupId, userId, currentUser.uid);
      toast.success('Member approved!');
      fetchGroup();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await groupService.rejectJoinRequest(groupId, userId, currentUser.uid);
      toast.success('Request rejected');
      fetchGroup();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleUpgradeGroup = () => {
    // Navigate to upgrade page or show upgrade modal
    navigate(`/groups/${groupId}/upgrade`);
  };

  const handleEmojiChange = async (emoji) => {
    try {
      await groupService.updateGroup(groupId, { emoji });
      setGroup({ ...group, emoji });
      setShowEmojiPicker(false);
      toast.success('Group icon updated!');
    } catch (error) {
      console.error('Error updating group icon:', error);
      toast.error('Failed to update group icon');
    }
  };

  const handleNameChange = async () => {
    if (newGroupName && newGroupName !== group?.name) {
      try {
        await groupService.updateGroup(groupId, { name: newGroupName });
        setGroup({ ...group, name: newGroupName });
        toast.success('Group name updated!');
      } catch (error) {
        console.error('Error updating group name:', error);
        toast.error('Failed to update group name');
      }
    }
    setEditingName(false);
  };

  const handlePayoutSettingsChange = async (newSettings) => {
    try {
      await groupService.updateGroup(groupId, { payoutSettings: newSettings });
      setPayoutSettings(newSettings);
      toast.success('Payout settings updated!');
    } catch (error) {
      console.error('Error updating payout settings:', error);
      toast.error('Failed to update payout settings');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTotalFunds = () => {
    if (!group?.wallet) return 0;
    return Object.values(group.wallet.memberBalances || {}).reduce((sum, balance) => sum + balance, 0);
  };

  const getFantasyRankings = () => {
    // Return empty array - real data would come from league integration
    return [];
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-t-2xl`}>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className={`${isDark ? 'bg-gray-900/95 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl'} w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col shadow-2xl border ${isDark ? 'border-gray-800/50' : 'border-gray-200/50'}`}>
          {/* Header */}
          <div className={`relative flex items-center justify-between p-6 ${isDark ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' : 'bg-gradient-to-r from-gray-50/50 to-gray-100/50'} border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} backdrop-blur-md`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? 'white' : 'black'} 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }} />
            </div>
            
            <div className="relative flex items-center gap-4">
              {/* Group Icon with Edit */}
              <div className="relative group">
                <div className={`text-4xl p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} transition-all duration-200 ${isAdmin ? 'hover:scale-105' : ''}`}>
                  {group?.emoji || '👥'}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowEmojiPicker(true)}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-purple-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-purple-700"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div>
                {/* Group Name with Edit */}
                <div className="flex items-center gap-2">
                  {editingName ? (
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onBlur={() => {
                        // Save name change
                        setEditingName(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          // Save name change
                          setEditingName(false);
                        }
                      }}
                      className={`text-2xl font-bold bg-transparent border-b-2 border-purple-600 outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
                      autoFocus
                    />
                  ) : (
                    <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {group?.name}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setNewGroupName(group?.name || '');
                            setEditingName(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500 hover:text-purple-600" />
                        </button>
                      )}
                    </h2>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-1">
                  <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Users className="w-3 h-3" />
                    {group?.members?.length || 0} members
                  </p>
                  <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Clock className="w-3 h-3" />
                    Created {new Date(group?.dateCreated).toLocaleDateString()}
                  </p>
                  {isOwner && (
                    <span className="text-xs bg-purple-600/20 text-purple-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Owner
                    </span>
                  )}
                  {isAdmin && !isOwner && (
                    <span className="text-xs bg-blue-600/20 text-blue-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="relative flex items-center gap-3">
              {/* Upgrade Button with Glass Effect */}
              <button
                onClick={handleUpgradeGroup}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 backdrop-blur-sm text-white rounded-xl font-medium hover:from-yellow-600/80 hover:to-orange-600/80 transition-all shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade
              </button>
              
              {/* Settings */}
              {isAdmin && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2.5 rounded-xl backdrop-blur-sm transition-all ${isDark ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-white/50 hover:bg-gray-100/50'} border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
              
              {/* Close */}
              <button
                onClick={onClose}
                className={`p-2.5 rounded-xl backdrop-blur-sm transition-all ${isDark ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-white/50 hover:bg-gray-100/50'} border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Join Requests Banner with Glass Effect */}
          {isAdmin && joinRequests.length > 0 && (
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm" />
              <div className="relative border-b border-purple-600/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600/20 rounded-lg backdrop-blur-sm">
                      <Bell className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-purple-600">
                        {joinRequests.length} pending join request{joinRequests.length !== 1 ? 's' : ''}
                      </span>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        New members waiting for approval
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('members')}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium px-3 py-1 rounded-lg hover:bg-purple-600/10 transition-colors"
                  >
                    View Requests
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs with Glass Effect */}
          <div className={`flex border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} backdrop-blur-sm`}>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all ${
                activeTab === 'members'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-600/5'
                  : isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/30'
              }`}
            >
              <Users className="w-4 h-4" />
              Members
              {isAdmin && joinRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                  {joinRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('funds')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all ${
                activeTab === 'funds'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-600/5'
                  : isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/30'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Funds
            </button>
            {group?.type === 'fantasy' && (
              <button
                onClick={() => setActiveTab('rankings')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all ${
                  activeTab === 'rankings'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-600/5'
                    : isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/30'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Rankings
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-600/5'
                    : isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/30'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                {/* Invite Section with Glass Effect */}
                <div className={`p-5 rounded-xl backdrop-blur-sm ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'} border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Invite Members
                      </h3>
                      <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Share this link to invite new members
                      </p>
                    </div>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm text-white rounded-lg text-sm hover:from-purple-700/80 hover:to-pink-700/80 transition-all shadow-md"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Members
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg backdrop-blur-sm ${
                      isDark ? 'bg-gray-700/50 border border-gray-600/50' : 'bg-white/50 border border-gray-300/50'
                    }`}>
                      <Link2 className="w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className={`flex-1 bg-transparent text-sm outline-none ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      />
                    </div>
                    <button
                      onClick={copyInviteLink}
                      className={`p-2.5 rounded-lg backdrop-blur-sm transition-all ${
                        linkCopied 
                          ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                          : isDark 
                            ? 'bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50' 
                            : 'bg-white/50 hover:bg-gray-100/50 border border-gray-300/50'
                      }`}
                    >
                      {linkCopied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Join Requests */}
                {isAdmin && joinRequests.length > 0 && (
                  <div>
                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Join Requests
                    </h3>
                    <div className="space-y-3">
                      {joinRequests.map(request => (
                        <div
                          key={request.userId}
                          className={`flex items-center justify-between p-4 rounded-xl backdrop-blur-sm ${
                            isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
                          } border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} hover:scale-[1.02] transition-transform`}
                        >
                          <div className="flex items-center gap-3">
                            {request.user.photoURL ? (
                              <img 
                                src={request.user.photoURL} 
                                alt="" 
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                                {request.user.displayName?.[0] || '?'}
                              </div>
                            )}
                            <div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {request.user.displayName}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {request.user.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveRequest(request.userId)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.userId)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Members List */}
                <div>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Current Members
                  </h3>
                  <div className="space-y-3">
                    {group?.members?.map(member => (
                      <div
                        key={member.uid || member.id}
                        className={`flex items-center justify-between p-4 rounded-xl backdrop-blur-sm ${
                          isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
                        } border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} hover:scale-[1.02] transition-transform`}
                      >
                        <div className="flex items-center gap-3">
                          {member.photoURL ? (
                            <img 
                              src={member.photoURL} 
                              alt="" 
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                              {member.displayName?.[0] || member.firstName?.[0] || '?'}
                            </div>
                          )}
                          <div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {member.displayName || `${member.firstName} ${member.lastName}`}
                              {member.uid === group.ownerId && (
                                <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                                  Owner
                                </span>
                              )}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {member.username || member.email}
                            </div>
                          </div>
                        </div>
                        {isOwner && member.uid !== currentUser.uid && (
                          <button
                            className={`p-2 rounded-lg ${
                              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                            }`}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Funds Tab */}
            {activeTab === 'funds' && (
              <div className="space-y-6">
                {/* Total Funds with Glass Effect */}
                <div className={`p-8 rounded-xl backdrop-blur-sm ${isDark ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30' : 'bg-gradient-to-br from-purple-100/50 to-pink-100/50'} border ${isDark ? 'border-purple-700/30' : 'border-purple-200/50'} text-center relative overflow-hidden`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, ${isDark ? 'white' : 'black'} 2px, transparent 2px)`,
                      backgroundSize: '40px 40px'
                    }} />
                  </div>
                  
                  <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 text-purple-600 rounded-full text-sm font-medium mb-3">
                      <DollarSign className="w-4 h-4" />
                      Group Treasury
                    </div>
                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Total Group Funds
                    </h3>
                    <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {formatCurrency(calculateTotalFunds())}
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pooled across {group?.members?.length || 0} members
                    </p>
                  </div>
                </div>

                {/* Member Balances */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Member Balances
                    </h3>
                    {isAdmin && (
                      <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        Manage Payouts
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {group?.members?.map((member, index) => {
                      const balance = group.wallet?.memberBalances?.[member.uid || member.id] || 0;
                      const percentage = calculateTotalFunds() > 0 ? (balance / calculateTotalFunds()) * 100 : 0;
                      return (
                        <div
                          key={member.uid || member.id}
                          className={`relative p-4 rounded-xl backdrop-blur-sm ${
                            isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
                          } border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} hover:scale-[1.02] transition-transform`}
                        >
                          {/* Progress Bar Background */}
                          <div className="absolute inset-0 rounded-xl overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-600/10 to-transparent"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {member.photoURL ? (
                                  <img 
                                    src={member.photoURL} 
                                    alt="" 
                                    className="w-10 h-10 rounded-full border-2 border-purple-600/20"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                                    {member.displayName?.[0] || member.firstName?.[0] || '?'}
                                  </div>
                                )}
                                {index < 3 && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    {index + 1}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {member.displayName || `${member.firstName} ${member.lastName}`}
                                </div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {member.username || member.email}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(balance)}
                              </div>
                              {percentage > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                                    <div 
                                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-purple-600 font-medium">
                                    {percentage.toFixed(0)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Investment Options with Glass Effect */}
                <div className={`relative p-8 rounded-xl backdrop-blur-sm overflow-hidden ${
                  isDark ? 'bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border-orange-700/30' : 'bg-gradient-to-br from-orange-100/30 to-yellow-100/30 border-orange-200/50'
                } border-2 border-dashed`}>
                  {/* Animated Background */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 animate-pulse" />
                  </div>
                  
                  <div className="relative text-center">
                    <div className="inline-flex p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full mb-4">
                      <Bitcoin className="w-12 h-12 text-orange-500" />
                    </div>
                    <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Ready to grow your funds?
                    </h4>
                    <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Unlock powerful investment features including stocks, crypto, and high-yield savings
                    </p>
                    <button
                      onClick={handleUpgradeGroup}
                      className="group relative px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <span className="relative z-10">Explore Investment Options</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rankings Tab (Fantasy Leagues) */}
            {activeTab === 'rankings' && group?.type === 'fantasy' && (
              <div className="space-y-6">
                {/* League Info */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {group.leagueInfo?.leagueName || 'Fantasy League'}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Week 10 • {group.leagueInfo?.platform || 'Platform'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Prize Pool
                      </div>
                      <div className="text-xl font-bold text-purple-600">
                        {formatCurrency(1000)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rankings Table */}
                <div>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Current Standings
                  </h3>
                  {getFantasyRankings().length > 0 ? (
                    <div className={`overflow-hidden rounded-lg border ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <table className="w-full">
                        <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                          <tr>
                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Rank
                            </th>
                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Team
                            </th>
                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Record
                            </th>
                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Points
                            </th>
                            <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Est. Payout
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {getFantasyRankings().map((team) => (
                            <tr key={team.rank} className={isDark ? 'bg-gray-900' : 'bg-white'}>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  {team.rank <= 3 && (
                                    <Trophy className={`w-4 h-4 mr-2 ${
                                      team.rank === 1 ? 'text-yellow-500' :
                                      team.rank === 2 ? 'text-gray-400' :
                                      'text-orange-600'
                                    }`} />
                                  )}
                                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {team.rank}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {team.team}
                                  </div>
                                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {team.owner}
                                  </div>
                                </div>
                              </td>
                              <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {team.wins}-{team.losses}
                              </td>
                              <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {team.points}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {team.payout > 0 ? (
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(team.payout)}
                                  </span>
                                ) : (
                                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                    -
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={`p-8 text-center rounded-lg border ${
                      isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No league data available yet. Rankings will appear once the league is connected.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Admin Tab */}
            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-6">
                {/* Admin Dashboard Header */}
                <div className={`p-6 rounded-xl backdrop-blur-sm ${isDark ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30' : 'bg-gradient-to-r from-purple-100/50 to-pink-100/50'} border ${isDark ? 'border-purple-700/30' : 'border-purple-200/50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-purple-600/20 rounded-lg backdrop-blur-sm">
                      <Crown className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Admin Dashboard
                      </h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage your group settings and members
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm`}>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Members</p>
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{group?.members?.length || 0}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm`}>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Funds</p>
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(calculateTotalFunds())}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm`}>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending Requests</p>
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{joinRequests.length}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Manage Members */}
                    <button 
                      onClick={() => setActiveTab('members')}
                      className={`p-4 rounded-xl backdrop-blur-sm ${isDark ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-gray-100/50 hover:bg-gray-200/50'} border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} transition-all text-left`}
                    >
                      <Users className="w-5 h-5 text-purple-500 mb-2" />
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Manage Members</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Add, remove, or promote members</p>
                    </button>

                    {/* Payout Settings */}
                    <div className={`p-4 rounded-xl backdrop-blur-sm ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'} border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                      <CreditCard className="w-5 h-5 text-purple-500 mb-2" />
                      <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Automatic Payouts</h4>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {payoutSettings.automatic ? `${payoutSettings.schedule} payouts` : 'Manual payouts'}
                        </p>
                        <button
                          onClick={() => setPayoutSettings({...payoutSettings, automatic: !payoutSettings.automatic})}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            payoutSettings.automatic ? 'bg-purple-600' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            payoutSettings.automatic ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Group Privacy */}
                    <button className={`p-4 rounded-xl backdrop-blur-sm ${isDark ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-gray-100/50 hover:bg-gray-200/50'} border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} transition-all text-left`}>
                      <Lock className="w-5 h-5 text-purple-500 mb-2" />
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Privacy Settings</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Control who can join and view</p>
                    </button>

                    {/* Transfer Ownership */}
                    {isOwner && (
                      <button className={`p-4 rounded-xl backdrop-blur-sm ${isDark ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-gray-100/50 hover:bg-gray-200/50'} border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} transition-all text-left`}>
                        <Crown className="w-5 h-5 text-purple-500 mb-2" />
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Transfer Ownership</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Make another member the owner</p>
                      </button>
                    )}
                  </div>
                </div>

                {/* Member Permissions */}
                <div>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Member Permissions</h3>
                  <div className={`p-4 rounded-xl backdrop-blur-sm ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'} border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                    <div className="space-y-3">
                      {group?.members?.slice(0, 3).map(member => (
                        <div key={member.uid || member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {member.photoURL ? (
                              <img src={member.photoURL} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                {member.displayName?.[0] || member.firstName?.[0] || '?'}
                              </div>
                            )}
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {member.displayName || `${member.firstName} ${member.lastName}`}
                            </span>
                          </div>
                          <select
                            className={`text-sm px-2 py-1 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                            defaultValue={member.uid === group.ownerId ? 'owner' : group.adminIds?.includes(member.uid) ? 'admin' : 'member'}
                            disabled={member.uid === group.ownerId}
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Emoji Picker Modal */}
          {showEmojiPicker && (
            <div className="absolute top-24 left-6 z-50">
              <div className={`p-4 rounded-xl shadow-2xl ${isDark ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-xl border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Choose Group Icon</h3>
                <div className="grid grid-cols-5 gap-2">
                  {availableEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        // Update group emoji
                        setShowEmojiPicker(false);
                        toast.success('Group icon updated!');
                      }}
                      className={`text-2xl p-2 rounded-lg hover:scale-110 transition-transform ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Settings Panel */}
          {showSettings && (
            <div className={`absolute top-20 right-6 w-80 rounded-xl shadow-2xl ${
              isDark ? 'bg-gray-800/95' : 'bg-white/95'
            } backdrop-blur-xl border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
              <div className="p-4">
                <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Group Settings</h3>
                
                {/* Automatic Payouts Section */}
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-500" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Automatic Payouts</span>
                      </div>
                      <button
                        onClick={() => setPayoutSettings({...payoutSettings, automatic: !payoutSettings.automatic})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          payoutSettings.automatic ? 'bg-purple-600' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          payoutSettings.automatic ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    {payoutSettings.automatic && (
                      <div className="space-y-2 mt-3">
                        <div>
                          <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Schedule</label>
                          <select
                            value={payoutSettings.schedule}
                            onChange={(e) => setPayoutSettings({...payoutSettings, schedule: e.target.value})}
                            className={`w-full mt-1 px-2 py-1 text-sm rounded ${isDark ? 'bg-gray-600 text-white' : 'bg-white'}`}
                          >
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Bi-weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="season-end">Season End</option>
                          </select>
                        </div>
                        <div>
                          <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Distribution Method</label>
                          <select
                            value={payoutSettings.method}
                            onChange={(e) => setPayoutSettings({...payoutSettings, method: e.target.value})}
                            className={`w-full mt-1 px-2 py-1 text-sm rounded ${isDark ? 'bg-gray-600 text-white' : 'bg-white'}`}
                          >
                            <option value="equal">Equal Split</option>
                            <option value="ranking">By Ranking</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Admin Management */}
                  {isOwner && (
                    <button className={`w-full px-4 py-2 text-left text-sm rounded-lg ${
                      isDark ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-100/50 text-gray-700'
                    } flex items-center gap-2`}>
                      <Shield className="w-4 h-4" />
                      Manage Admins
                    </button>
                  )}
                  
                  {/* Group Privacy */}
                  <button className={`w-full px-4 py-2 text-left text-sm rounded-lg ${
                    isDark ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-100/50 text-gray-700'
                  } flex items-center gap-2`}>
                    <Lock className="w-4 h-4" />
                    Privacy Settings
                  </button>
                  
                  <hr className={`${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`} />
                  
                  {/* Danger Zone */}
                  <div className="space-y-2">
                    <button className={`w-full px-4 py-2 text-left text-sm rounded-lg ${
                      isDark ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-100/50 text-gray-700'
                    } flex items-center gap-2`}>
                      <LogOut className="w-4 h-4" />
                      Leave Group
                    </button>
                    {isOwner && (
                      <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50/50 rounded-lg flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete Group
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <MemberInviteModal
          group={group}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvitesSent={() => {
            fetchGroup();
            toast.success('Invites sent successfully!');
          }}
        />
      )}
    </>
  );
};

export default EnhancedGroupView;