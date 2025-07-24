import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { groupService } from '../services/firebase/GroupService.ts';
import { supabase } from '../services/supabase/config';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Users, Lock, Globe, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';

const InvitePage = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [invitePassword, setInvitePassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [inviteData, setInviteData] = useState(null);

  useEffect(() => {
    const fetchGroupByInviteCode = async () => {
      if (!inviteCode) {
        setError('Invalid invite link');
        setLoading(false);
        return;
      }

      try {
        // First check the invite_codes table
        const { data: inviteData, error: inviteError } = await supabase
          .from('invite_codes')
          .select('*')
          .eq('code', inviteCode)
          .eq('used', false)
          .single();

        if (inviteError || !inviteData) {
          // Also check group_invitations table with invite_token
          const { data: invitationData, error: invitationError } = await supabase
            .from('group_invitations')
            .select('*')
            .eq('invite_token', inviteCode)
            .eq('status', 'pending')
            .single();

          if (invitationError || !invitationData) {
            // Last fallback: try to find group by ID if invite code matches groupId pattern
            try {
              // Check if this might be a groupId-based code (first 8 chars of groupId)
              const { data: groups } = await supabase
                .from('groups')
                .select('*')
                .like('id', `${inviteCode.toLowerCase()}%`)
                .limit(1);
              
              if (groups && groups.length > 0) {
                const groupData = await groupService.getGroup(groups[0].id);
                if (groupData) {
                  setGroup(groupData);
                  // Create a fake invite data for compatibility
                  setInviteData({
                    group_id: groups[0].id,
                    code: inviteCode
                  });
                  setLoading(false);
                  return;
                }
              }
            } catch (fallbackError) {
              console.error('Fallback group lookup failed:', fallbackError);
            }
            
            setError('Invalid or expired invite link');
            setLoading(false);
            return;
          }

          // Found in group_invitations table
          const groupData = await groupService.getGroup(invitationData.group_id);
          if (groupData) {
            setGroup(groupData);
            setInviteData(invitationData);
          } else {
            setError('Group not found');
          }
        } else {
          // Found in invite_codes table
          // Check if invite has expired
          if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
            setError('This invite link has expired');
            setLoading(false);
            return;
          }

          // Get the group
          const groupData = await groupService.getGroup(inviteData.group_id);
          if (groupData) {
            setGroup(groupData);
            setInviteData(inviteData);
          } else {
            setError('Group not found');
          }
        }
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Failed to load group information');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupByInviteCode();
  }, [inviteCode, currentUser]);

  const handleJoinGroup = async () => {
    if (!currentUser) {
      // Store invite info in localStorage for post-signup
      localStorage.setItem('pendingInvite', JSON.stringify({
        inviteCode,
        groupId: group.id,
        groupName: group.name,
        timestamp: Date.now()
      }));
      
      // Redirect to signup with return URL
      navigate(`/signup?invite=${inviteCode}`);
      return;
    }
    
    // Get userId from either uid or id field
    const userId = currentUser.uid || currentUser.id;

    // For invites with password requirement, validate password
    if (inviteData?.password) {
      if (!invitePassword) {
        setPasswordError('Please enter the invite password');
        return;
      }
      if (invitePassword !== inviteData.password) {
        setPasswordError('Incorrect password');
        return;
      }
    }

    setJoining(true);
    setPasswordError('');
    
    try {
      // Check if user is already a member
      if (group.memberIds?.includes(userId)) {
        toast.success('You are already a member of this group!');
        navigate('/groups');
        return;
      }

      // Validate we have required data
      if (!group?.id) {
        console.error('Group ID is missing:', group);
        toast.error('Group information is missing');
        return;
      }
      
      if (!userId) {
        console.error('User ID is missing:', currentUser);
        toast.error('User information is missing');
        return;
      }
      
      console.log('Attempting to join group:', { groupId: group.id, userId });
      
      // Join directly for invited users (they have the invite code and password)
      await groupService.joinGroup(group.id, userId);
      
      // Mark invite as used
      await supabase
        .from('invite_codes')
        .update({ 
          used: true, 
          used_by: userId,
          used_at: new Date().toISOString()
        })
        .eq('code', inviteCode);
      
      // Also mark group_invitation as accepted if it exists
      if (inviteData && inviteData.id) {
        await supabase
          .from('group_invitations')
          .update({ 
            status: 'accepted',
            responded_at: new Date().toISOString()
          })
          .eq('id', inviteData.id);
      }
      
      toast.success('Successfully joined the group!');
      navigate('/groups');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.message || 'Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner color="purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <Card className="bg-gray-800 border-red-500/20 max-w-md w-full">
          <CardContent className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <Card className="bg-gray-800 border-purple-500/20 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center text-4xl">
              {group?.emoji || '👥'}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            You're invited to join
          </CardTitle>
          <h2 className="text-3xl font-bold text-purple-400 mt-2">{group?.name}</h2>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Group Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Members</span>
              </div>
              <span className="text-white font-medium">{group?.members?.length || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-2">
                {group?.visibility === 'private' ? (
                  <Lock className="w-5 h-5 text-gray-400" />
                ) : (
                  <Globe className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-gray-300">Type</span>
              </div>
              <span className="text-white font-medium capitalize">{group?.visibility || 'Public'}</span>
            </div>
          </div>

          {/* Description */}
          {group?.description && (
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <p className="text-gray-300">{group.description}</p>
            </div>
          )}

          {/* Password Input for Invited Users */}
          {currentUser && inviteData?.password && !requestSent && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Enter invite password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={invitePassword}
                  onChange={(e) => {
                    setInvitePassword(e.target.value);
                    setPasswordError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinGroup()}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              {passwordError && (
                <p className="text-red-400 text-sm">{passwordError}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {!requestSent ? (
            <div className="space-y-3">
              {!currentUser ? (
                <>
                  <Button
                    onClick={() => navigate(`/signup?redirect=/invite/${inviteCode}`)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Sign Up to Join
                  </Button>
                  <Button
                    onClick={() => navigate(`/login?redirect=/invite/${inviteCode}`)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    Already have an account? Log In
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleJoinGroup}
                  disabled={joining || (inviteData?.password && !invitePassword)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                >
                  {joining ? 'Processing...' : 'Join Group'}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 font-medium">Join request sent!</p>
              <p className="text-gray-400 text-sm mt-2">
                The group admin will review your request.
              </p>
              <Button
                onClick={() => navigate('/groups')}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Go to My Groups
              </Button>
            </div>
          )}

          {/* Cancel */}
          {!requestSent && (
            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;