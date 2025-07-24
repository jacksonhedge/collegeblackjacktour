import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { referralService } from '../../services/ReferralService';
import { Gift, Mail, MessageSquare, Link, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';
import ReferralInviteModal from './ReferralInviteModal';

const ReferralShareBox = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMethod, setInviteMethod] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      loadReferralCode();
    }
  }, [currentUser]);

  const loadReferralCode = async () => {
    const code = await referralService.getUserReferralCode(currentUser.id);
    setReferralCode(code || '');
  };

  const copyReferralLink = async () => {
    const link = referralService.generateReferralLink(referralCode);
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (method) => {
    setInviteMethod(method);
    setShowInviteModal(true);
  };

  if (!referralCode) return null;

  return (
    <>
      <div className={`rounded-lg p-4 ${
        isDark 
          ? 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-800' 
          : 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-purple-800/50' : 'bg-purple-200'
            }`}>
              <Gift className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Earn $10 per referral
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Share your code: <span className="font-mono font-bold">{referralCode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleShare('email')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-purple-800/30 text-gray-300 hover:text-white' 
                : 'hover:bg-purple-100 text-gray-700 hover:text-purple-700'
            }`}
          >
            <Mail className="w-5 h-5 mb-1" />
            <span className="text-xs">Email</span>
          </button>

          <button
            onClick={() => handleShare('sms')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-purple-800/30 text-gray-300 hover:text-white' 
                : 'hover:bg-purple-100 text-gray-700 hover:text-purple-700'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-1" />
            <span className="text-xs">Text</span>
          </button>

          <button
            onClick={copyReferralLink}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-purple-800/30 text-gray-300 hover:text-white' 
                : 'hover:bg-purple-100 text-gray-700 hover:text-purple-700'
            }`}
          >
            {copied ? (
              <Check className="w-5 h-5 mb-1 text-green-500" />
            ) : (
              <Copy className="w-5 h-5 mb-1" />
            )}
            <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => handleShare('native')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-purple-800/30 text-gray-300 hover:text-white' 
                : 'hover:bg-purple-100 text-gray-700 hover:text-purple-700'
            }`}
          >
            <Share2 className="w-5 h-5 mb-1" />
            <span className="text-xs">Share</span>
          </button>
        </div>

        {/* Bottom Text */}
        <p className={`text-xs text-center mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          You and your friend both get $10 when they sign up!
        </p>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <ReferralInviteModal
          referralCode={referralCode}
          method={inviteMethod}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </>
  );
};

export default ReferralShareBox;