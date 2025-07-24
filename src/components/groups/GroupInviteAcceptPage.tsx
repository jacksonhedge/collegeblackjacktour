import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Users, Check, X, AlertTriangle, UserPlus } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabaseGroupService } from '../../services/supabase/GroupService';
import { invitationService } from '../../services/supabase/InvitationService';
import type { GroupInvite, Group } from '../../types/group';

export const GroupInviteAcceptPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  
  const [invitation, setInvitation] = useState<GroupInvite | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const { invitation, group, isValid, errorMessage } = await invitationService.getInvitationByToken(token);
        
        if (!isValid) {
          setError(errorMessage || 'Invitation not valid');
          return;
        }

        setInvitation(invitation);
        
        // Load full group details if needed
        if (group) {
          setGroup({
            id: group.id,
            name: group.name,
            description: group.description || '',
            emoji: group.emoji || '👥',
            ownerId: group.owner_id,
            owner: {} as any, // Will be loaded separately if needed
            members: [],
            memberIds: [],
            pendingMembers: [],
            dateCreated: group.created_at,
            isHidden: !group.is_active,
            visibility: group.visibility,
            inviteLink: '',
            status: group.is_active ? 'active' : 'inactive',
            wallet: {
              platformId: `group_${group.id}`,
              groupId: group.id,
              ownerId: group.owner_id,
              name: 'Group Wallet',
              logo: '/images/BankrollLogoTransparent.png',
              cashBalance: 0,
              bonusBalances: [],
              totalBonusBalance: 0,
              lastUpdated: new Date(),
              status: 'active',
              connected: true,
              memberBalances: {},
              expenses: []
            },
            type: 'default',
            leagueInfo: null
          });
        }

      } catch (err: any) {
        console.error('Error loading invitation:', err);
        setError(err.message || 'Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadInvitation();
    }
  }, [token, authLoading]);

  const handleAccept = async () => {
    if (!invitation || !token) return;

    setProcessing(true);
    try {
      const { success, groupId, errorMessage } = await invitationService.acceptInvitation(token);
      
      if (success && groupId) {
        toast.success('Successfully joined the group!');
        navigate(`/groups/${groupId}`);
      } else {
        toast.error(errorMessage || 'Failed to accept invitation');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error(error.message || 'Failed to accept invitation');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;

    setProcessing(true);
    try {
      const { success, errorMessage } = await invitationService.declineInvitation(token);
      
      if (success) {
        toast.success('Invitation declined');
        navigate('/groups');
      } else {
        toast.error(errorMessage || 'Failed to decline invitation');
      }
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      toast.error(error.message || 'Failed to decline invitation');
    } finally {
      setProcessing(false);
    }
  };

  const handleSignUp = () => {
    // Redirect to signup with the invitation token
    navigate(`/signup?invite=${token}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-red-500/20 backdrop-blur-sm">
          <CardContent className="space-y-6 p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Invalid Invitation</h2>
                <p className="text-gray-400">{error}</p>
              </div>
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

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
              <Users className="w-6 h-6" />
              <span>You're Invited!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {group && (
              <div className="text-center space-y-2">
                <div className="text-3xl">{group.emoji}</div>
                <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                {group.description && (
                  <p className="text-gray-400 text-sm">{group.description}</p>
                )}
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                  <span>{group.members.length} members</span>
                  <span>•</span>
                  <span>{group.visibility} group</span>
                </div>
              </div>
            )}

            {invitation?.message && (
              <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
                <p className="text-sm text-gray-300 italic">"{invitation.message}"</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleSignUp}
                className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up & Join Group</span>
              </Button>
              
              <Button
                onClick={() => navigate('/login', { state: { returnTo: `/invite/${token}` } })}
                variant="outline"
                className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-900/20"
              >
                Already have an account? Sign In
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Invitation expires: {invitation && new Date(invitation.expiresAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in - show accept/decline options
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>Group Invitation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {group && (
            <div className="text-center space-y-2">
              <div className="text-3xl">{group.emoji}</div>
              <h3 className="text-lg font-semibold text-white">{group.name}</h3>
              {group.description && (
                <p className="text-gray-400 text-sm">{group.description}</p>
              )}
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <span>{group.members.length} members</span>
                <span>•</span>
                <span>{group.visibility} group</span>
              </div>
            </div>
          )}

          {invitation?.message && (
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
              <p className="text-sm text-gray-300 italic">"{invitation.message}"</p>
            </div>
          )}

          {invitation?.inviteeEmail && currentUser.email && 
           invitation.inviteeEmail.toLowerCase() !== currentUser.email.toLowerCase() && (
            <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-sm text-yellow-400">
                This invitation is for {invitation.inviteeEmail}, but you're signed in as {currentUser.email}.
                Please sign in with the correct account.
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleAccept}
              disabled={processing || (invitation?.inviteeEmail && currentUser.email && 
                       invitation.inviteeEmail.toLowerCase() !== currentUser.email.toLowerCase())}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>{processing ? 'Joining...' : 'Accept'}</span>
            </Button>
            
            <Button
              onClick={handleDecline}
              disabled={processing}
              variant="outline"
              className="flex-1 border-red-500/20 text-red-400 hover:bg-red-900/20 flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Decline</span>
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Invitation expires: {invitation && new Date(invitation.expiresAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};