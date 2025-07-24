import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { groupService } from '../services/firebase/GroupService';
import { doc, getDoc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const GroupInvitePage = () => {
  const { groupId, inviteCode } = useParams();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadInviteDetails();
  }, [groupId, inviteCode, currentUser]);

  const loadInviteDetails = async () => {
    try {
      // Load group details first (this should work for public groups)
      const groupData = await groupService.getGroup(groupId);
      setGroup(groupData);

      // Only check membership if user is logged in
      if (currentUser) {
        const isInGroup = await groupService.isUserInGroup(currentUser.uid, groupId);
        if (isInGroup) {
          navigate(`/groups`);
          return;
        }
      }

      // Check if invite code is valid (if provided)
      if (inviteCode) {
        const invitationsRef = collection(db, 'groupInvitations');
        const q = query(
          invitationsRef,
          where('groupId', '==', groupId),
          where('invitedUserId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setInvitation(snapshot.docs[0].data());
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading invite details:', err);
      setError('Invalid or expired invitation');
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    setJoining(true);
    setError('');

    try {
      // Add user to group
      await groupService.addMembers(groupId, [{
        uid: currentUser.uid,
        displayName: currentUser.profile?.displayName || currentUser.email,
        photoURL: currentUser.profile?.profileImage
      }]);

      // Update invitation status if exists
      if (invitation) {
        const invitationsRef = collection(db, 'groupInvitations');
        const q = query(
          invitationsRef,
          where('groupId', '==', groupId),
          where('invitedUserId', '==', currentUser.uid)
        );
        
        const snapshot = await getDocs(q);
        snapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            status: 'accepted',
            acceptedAt: new Date().toISOString()
          });
        });
      }

      // Navigate to group page
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error('Error joining group:', err);
      setError('Failed to join group. Please try again.');
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className={`max-w-md w-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Invalid Invitation
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={() => navigate('/groups')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go to Groups
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className={`max-w-md w-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl">
              {group?.emoji || <Users className="w-10 h-10" />}
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {group?.name}
            </h1>
            {invitation && (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Invited by {invitation.inviterName}
              </p>
            )}
          </div>

          <div className={`space-y-4 mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex justify-between">
              <span>Members</span>
              <span className="font-medium">{group?.memberIds?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Group Balance</span>
              <span className="font-medium">${group?.totalBalance?.toFixed(2) || '0.00'}</span>
            </div>
            {group?.description && (
              <div className="pt-4 border-t dark:border-gray-800">
                <p className="text-sm">{group.description}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {!currentUser ? (
              <>
                <button
                  onClick={() => {
                    sessionStorage.setItem('inviteRedirect', window.location.pathname);
                    navigate('/login');
                  }}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Sign In to Join
                </button>
                <button
                  onClick={() => {
                    sessionStorage.setItem('inviteRedirect', window.location.pathname);
                    navigate('/signup');
                  }}
                  className="w-full py-3 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50"
                >
                  Create Account
                </button>
              </>
            ) : (
              <button
                onClick={handleJoinGroup}
                disabled={joining}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
              {joining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Join Group
                </>
              )}
              </button>
            )}
            {currentUser && (
              <button
                onClick={() => navigate('/groups')}
                className={`w-full py-3 rounded-lg font-medium ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupInvitePage;