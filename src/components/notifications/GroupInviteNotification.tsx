import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Check, X, Clock } from 'lucide-react';
import { Button } from '../ui';
import { supabaseGroupService } from '../../services/supabase/GroupService';
import type { GroupInvite } from '../../types/group';

interface GroupInviteNotificationProps {
  invitation: GroupInvite;
  onResponse: (inviteId: string, action: 'accepted' | 'declined') => void;
}

export const GroupInviteNotification: React.FC<GroupInviteNotificationProps> = ({
  invitation,
  onResponse
}) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!invitation.inviteToken) return;
    
    setLoading(true);
    try {
      await supabaseGroupService.acceptInvitation(invitation.inviteToken);
      toast.success('Successfully joined the group!');
      onResponse(invitation.id!, 'accepted');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error(error.message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation.inviteToken) return;
    
    setLoading(true);
    try {
      await supabaseGroupService.declineInvitation(invitation.inviteToken);
      toast.success('Invitation declined');
      onResponse(invitation.id!, 'declined');
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      toast.error(error.message || 'Failed to decline invitation');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Group Invitation
            </p>
            {isExpired && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900/20 dark:text-red-400">
                <Clock className="w-3 h-3 mr-1" />
                Expired
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            You've been invited to join a group
          </p>
          
          {invitation.message && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
              "{invitation.message}"
            </p>
          )}
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {!isExpired && invitation.status === 'pending' && (
        <div className="flex space-x-2 mt-4">
          <Button
            onClick={handleAccept}
            disabled={loading}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
          >
            <Check className="w-4 h-4" />
            <span>Accept</span>
          </Button>
          
          <Button
            onClick={handleDecline}
            disabled={loading}
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Decline</span>
          </Button>
        </div>
      )}

      {invitation.status !== 'pending' && (
        <div className="mt-4">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
            invitation.status === 'accepted' 
              ? 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
              : 'text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
          </span>
        </div>
      )}
    </div>
  );
};