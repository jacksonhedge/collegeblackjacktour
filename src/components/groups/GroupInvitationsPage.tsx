import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '../ui';
import { GroupInviteNotification } from '../notifications/GroupInviteNotification';
import { supabaseGroupService } from '../../services/supabase/GroupService';
import type { GroupInvite } from '../../types/group';

export const GroupInvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<GroupInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const invites = await supabaseGroupService.getUserInvitations();
      setInvitations(invites);
    } catch (err: any) {
      console.error('Error fetching invitations:', err);
      setError(err.message || 'Failed to fetch invitations');
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleInvitationResponse = (inviteId: string, action: 'accepted' | 'declined') => {
    setInvitations(prev => 
      prev.map(inv => 
        inv.id === inviteId 
          ? { ...inv, status: action, [action + 'At']: new Date().toISOString() }
          : inv
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <Inbox className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Group Invitations
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your pending group invitations
              </p>
            </div>
          </div>

          <Button
            onClick={fetchInvitations}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {invitations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No invitations
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have any pending group invitations at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <GroupInviteNotification
                key={invitation.id}
                invitation={invitation}
                onResponse={handleInvitationResponse}
              />
            ))}
          </div>
        )}

        {invitations.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {invitations.filter(i => i.status === 'pending').length} pending invitation(s)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};