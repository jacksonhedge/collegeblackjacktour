import React, { useState, useEffect } from 'react';
import { Copy, Mail, MessageSquare, Share2, Check, Link as LinkIcon, Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';
import InviteService from '../../services/InviteService';
import { supabase } from '../../services/supabase/config';

const InviteLinkShare = ({ groupId, groupName, groupEmoji = '👥', inviterName, onClose }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    generateInviteLink();
  }, [groupId]);

  const generateInviteLink = async () => {
    try {
      setLoading(true);
      
      // Generate unique invite code
      const timestamp = Date.now().toString(36).substring(-4);
      const randomPart = Math.random().toString(36).substring(2, 4).toUpperCase();
      const code = `${groupId.substring(0, 4).toUpperCase()}${timestamp}${randomPart}`;
      setInviteCode(code);
      
      // Generate the link immediately
      const link = `${window.location.origin}/invite/${code}`;
      setInviteLink(link);
      
      // Generate password if enabled
      const invitePassword = usePassword && password ? password : null;
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // No need to delete old codes - each new code is unique
      
      // Try to store invite code in database
      try {
        // First try with password field
        const { error } = await supabase
          .from('invite_codes')
          .insert({
            code: code,
            type: 'group',
            group_id: groupId,
            created_by: user?.id,
            password: invitePassword,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            used: false
          });
        
        if (error && error.message?.includes('password')) {
          // If password column doesn't exist, try without it
          console.log('Password column not found, trying without it');
          const { error: retryError } = await supabase
            .from('invite_codes')
            .insert({
              code: code,
              type: 'group',
              group_id: groupId,
              created_by: user?.id,
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              used: false
            });
          
          if (retryError) {
            console.error('Error storing invite code (retry):', retryError);
          }
        } else if (error) {
          console.error('Error storing invite code:', error);
        }
      } catch (err) {
        console.error('Failed to store invite code:', err);
      }
    } catch (error) {
      console.error('Error generating invite:', error);
      toast.error('Failed to generate invite link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) {
      toast.error('No link to copy yet');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleEmailShare = () => {
    const subject = `You're invited to join ${groupName} on Bankroll`;
    const body = `Hi there!

${inviterName} has invited you to join "${groupName}" ${groupEmoji} on Bankroll.

Click here to join: ${inviteLink}

Bankroll is a platform for managing group finances and fantasy sports betting with friends.

See you there!`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleSMSShare = async () => {
    const message = `${inviterName} invited you to join "${groupName}" on Bankroll! Join here: ${inviteLink}`;
    
    // Check if Web Share API is available and can share text
    if (navigator.share && navigator.canShare && navigator.canShare({ text: message })) {
      try {
        await navigator.share({
          title: `Join ${groupName} on Bankroll`,
          text: message,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback to SMS URL
          window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
        }
      }
    } else {
      // Fallback for desktop or unsupported browsers
      window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: `Join ${groupName} on Bankroll`,
      text: `${inviterName} invited you to join "${groupName}"! Join here:`,
      url: inviteLink
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        setSharing(true);
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback to copy
        handleCopy();
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share');
      }
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <LinkIcon className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Share Invite Link</h3>
        <p className="text-sm text-gray-400">
          Anyone with this link can join your group{usePassword ? ' with the password' : ''}
        </p>
      </div>

      {/* Invite Link Display */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400 font-medium">Your Invite Link</p>
          <p className="text-xs text-gray-500">(expires in 30 days)</p>
        </div>
        <div className="bg-gray-900/50 rounded p-3 min-h-[2.5rem] flex items-center">
          {inviteLink ? (
            <p className="text-sm text-gray-300 break-all font-mono select-all">{inviteLink}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">Generating link...</p>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">Invite Code: <span className="text-purple-400 font-mono font-bold">{inviteCode}</span></p>
      </div>

      {/* Password Protection Option */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={usePassword}
              onChange={(e) => {
                setUsePassword(e.target.checked);
                if (!e.target.checked) setPassword('');
              }}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Require password to join</span>
          </label>
        </div>
        
        {usePassword && (
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full pl-10 pr-10 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Share Options */}
      <div className="space-y-3">
        {/* Copy Button */}
        <Button
          onClick={handleCopy}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </Button>

        {/* Share Options Row */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={handleEmailShare}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 text-sm font-medium"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>

          <Button
            onClick={handleSMSShare}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 text-sm font-medium"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Text
          </Button>

          <Button
            onClick={handleNativeShare}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 text-sm font-medium"
            disabled={sharing}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>How it works:</strong>
        </p>
        <ul className="mt-2 space-y-1 text-xs text-blue-200">
          <li>• Anyone can use this link to view your group</li>
          <li>• New users will be prompted to sign up first</li>
          <li>• {usePassword ? 'Users must enter the password to join' : 'Users can join immediately'}</li>
          <li>• The link expires in 30 days</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={generateInviteLink}
          variant="ghost"
          className="text-gray-400 hover:text-white"
          disabled={usePassword && !password}
        >
          Generate New Link
        </Button>
        {onClose && (
          <Button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default InviteLinkShare;