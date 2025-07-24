import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, User, Search, Copy, Link, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import emailService from '../../services/EmailService';
import UserService from '../../services/firebase/UserService';
import InviteService from '../../services/InviteService';
import InviteLinkShare from './InviteLinkShare';
import { useGroup } from '../../contexts/GroupContext';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { generateInviteCodeLink } from '../../utils/urlHelpers';

const InviteUsersModalEnhanced = ({ groupId, groupName, onClose, onInvite }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [group, setGroup] = useState(null);
  const [inviteLink, setInviteLink] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('search'); // search | email | sms | link
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [sendingSMS, setSendingSMS] = useState(false);
  const [emailAddresses, setEmailAddresses] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [personalMessage, setPersonalMessage] = useState('');
  
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
    // Generate invite link
    const inviteCode = groupId.substring(0, 8);
    setInviteLink(generateInviteCodeLink(inviteCode));
  }, [groupId]);

  useEffect(() => {
    if (!currentUser) {
      toast.error('Please sign in to send invites');
      onClose();
    }
  }, [currentUser, onClose]);

  // Search for users by username, email, or phone
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Search users by different criteria
      const results = await UserService.searchUsers(searchQuery);
      
      // Filter out users who are already members
      const existingMemberIds = new Set([
        ...(group?.memberIds || []),
        ...(group?.members || []).map(m => m.uid)
      ]);
      
      const filteredResults = results.filter(user => 
        !existingMemberIds.has(user.uid) && user.uid !== currentUser.uid
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectUser = (user) => {
    if (!selectedUsers.find(u => u.uid === user.uid)) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.uid !== userId));
  };

  const handleSendInvites = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user to invite');
      return;
    }

    setLoading(true);
    try {
      // Extract emails and phone numbers
      const emails = selectedUsers
        .filter(u => u.email)
        .map(u => u.email);
      
      const phoneNumbers = selectedUsers
        .filter(u => u.phoneNumber)
        .map(u => u.phoneNumber);

      // Send email invites
      if (emails.length > 0) {
        const emailResult = await emailService.sendBulkGroupInvites(
          groupId,
          groupName,
          emails,
          group?.emoji || '👥',
          currentUser
        );

        if (!emailResult.success) {
          throw new Error(emailResult.message || 'Failed to send email invites');
        }
      }

      // TODO: Send SMS invites for phone numbers
      // This would require SMS service implementation

      toast.success(`Successfully invited ${selectedUsers.length} users`);
      onInvite();
      onClose();
    } catch (error) {
      console.error('Error sending invites:', error);
      toast.error(error.message || 'Failed to send invites');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setShowCopied(true);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleSendSMSInvites = async () => {
    if (!phoneNumbers.trim()) {
      toast.error('Please enter at least one phone number');
      return;
    }

    setSendingSMS(true);
    try {
      // Parse phone numbers (one per line)
      const numbers = phoneNumbers
        .split('\n')
        .map(num => num.trim())
        .filter(num => num.length > 0);

      if (numbers.length === 0) {
        toast.error('Please enter at least one phone number');
        return;
      }

      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      const invalidNumbers = numbers.filter(num => !phoneRegex.test(num.replace(/[\s\-\(\)]/g, '')));
      
      if (invalidNumbers.length > 0) {
        toast.error(`Invalid phone number format: ${invalidNumbers[0]}`);
        return;
      }

      let successCount = 0;
      let failCount = 0;

      // Send SMS invites
      for (const phoneNumber of numbers) {
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

      if (successCount > 0) {
        onInvite();
        onClose();
      }
    } catch (error) {
      console.error('Error sending SMS invites:', error);
      toast.error('Failed to send text invitations');
    } finally {
      setSendingSMS(false);
    }
  };

  const handleSendEmailInvites = async () => {
    if (!emailAddresses.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    setSendingEmail(true);
    try {
      // Parse email addresses (one per line)
      const emails = emailAddresses
        .split('\n')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emails.length === 0) {
        toast.error('Please enter at least one email address');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        toast.error(`Invalid email format: ${invalidEmails[0]}`);
        return;
      }

      // Get group details
      const groupData = group || { emoji: '👥', memberCount: 1, balance: 0 };

      // Send email invites using ResendInviteService
      const ResendInviteService = (await import('../../services/ResendInviteService')).default;
      
      console.log('Sending email invites to:', emails);
      
      const result = await ResendInviteService.sendBulkInvites({
        recipients: emails,
        type: 'group',
        inviteData: {
          inviterName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Someone',
          inviterEmail: currentUser.email,
          groupId: groupId,
          groupName: groupName,
          groupEmoji: groupData.emoji,
          groupBalance: groupData.balance || 0,
          memberCount: groupData.memberCount || 1,
          personalMessage: personalMessage,
          method: 'email'
        }
      });
      
      console.log('Email invite result:', result);

      // Count successes and failures
      const successCount = result.filter(r => r.success).length;
      const failCount = result.filter(r => !r.success).length;

      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} email invitation${successCount > 1 ? 's' : ''}`);
      }

      if (failCount > 0) {
        toast.error(`Failed to send ${failCount} invitation${failCount > 1 ? 's' : ''}`);
      }

      if (successCount > 0) {
        setEmailAddresses('');
        setPersonalMessage('');
        onInvite();
        onClose();
      }
    } catch (error) {
      console.error('Error sending email invites:', error);
      toast.error('Failed to send email invitations');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSkip = () => {
    onInvite();
    onClose();
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-900/95 border-purple-500/20 w-full max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="relative border-b border-gray-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="text-xl font-bold text-white">
            Add Members to {groupName}
          </CardTitle>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('search')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'text-purple-400 border-purple-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              Search Users
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'email'
                  ? 'text-purple-400 border-purple-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <Mail className="w-3 h-3 inline mr-1" />
              Email
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'sms'
                  ? 'text-purple-400 border-purple-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3 inline mr-1" />
              Text
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'link'
                  ? 'text-purple-400 border-purple-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              Share Link
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto flex-1">
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by username, email, or phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Search Results */}
              {searching && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.uid}
                      onClick={() => handleSelectUser(user)}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{user.displayName || user.email}</p>
                          <p className="text-xs text-gray-400">
                            {user.email && <span className="inline-flex items-center"><Mail className="w-3 h-3 mr-1" />{user.email}</span>}
                            {user.phoneNumber && <span className="inline-flex items-center ml-2"><Phone className="w-3 h-3 mr-1" />{user.phoneNumber}</span>}
                          </p>
                        </div>
                      </div>
                      <button className="text-purple-400 hover:text-purple-300 text-sm">
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">Selected Users ({selectedUsers.length})</h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.uid}
                        className="flex items-center justify-between p-2 bg-purple-600/20 rounded-lg"
                      >
                        <span className="text-sm text-white">{user.displayName || user.email}</span>
                        <button
                          onClick={() => handleRemoveUser(user.uid)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  Skip for Now
                </Button>
                <div className="flex space-x-3">
                  <Button
                    onClick={onClose}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendInvites}
                    disabled={loading || selectedUsers.length === 0}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {loading ? 'Sending...' : `Send Invites (${selectedUsers.length})`}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="text-center py-4 flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Send Text Invitations</h3>
                <p className="text-sm text-gray-400">
                  Invite friends to your group via SMS
                </p>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {/* Phone Number Input */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">
                    Phone Numbers
                  </label>
                  <textarea
                    placeholder="Enter phone numbers, one per line&#10;+1234567890&#10;+9876543210"
                    value={phoneNumbers}
                    onChange={(e) => setPhoneNumbers(e.target.value)}
                    className="w-full min-h-[120px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={5}
                  />
                  <p className="text-xs text-gray-500">
                    Include country code (e.g., +1 for US). One number per line.
                  </p>
                </div>

                {/* SMS Preview */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">Message Preview:</p>
                  <p className="text-sm text-gray-300">
                    Bankroll: {currentUser?.displayName || 'Someone'} invited you to join "{groupName}". Join now: [link]
                  </p>
                </div>
              </div>

              {/* Action Buttons - Always visible */}
              <div className="flex justify-between pt-4 flex-shrink-0 border-t border-gray-800 mt-4">
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  Skip for Now
                </Button>
                <div className="flex space-x-3">
                  <Button
                    onClick={onClose}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendSMSInvites}
                    disabled={sendingSMS || !phoneNumbers.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {sendingSMS ? 'Sending...' : 'Send Text Invites'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="text-center py-4 flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Send Email Invitations</h3>
                <p className="text-sm text-gray-400">
                  Invite friends to your group via email
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Addresses
                  </label>
                  <textarea
                    placeholder="Enter email addresses (one per line)&#10;john@example.com&#10;jane@example.com"
                    value={emailAddresses}
                    onChange={(e) => setEmailAddresses(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none h-32"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter multiple emails, one per line
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    placeholder="Add a personal message to your invitation..."
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none h-20"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 flex-shrink-0">
                <div className="text-sm text-gray-400">
                  {emailAddresses.trim() && (
                    <span>{emailAddresses.trim().split('\n').filter(e => e.trim()).length} email(s)</span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={onClose}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendEmailInvites}
                    disabled={sendingEmail || !emailAddresses.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {sendingEmail ? 'Sending...' : 'Send Email Invites'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'link' && (
            <InviteLinkShare 
              groupId={groupId}
              groupName={groupName}
              groupEmoji={group?.emoji}
              inviterName={currentUser?.displayName || currentUser?.email}
              onClose={null}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteUsersModalEnhanced;