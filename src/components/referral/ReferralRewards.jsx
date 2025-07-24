import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { referralService } from '../../services/ReferralService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Copy, Mail, Users, DollarSign, Gift, Send, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReferralRewards = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [recentRewards, setRecentRewards] = useState([]);

  useEffect(() => {
    if (currentUser?.id) {
      loadReferralData();
    }
  }, [currentUser]);

  const loadReferralData = async () => {
    const [userStats, rewards] = await Promise.all([
      referralService.getReferralStats(currentUser.id),
      referralService.getReferralRewards(currentUser.id)
    ]);

    setStats(userStats);
    setRecentRewards(rewards.slice(0, 3)); // Show only recent 3

    if (userStats?.referral_code) {
      setReferralLink(referralService.generateReferralLink(userStats.referral_code));
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const sendInvite = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setSending(true);
    const success = await referralService.sendReferralInvite(currentUser.id, email);
    
    if (success) {
      toast.success('Invite sent successfully!');
      setEmail('');
      loadReferralData(); // Refresh stats
    } else {
      toast.error('Failed to send invite. Please try again.');
    }
    setSending(false);
  };

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Referral Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${
          isDark 
            ? 'bg-gradient-to-br from-purple-900 to-purple-700 border-purple-600' 
            : 'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400'
        } text-white`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">Total Referrals</p>
              <p className="text-2xl font-bold">{stats.referral_count}</p>
              <p className="text-xs mt-1 opacity-70">{stats.pending_invites} pending invites</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${
          isDark 
            ? 'bg-gradient-to-br from-green-900 to-green-700 border-green-600' 
            : 'bg-gradient-to-br from-green-500 to-green-600 border-green-400'
        } text-white`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">Total Earned</p>
              <p className="text-2xl font-bold">${stats.referral_earnings.toFixed(2)}</p>
              <p className="text-xs mt-1 opacity-70">From referral rewards</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${
          isDark 
            ? 'bg-gradient-to-br from-indigo-900 to-purple-700 border-indigo-600' 
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400'
        } text-white`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Gift className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">Your Rewards</p>
              <p className="text-lg font-bold">$10 per signup</p>
              <p className="text-xs mt-1 opacity-70">+ bonuses on deposits</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-200'}>
        <CardHeader>
          <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className={`flex-1 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`}
              />
              <Button
                onClick={copyReferralLink}
                variant="outline"
                className="min-w-[100px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-purple-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Share your referral code: <span className="font-mono font-bold">{stats.referral_code}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Invite Section */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-200'}>
        <CardHeader>
          <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
            Invite Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter friend's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendInvite()}
              className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}
            />
            <Button
              onClick={sendInvite}
              disabled={sending || !email}
              className="min-w-[120px]"
            >
              {sending ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      {recentRewards.length > 0 && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-200'}>
          <CardHeader>
            <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
              Recent Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? 'bg-gray-900/50' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {reward.reward_type === 'signup' ? 'New Signup' : 
                       reward.reward_type === 'deposit' ? 'Friend Deposited' : 
                       'Activity Bonus'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(reward.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-green-500">
                    +${reward.reward_amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralRewards;