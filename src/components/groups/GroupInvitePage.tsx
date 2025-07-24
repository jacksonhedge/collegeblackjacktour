import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { groupService } from '../../services/firebase/GroupService';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Alert, 
  AlertDescription 
} from '../ui';
import { 
  Loader2, 
  Users, 
  Wallet, 
  Split,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { Group, User } from '../../types/group';

const GroupInvitePage: React.FC = () => {
  const { groupId, inviteCode } = useParams<{ groupId: string; inviteCode: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      try {
        if (!groupId || !inviteCode) {
          setError('Invalid invitation link');
          return;
        }

        const groupData = await groupService.getGroup(groupId);
        
        // Check if user is already a member
        if (currentUser && groupData.memberIds.includes(currentUser.uid)) {
          setError('You are already a member of this group');
          return;
        }
        
        setGroup(groupData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load group');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadGroup();
    }
  }, [groupId, inviteCode, currentUser]);

  const handleJoin = async () => {
    if (!currentUser || !groupId || !group) return;

    setJoining(true);
    try {
      // Use the joinGroup method which handles invite codes and join requests
      await groupService.joinGroup(groupId, currentUser.uid);
      navigate('/groups');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join group';
      
      // Check if it's a join request that needs approval
      if (errorMessage.includes('Join request sent')) {
        // Show success message for join request
        setError(null);
        // Navigate to groups page with a success message
        navigate('/groups', { 
          state: { 
            message: 'Join request sent! The group admin will review your request.' 
          } 
        });
      } else {
        setError(errorMessage);
      }
    } finally {
      setJoining(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="space-y-6 p-6">
            <div className="text-center space-y-2">
              <Users className="h-12 w-12 text-purple-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Join Group</h2>
              <p className="text-gray-400">Please sign in to join this group</p>
            </div>

            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Sign In
            </Button>
            
            <Button
              onClick={() => navigate('/signup')}
              className="w-full border border-purple-500/20 text-purple-400 hover:bg-purple-900/20"
            >
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="space-y-6 p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
              <Alert className="bg-red-900/20 border-red-500/20">
                <AlertDescription>{error || 'Group not found'}</AlertDescription>
              </Alert>
            </div>

            <Button
              onClick={() => navigate('/groups')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Go to Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <span className="text-2xl">{group.emoji}</span>
            <span>{group.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Group Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span className="text-white">{group.members?.length || 0} members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Share2 className="h-5 w-5 text-purple-400" />
                <span className="text-white">{group.visibility}</span>
              </div>
            </div>

            {group.description && (
              <p className="text-gray-300">{group.description}</p>
            )}
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-purple-900/20 rounded-lg text-center">
              <Wallet className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-white">Shared Wallet</h3>
              <p className="text-xs text-gray-400">Track group expenses</p>
            </div>
            <div className="p-4 bg-purple-900/20 rounded-lg text-center">
              <Split className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-white">Split Bills</h3>
              <p className="text-xs text-gray-400">Easy payment splitting</p>
            </div>
          </div>

          <Button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center space-x-2"
          >
            {joining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Joining...</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                <span>Join Group</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupInvitePage;
