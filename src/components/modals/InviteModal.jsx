import React, { useState } from 'react';
import { X, Mail, MessageSquare, Copy, Check, Gift, DollarSign, Users, Ticket } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import InviteService from '../../services/InviteService';

const InviteModal = ({ isOpen, onClose, inviteType = 'group', data = {} }) => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const [inviteMethod, setInviteMethod] = useState('text');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  if (!isOpen) return null;

  const inviteData = {
    group: {
      icon: Users,
      title: 'Invite to Group',
      message: `Join my group "${data.groupName || 'Bankroll Group'}" on Bankroll! 🎯`,
      link: `https://bankroll.live/join/group/${data.groupId || 'abc123'}`,
      color: 'from-purple-500 to-pink-500'
    },
    money: {
      icon: DollarSign,
      title: 'Send Money',
      message: `I'm sending you $${data.amount || '0'} on Bankroll! 💸`,
      link: `https://bankroll.live/claim/money/${data.transactionId || 'xyz789'}`,
      color: 'from-green-500 to-emerald-500'
    },
    freebet: {
      icon: Ticket,
      title: 'Send Free Bet',
      message: `I'm sending you a free $${data.amount || '0'} bet on ${data.platform || 'Bankroll'}! 🎰`,
      link: `https://bankroll.live/claim/freebet/${data.betId || 'bet456'}`,
      color: 'from-orange-500 to-red-500'
    },
    gift: {
      icon: Gift,
      title: 'Send Gift',
      message: `You've received a gift on Bankroll! 🎁`,
      link: `https://bankroll.live/claim/gift/${data.giftId || 'gift789'}`,
      color: 'from-blue-500 to-purple-500'
    }
  };

  const currentInvite = inviteData[inviteType] || inviteData.group;
  const Icon = currentInvite.icon;

  const fullMessage = `${currentInvite.message}\n\nClaim here: ${currentInvite.link}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentInvite.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async () => {
    setError('');
    setSending(true);
    
    try {
      const inviterName = currentUser?.user_metadata?.username || currentUser?.email || 'A friend';
      
      if (inviteMethod === 'text' && phoneNumber) {
        // Use native SMS for now
        await InviteService.sendSMSInvite({
          to: phoneNumber,
          type: inviteType,
          inviterName,
          groupName: data.groupName,
          amount: data.amount,
          message: customMessage
        });
        setSent(true);
        setTimeout(() => {
          onClose();
          setSent(false);
        }, 2000);
      } else if (inviteMethod === 'email' && email) {
        // Send actual email via Supabase function
        await InviteService.sendEmailInvite({
          to: email,
          type: inviteType,
          inviterName,
          groupName: data.groupName,
          amount: data.amount,
          message: customMessage
        });
        setSent(true);
        setTimeout(() => {
          onClose();
          setSent(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Error sending invite:', err);
      setError('Failed to send invite. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatPhoneNumber = (value) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md ${
        isDark ? 'bg-gray-900' : 'bg-white'
      } rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Header with gradient */}
        <div className={`p-6 bg-gradient-to-r ${currentInvite.color}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {currentInvite.title}
                </h3>
                {data.subtitle && (
                  <p className="text-white/80 text-sm mt-1">{data.subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Invite Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setInviteMethod('text')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                inviteMethod === 'text'
                  ? 'bg-purple-600 text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => setInviteMethod('email')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                inviteMethod === 'email'
                  ? 'bg-purple-600 text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>

          {/* Input Field */}
          {inviteMethod === 'text' ? (
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="(555) 123-4567"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                maxLength={14}
              />
            </div>
          ) : (
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              />
            </div>
          )}

          {/* Custom Message Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Add a Personal Message (Optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Hey! Join our group..."
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            />
          </div>

          {/* Preview Message */}
          <div className={`mb-6 p-4 rounded-lg ${
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <p className={`text-sm font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Message Preview:
            </p>
            <p className={`text-sm whitespace-pre-line ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {fullMessage}
              {customMessage && `\n\n"${customMessage}"`}
            </p>
          </div>

          {/* Copy Link Option */}
          <div className={`mb-6 p-3 rounded-lg border ${
            isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Share Link
                </p>
                <p className={`text-xs mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Copy and share anywhere
                </p>
              </div>
              <button
                onClick={handleCopyLink}
                className={`p-2 rounded-lg transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                } border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Success Message */}
          {sent && (
            <div className="mb-4 p-3 bg-green-500/20 text-green-500 rounded-lg text-center text-sm font-medium">
              Invite sent successfully! ✓
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-500 rounded-lg text-center text-sm font-medium">
              {error}
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSendInvite}
            disabled={
              sending ||
              (inviteMethod === 'text' && !phoneNumber) ||
              (inviteMethod === 'email' && !email)
            }
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              sending || ((inviteMethod === 'text' && !phoneNumber) || 
               (inviteMethod === 'email' && !email))
                ? isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {sending ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;