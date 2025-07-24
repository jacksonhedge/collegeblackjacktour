import React, { useState } from 'react';
import { X, Mail, MessageSquare, Share2, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { referralService } from '../../services/ReferralService';
import emailService from '../../services/EmailService';
import { supabase } from '../../services/supabase/config';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';

const ReferralInviteModal = ({ referralCode, method, onClose }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailList, setEmailList] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [message, setMessage] = useState('Join me on Bankroll and we both get $10! 💰');

  const referralLink = referralService.generateReferralLink(referralCode);

  const handleEmailInvite = async () => {
    if (!emailList.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    setLoading(true);
    try {
      const emails = emailList.split(',').map(e => e.trim()).filter(e => e);
      
      // Send referral invites
      const result = await emailService.sendReferralInvites(
        emails,
        referralCode,
        currentUser.profile?.first_name || 'Your friend',
        message
      );

      if (result.success) {
        toast.success(`Referral invites sent to ${emails.length} people!`);
        onClose();
      } else {
        toast.error(result.message || 'Failed to send invites');
      }
    } catch (error) {
      console.error('Error sending email invites:', error);
      toast.error('Failed to send email invites');
    } finally {
      setLoading(false);
    }
  };

  const handleSMSInvite = async () => {
    if (!phoneNumbers.trim()) {
      toast.error('Please enter at least one phone number');
      return;
    }

    setLoading(true);
    try {
      const phones = phoneNumbers.split(',').map(p => p.trim()).filter(p => p);
      
      // Send SMS invites
      for (const phone of phones) {
        const { error } = await supabase.functions.invoke('send-sms', {
          body: {
            to: phone,
            message: `${message}\n\nJoin with my referral link: ${referralLink}`
          }
        });

        if (error) {
          console.error('SMS error:', error);
          toast.error(`Failed to send to ${phone}`);
        }
      }

      toast.success(`SMS invites sent to ${phones.length} people!`);
      onClose();
    } catch (error) {
      console.error('Error sending SMS invites:', error);
      toast.error('Failed to send SMS invites');
    } finally {
      setLoading(false);
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: 'Join Bankroll - Get $10!',
      text: `${message}\n\nJoin with my referral code: ${referralCode}`,
      url: referralLink
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
        onClose();
      } else {
        // Fallback to copy
        await navigator.clipboard.writeText(referralLink);
        toast.success('Referral link copied!');
        onClose();
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share');
      }
    }
  };

  const getIcon = () => {
    switch (method) {
      case 'email': return <Mail className="w-6 h-6 text-purple-400" />;
      case 'sms': return <MessageSquare className="w-6 h-6 text-purple-400" />;
      case 'native': return <Share2 className="w-6 h-6 text-purple-400" />;
      default: return <Mail className="w-6 h-6 text-purple-400" />;
    }
  };

  const getTitle = () => {
    switch (method) {
      case 'email': return 'Send Referral via Email';
      case 'sms': return 'Send Referral via Text';
      case 'native': return 'Share Referral Link';
      default: return 'Send Referral Invite';
    }
  };

  if (method === 'native') {
    handleNativeShare();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-900/95 border-purple-500/20 w-full max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="relative border-b border-gray-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-xl text-white">{getTitle()}</CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Earn $10 for each friend who joins!
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Referral Info */}
          <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-4">
            <p className="text-sm text-purple-300 mb-2">Your referral code:</p>
            <code className="text-lg font-mono text-white bg-gray-800 px-3 py-1 rounded">
              {referralCode}
            </code>
          </div>

          {/* Custom Message */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
              rows={3}
              placeholder="Add a personal message..."
            />
          </div>

          {/* Method-specific inputs */}
          {method === 'email' && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Email addresses (comma-separated)
              </label>
              <textarea
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                rows={3}
                placeholder="friend1@email.com, friend2@email.com..."
              />
            </div>
          )}

          {method === 'sms' && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Phone numbers (comma-separated)
              </label>
              <textarea
                value={phoneNumbers}
                onChange={(e) => setPhoneNumbers(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                rows={3}
                placeholder="+1234567890, +0987654321..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +1 for US)
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2">Preview:</p>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {message}
              {'\n\n'}
              Join with my referral link: {referralLink}
            </p>
          </div>
        </CardContent>

        {/* Actions */}
        <div className="p-6 border-t border-gray-800 flex-shrink-0">
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={method === 'email' ? handleEmailInvite : handleSMSInvite}
              disabled={loading || (method === 'email' ? !emailList : !phoneNumbers)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invites
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReferralInviteModal;