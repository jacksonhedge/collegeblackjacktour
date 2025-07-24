import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { referralService } from '../../services/ReferralService';
import { X, Gift, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReferralNudge = ({ variant = 'banner', onClose }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [referralCode, setReferralCode] = useState('');
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      loadReferralCode();
    }
  }, [currentUser]);

  const loadReferralCode = async () => {
    const code = await referralService.getUserReferralCode(currentUser.id);
    setReferralCode(code || '');
  };

  const copyReferralCode = () => {
    const link = referralService.generateReferralLink(referralCode);
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  if (!show || !referralCode) return null;

  // Banner variant - horizontal strip
  if (variant === 'banner') {
    return (
      <div className={`relative overflow-hidden rounded-lg p-4 mb-4 ${
        isDark 
          ? 'bg-gradient-to-r from-purple-900 to-indigo-900' 
          : 'bg-gradient-to-r from-purple-500 to-indigo-500'
      }`}>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white/70 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="font-semibold">Earn $10 for each friend you refer!</h3>
              <p className="text-sm opacity-80">
                Share your code: <span className="font-mono font-bold">{referralCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={copyReferralCode}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>
    );
  }

  // Card variant - smaller, more subtle
  if (variant === 'card') {
    return (
      <div className={`relative rounded-lg p-4 ${
        isDark 
          ? 'bg-gray-800 border border-purple-600' 
          : 'bg-purple-50 border border-purple-300'
      }`}>
        <button
          onClick={handleClose}
          className={`absolute top-2 right-2 ${
            isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <X className="w-3 h-3" />
        </button>
        
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${
            isDark ? 'bg-purple-900/50' : 'bg-purple-200'
          }`}>
            <Users className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <div className="flex-1">
            <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Invite friends, earn rewards
            </h4>
            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Get $10 when they sign up
            </p>
            <button
              onClick={copyReferralCode}
              className={`text-sm font-medium ${
                isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              Share your link →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Floating variant - bottom corner popup
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
        <div className={`relative rounded-lg shadow-xl p-4 ${
          isDark 
            ? 'bg-gradient-to-br from-purple-900 to-indigo-900' 
            : 'bg-gradient-to-br from-purple-500 to-indigo-500'
        }`}>
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="w-5 h-5" />
              <h3 className="font-semibold">Earn rewards!</h3>
            </div>
            <p className="text-sm opacity-90 mb-3">
              Get $10 for each friend who joins using your code
            </p>
            <div className="flex items-center space-x-2">
              <code className="bg-white/20 px-2 py-1 rounded text-sm font-mono">
                {referralCode}
              </code>
              <button
                onClick={copyReferralCode}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ReferralNudge;