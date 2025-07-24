import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { Button } from '../ui';
import { Input } from '../ui';
import { emailService } from '../../services/EmailService';
import { useGroup } from '../../contexts/GroupContext';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import type { Group } from '../../types/group';

interface InviteUsersModalProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
  onInvite: () => void;
}

interface EmailResult {
  success: boolean;
  message?: string;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
  results?: Array<{
    email: string;
    success: boolean;
    error?: string;
  }>;
}

const InviteUsersModal: React.FC<InviteUsersModalProps> = ({ 
  groupId, 
  groupName, 
  onClose, 
  onInvite 
}) => {
  const [emails, setEmails] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const { currentUser } = useAuth();
  const { getGroup } = useGroup();

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupData = await getGroup(groupId);
        setGroup(groupData);
      } catch (error) {
        console.error('Error fetching group:', error);
        toast.error('Failed to load group details');
      }
    };
    fetchGroup();
  }, [groupId, getGroup]);

  useEffect(() => {
    if (!currentUser) {
      toast.error('Please sign in to send invites');
      onClose();
    }
  }, [currentUser, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentUser) {
        toast.error('Please sign in to send invites');
        return;
      }

      if (!group) {
        toast.error('Group not found');
        return;
      }

      // Split and clean email addresses
      const emailList = emails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      console.log('Sending invites to:', emailList);

      if (emailList.length === 0) {
        toast.error('Please enter at least one email address');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emailList.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        toast.error(`Invalid email format: ${invalidEmails.join(', ')}`);
        return;
      }

      // Check for existing members and pending invites
      const existingEmails = new Set([
        ...(group.members || []).map(m => m.email || ''),
        ...(group.pendingMembers || []).map(m => m.identifier || '')
      ].filter(Boolean));

      const newEmails = emailList.filter(email => !existingEmails.has(email));
      const skippedEmails = emailList.filter(email => existingEmails.has(email));

      if (newEmails.length === 0) {
        toast.error('All emails are already members or have pending invites');
        return;
      }

      // Try to send the email invites
      const emailResult = await emailService.sendBulkGroupInvites(
        groupId, 
        groupName, 
        newEmails,
        group.emoji || '👥'
      ) as EmailResult;

      console.log('Email send result:', emailResult);
      
      if (!emailResult.success) {
        throw new Error(emailResult.message || 'Failed to send email invites');
      }

      // Show detailed success message
      if (emailResult.summary) {
        const { successful, failed, total } = emailResult.summary;
        if (successful === total) {
          toast.success(`Successfully sent all ${total} invites`);
        } else {
          toast.success(`Sent ${successful} out of ${total} invites successfully${failed > 0 ? ` (${failed} failed)` : ''}`);
        }
      } else {
        toast.success(emailResult.message || 'Invites sent successfully');
      }

      // Show any skipped invites
      if (skippedEmails.length > 0) {
        toast(
          `${skippedEmails.length} email(s) were already invited or are members`,
          {
            icon: 'ℹ️',
            style: {
              background: '#2563eb',
              color: '#fff',
            },
          }
        );
      }

      onInvite();
      onClose();
    } catch (error: any) {
      console.error('Error inviting users:', error);
      
      // Handle specific error cases
      if (error.message?.includes('not properly configured')) {
        toast.error('Email service is not set up. Please contact support.');
      } else if (error.message?.includes('sign in') || error.message?.includes('authenticated')) {
        toast.error('Please sign in to send invites');
        onClose();
      } else {
        toast.error(error.message || 'Failed to send invites');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-gray-900/40 border-purple-500/20 w-[400px]">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="text-xl font-bold text-white">
            Invite Members
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">
                Email Addresses
              </label>
              <Input
                type="text"
                placeholder="Enter email addresses, separated by commas"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">
                Enter multiple email addresses separated by commas
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={onClose}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !emails.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? 'Sending...' : 'Send Invites'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteUsersModal;
