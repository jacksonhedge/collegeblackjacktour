import { supabase } from '../services/supabase/config';

export interface ReferralReward {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_amount: number;
  reward_type: 'signup' | 'deposit' | 'activity';
  status: 'pending' | 'credited' | 'cancelled';
  created_at: string;
  credited_at?: string;
}

export interface ReferralInvite {
  id: string;
  referrer_id: string;
  email: string;
  referral_code: string;
  status: 'pending' | 'sent' | 'accepted' | 'expired';
  sent_at?: string;
  accepted_at?: string;
  created_at: string;
  expires_at: string;
}

export interface ReferralStats {
  referral_code: string;
  referral_count: number;
  referral_earnings: number;
  pending_invites: number;
  total_invites: number;
}

class ReferralService {
  async getUserReferralCode(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code, username')
        .eq('id', userId)
        .single();

      if (error) {
        // If profiles table doesn't exist or user not found, generate a temporary code
        if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('404') || error.message?.includes('400')) {
          console.log('Profiles table issue - using temporary referral code');
          // Generate a consistent temporary code based on user ID
          const tempCode = userId.substring(0, 6).toUpperCase();
          return tempCode;
        }
        throw error;
      }
      
      // Referral code should be automatically synced with username
      // If for some reason it's not, return the username without #
      if (!data?.referral_code && data?.username) {
        const referralCode = data.username.substring(1).toLowerCase();
        // Update the database to sync
        await supabase
          .from('profiles')
          .update({ referral_code: referralCode })
          .eq('id', userId);
        return referralCode;
      }
      
      return data?.referral_code || null;
    } catch (error) {
      console.error('Error getting referral code:', error);
      // Return a fallback code based on user ID
      return userId ? userId.substring(0, 6).toUpperCase() : null;
    }
  }

  async getReferralStats(userId: string): Promise<ReferralStats | null> {
    try {
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code, referral_count, referral_earnings')
        .eq('id', userId)
        .single();

      if (profileError) {
        // If profiles table doesn't exist (404), return default stats
        if (profileError.code === 'PGRST116' || profileError.message?.includes('404')) {
          console.log('Profiles table not found - returning default stats');
          return {
            referral_code: null,
            referral_count: 0,
            referral_earnings: 0,
            pending_invites: 0,
            total_invites: 0
          };
        }
        throw profileError;
      }

      // Get invite counts
      const { data: invites, error: invitesError } = await supabase
        .from('referral_invites')
        .select('status')
        .eq('referrer_id', userId);

      if (invitesError) throw invitesError;

      const pendingInvites = invites?.filter(i => i.status === 'pending' || i.status === 'sent').length || 0;
      const totalInvites = invites?.length || 0;

      return {
        referral_code: profile.referral_code,
        referral_count: profile.referral_count || 0,
        referral_earnings: profile.referral_earnings || 0,
        pending_invites: pendingInvites,
        total_invites: totalInvites
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return null;
    }
  }

  async getReferralRewards(userId: string): Promise<ReferralReward[]> {
    try {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting referral rewards:', error);
      return [];
    }
  }

  async getReferralInvites(userId: string): Promise<ReferralInvite[]> {
    try {
      const { data, error } = await supabase
        .from('referral_invites')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting referral invites:', error);
      return [];
    }
  }

  async sendReferralInvite(userId: string, email: string): Promise<boolean> {
    try {
      // Get user's referral code
      const referralCode = await this.getUserReferralCode(userId);
      if (!referralCode) {
        console.error('No referral code found for user');
        return false;
      }

      // Check if invite already exists
      const { data: existing } = await supabase
        .from('referral_invites')
        .select('id')
        .eq('referrer_id', userId)
        .eq('email', email)
        .single();

      if (existing) {
        console.log('Invite already exists for this email');
        return false;
      }

      // Create invite record
      const { error: inviteError } = await supabase
        .from('referral_invites')
        .insert({
          referrer_id: userId,
          email: email,
          referral_code: referralCode,
          status: 'sent',
          sent_at: new Date().toISOString()
        });

      if (inviteError) throw inviteError;

      // Send email via Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-referral-invite', {
        body: {
          to: email,
          referrerName: userId, // You might want to get the actual name
          referralCode: referralCode
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Update status to pending if email fails
        await supabase
          .from('referral_invites')
          .update({ status: 'pending' })
          .eq('referrer_id', userId)
          .eq('email', email);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending referral invite:', error);
      return false;
    }
  }

  async applyReferralCode(userId: string, referralCode: string): Promise<boolean> {
    try {
      // Call the database function that handles both old and new referral codes
      const { data, error } = await supabase
        .rpc('apply_referral', {
          user_id: userId,
          referral_code: referralCode
        });

      if (error) {
        console.error('Error applying referral code:', error);
        return false;
      }

      if (!data) {
        console.error('Invalid referral code or cannot use own code');
        return false;
      }

      // Get referrer ID using the lookup function
      const { data: referrerId } = await supabase
        .rpc('lookup_referral_code', { code: referralCode });
        
      if (referrerId) {
        // Credit signup bonus
        await this.creditReferralReward(referrerId, userId, 'signup', 10.00);

        // Update invite status if exists
        await supabase
          .from('referral_invites')
          .update({ 
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('referrer_id', referrerId)
          .eq('referral_code', referralCode);
      }

      return true;
    } catch (error) {
      console.error('Error applying referral code:', error);
      return false;
    }
  }

  async creditReferralReward(
    referrerId: string, 
    referredId: string, 
    rewardType: 'signup' | 'deposit' | 'activity',
    amount: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('credit_referral_reward', {
        p_referrer_id: referrerId,
        p_referred_id: referredId,
        p_reward_type: rewardType,
        p_amount: amount
      });

      if (error) throw error;

      // Send notification
      await supabase.functions.invoke('send-referral-reward-notification', {
        body: {
          userId: referrerId,
          rewardType: rewardType,
          amount: amount
        }
      });

      return true;
    } catch (error) {
      console.error('Error crediting referral reward:', error);
      return false;
    }
  }

  generateReferralLink(referralCode: string): string {
    const baseUrl = window.location.origin;
    // Referral codes are now lowercase usernames without #
    return `${baseUrl}/signup?ref=${referralCode.toLowerCase()}`;
  }
}

export const referralService = new ReferralService();