import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ReferralRewards from '../components/referral/ReferralRewards';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Referrals = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-6 transition-colors duration-200">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/wallet')}
          className={`flex items-center gap-2 mb-4 ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          } transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wallet
        </button>
        
        <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Referral Program
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Invite friends and earn rewards together
        </p>
      </div>

      {/* Referral Component */}
      <ReferralRewards />
    </div>
  );
};

export default Referrals;