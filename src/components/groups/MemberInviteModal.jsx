import React, { useState } from 'react';
import { 
  X, 
  Search, 
  UserPlus, 
  Link2, 
  Smartphone,
  Mail,
  Copy,
  Check,
  Users
} from 'lucide-react';
import { groupService } from '../../services/firebase/GroupService';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getBaseUrl } from '../../utils/urlHelpers';

const MemberInviteModal = ({ group, isOpen, onClose, onInvitesSent }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('search'); // search, contacts, link
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState('');

  // Generate invite link
  const generateInviteLink = async () => {
    try {
      // In production, this would generate a unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 15);
      const link = `${getBaseUrl()}/invite/${group.id}/${inviteCode}`;
      setInviteLink(link);
      
      // Save invite code to group
      await groupService.updateGroup(group.id, {
        inviteCode,
        inviteCodeCreatedAt: new Date().toISOString(),
        inviteCodeCreatedBy: currentUser.uid
      });
    } catch (err) {
      console.error('Error generating invite link:', err);
      setError('Failed to generate invite link');
    }
  };

  // Search for users
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await groupService.searchUsers(term);
      // Filter out existing members and selected users
      const filtered = results.filter(user => 
        !group.memberIds?.includes(user.uid) &&
        !selectedUsers.some(u => u.uid === user.uid)
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  // Handle contact sync
  const syncContacts = async () => {
    setError('');
    try {
      // Check if we're on a mobile device
      if (!window.navigator || !window.navigator.contacts) {
        setError('Contact sync is only available on mobile devices');
        return;
      }

      // Request contact permission
      const contacts = await navigator.contacts.select(
        ['name', 'tel', 'email'],
        { multiple: true }
      );

      // Process contacts and match with Bankroll users
      const phoneNumbers = contacts
        .flatMap(c => c.tel || [])
        .filter(Boolean);
      const emails = contacts
        .flatMap(c => c.email || [])
        .filter(Boolean);

      // Search for users by phone and email
      const searchPromises = [
        ...phoneNumbers.map(phone => groupService.searchUsers(phone)),
        ...emails.map(email => groupService.searchUsers(email))
      ];

      const results = await Promise.all(searchPromises);
      const matchedUsers = results.flat().filter((user, index, self) =>
        index === self.findIndex(u => u.uid === user.uid) &&
        !group.memberIds?.includes(user.uid)
      );

      setSearchResults(matchedUsers);
      if (matchedUsers.length === 0) {
        setError('No contacts found on Bankroll. Invite them to join!');
      }
    } catch (err) {
      console.error('Error syncing contacts:', err);
      setError('Failed to sync contacts. Please try again.');
    }
  };

  // Copy invite link
  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  // Send invites
  const sendInvites = async () => {
    setIsLoading(true);
    setError('');

    try {
      const inviteData = selectedUsers.map(user => ({
        uid: user.uid,
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        photoURL: user.photoURL
      }));

      await groupService.inviteUsers(group.id, inviteData, currentUser.uid);
      
      // Show success message
      const successMessage = `Successfully invited ${inviteData.length} user${inviteData.length !== 1 ? 's' : ''} to join ${group.name}!`;
      console.log(successMessage);
      
      onInvitesSent?.(inviteData);
      onClose();
    } catch (err) {
      console.error('Error sending invites:', err);
      setError('Failed to send invites');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className={`relative w-full max-w-lg rounded-xl ${
        isDark ? 'bg-gray-900' : 'bg-white'
      } shadow-xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Invite Members
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
            onClick={() => {
              setActiveTab('contacts');
              syncContacts();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-colors ${
              activeTab === 'contacts'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Contacts
          </button>
          <button
            onClick={() => {
              setActiveTab('link');
              if (!inviteLink) generateInviteLink();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-colors ${
              activeTab === 'link'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Link
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by username, email, or phone"
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>

              {/* Search Results */}
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map(user => (
                  <button
                    key={user.uid}
                    onClick={() => {
                      setSelectedUsers([...selectedUsers, user]);
                      setSearchResults(searchResults.filter(u => u.uid !== user.uid));
                    }}
                    className={`w-full p-3 flex items-center justify-between rounded-lg mb-2 ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                          {user.displayName?.[0] || '?'}
                        </div>
                      )}
                      <div className="text-left">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {user.displayName}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user.username || user.email || user.phone}
                        </div>
                      </div>
                    </div>
                    <UserPlus className="w-5 h-5 text-purple-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <Smartphone className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {error || 'Tap to sync your contacts'}
                  </p>
                  <button
                    onClick={syncContacts}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Sync Contacts
                  </button>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map(user => (
                    <button
                      key={user.uid}
                      onClick={() => {
                        setSelectedUsers([...selectedUsers, user]);
                        setSearchResults(searchResults.filter(u => u.uid !== user.uid));
                      }}
                      className={`w-full p-3 flex items-center justify-between rounded-lg mb-2 ${
                        isDark 
                          ? 'bg-gray-800 hover:bg-gray-700' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            {user.displayName?.[0] || '?'}
                          </div>
                        )}
                        <div className="text-left">
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user.displayName}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user.username || user.email || user.phone}
                          </div>
                        </div>
                      </div>
                      <UserPlus className="w-5 h-5 text-purple-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Link Tab */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Link2 className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Share this link to invite people to join your group
                </p>
                
                {inviteLink && (
                  <div className={`p-3 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className={`flex-1 bg-transparent text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      />
                      <button
                        onClick={copyInviteLink}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        {linkCopied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected Users */}
          {selectedUsers.length > 0 && activeTab !== 'link' && (
            <div className="mt-4 pt-4 border-t dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Selected ({selectedUsers.length})
                </h3>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.uid}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      isDark ? 'bg-gray-800' : 'bg-gray-200'
                    }`}
                  >
                    <span>{user.displayName}</span>
                    <button
                      onClick={() => setSelectedUsers(selectedUsers.filter(u => u.uid !== user.uid))}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab !== 'link' && (
          <div className={`flex gap-3 p-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <button
              onClick={onClose}
              className={`flex-1 py-2 rounded-lg font-medium ${
                isDark 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={sendInvites}
              disabled={selectedUsers.length === 0 || isLoading}
              className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : `Send ${selectedUsers.length} Invite${selectedUsers.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberInviteModal;