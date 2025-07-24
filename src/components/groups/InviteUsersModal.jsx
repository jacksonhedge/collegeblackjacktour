import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { Button } from '../ui';
import { Input } from '../ui';
import { emailService } from '../../services/EmailService';
import InviteService from '../../services/InviteService';
import { useGroup } from '../../contexts/GroupContext';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const InviteUsersModal = ({ groupId, groupName, onClose, onInvite }) => {
  const [emails, setEmails] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);
  const [inviteMethod, setInviteMethod] = useState('email'); // email | sms
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

  const handleSubmit = async (e) => {
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

      if (inviteMethod === 'email') {
        // Handle email invites
        const emailList = emails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0);

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

        // Send email invites
        const emailResult = await emailService.sendBulkGroupInvites(
          groupId, 
          groupName, 
          newEmails,
          group.emoji || '👥'
        );
        
        if (!emailResult.success) {
          throw new Error(emailResult.message || 'Failed to send email invites');
        }

        // Show success message
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

        if (skippedEmails.length > 0) {
          toast(`${skippedEmails.length} email(s) were already invited or are members`, {
            icon: 'ℹ️',
            style: { background: '#2563eb', color: '#fff' },
          });
        }
      } else {
        // Handle SMS invites
        const numberList = phoneNumbers
          .split('\n')
          .map(num => num.trim())
          .filter(num => num.length > 0);

        if (numberList.length === 0) {
          toast.error('Please enter at least one phone number');
          return;
        }

        // Validate phone numbers
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        const invalidNumbers = numberList.filter(num => !phoneRegex.test(num.replace(/[\s\-\(\)]/g, '')));
        
        if (invalidNumbers.length > 0) {
          toast.error(`Invalid phone number format: ${invalidNumbers[0]}`);
          return;
        }

        let successCount = 0;
        let failCount = 0;

        // Send SMS invites
        for (const phoneNumber of numberList) {
          try {
            await InviteService.sendSMSInvite({
              to: phoneNumber,
              type: 'group',
              inviterName: currentUser.displayName || currentUser.email,
              groupName: groupName,
              groupId: groupId
            });
            successCount++;
          } catch (error) {
            console.error(`Failed to send SMS to ${phoneNumber}:`, error);
            failCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`Successfully sent ${successCount} text invitation${successCount > 1 ? 's' : ''}`);
        }
        
        if (failCount > 0) {
          toast.error(`Failed to send ${failCount} invitation${failCount > 1 ? 's' : ''}`);
        }

        if (successCount === 0) {
          return;
        }
      }

      onInvite();
      onClose();
    } catch (error) {
      console.error('Error inviting users:', error);
      
      // Handle specific error cases
      if (error.message?.includes('not properly configured')) {
        toast.error('Service is not set up. Please contact support.');
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
            {/* Method Selection Tabs */}
            <div className="flex border-b border-gray-700 mb-4">
              <button
                type="button"
                onClick={() => setInviteMethod('email')}
                className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                  inviteMethod === 'email'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setInviteMethod('sms')}
                className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                  inviteMethod === 'sms'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Text
              </button>
            </div>

            {inviteMethod === 'email' ? (
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
            ) : (
              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Phone Numbers
                </label>
                <textarea
                  placeholder="Enter phone numbers, one per line&#10;+1234567890&#10;+9876543210"
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Include country code (e.g., +1 for US). One number per line.
                </p>
              </div>
            )}

            {/* SMS Preview */}
            {inviteMethod === 'sms' && (
              <div className="bg-gray-800/50 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-400 mb-1">Message Preview:</p>
                <p className="text-sm text-gray-300">
                  Bankroll: {currentUser?.displayName || 'Someone'} invited you to join "{groupName}". Join now: [link]
                </p>
              </div>
            )}

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
                disabled={loading || (inviteMethod === 'email' ? !emails.trim() : !phoneNumbers.trim())}
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
