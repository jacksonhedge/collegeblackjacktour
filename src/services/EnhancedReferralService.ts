import { supabase } from '../services/supabase/config';

export interface ReferralCode {
  id: string;
  code: string;
  code_type: 'affiliate' | 'user' | 'promotional';
  owner_id?: string;
  created_by?: string;
  description?: string;
  is_active: boolean;
  is_permanent: boolean;
  commission_rate: number;
  fixed_bonus: number;
  usage_limit?: number;
  usage_count: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralCodeUsage {
  id: string;
  code_id: string;
  user_id: string;
  applied_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface AffiliatePlatformURL {
  id: string;
  code_id: string;
  platform_id: string;
  platform_name: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateEarning {
  id: string;
  affiliate_code_id: string;
  user_id: string;
  earning_type: 'signup' | 'deposit' | 'activity' | 'purchase';
  amount: number;
  commission_rate?: number;
  base_amount?: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  paid_at?: string;
  created_at: string;
}

export interface ApplyCodeResult {
  success: boolean;
  code_type?: 'affiliate' | 'user' | 'promotional';
  is_permanent?: boolean;
  message: string;
}

class EnhancedReferralService {
  // Apply a referral code to a user
  async applyReferralCode(
    userId: string, 
    code: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ApplyCodeResult> {
    try {
      const { data, error } = await supabase.rpc('apply_referral_code_enhanced', {
        p_user_id: userId,
        p_code: code,
        p_ip_address: ipAddress || null,
        p_user_agent: userAgent || null
      });

      if (error) throw error;

      return data || { success: false, message: 'Failed to apply referral code' };
    } catch (error) {
      console.error('Error applying referral code:', error);
      return { success: false, message: 'An error occurred while applying the referral code' };
    }
  }

  // Get a specific referral code by code string
  async getReferralCode(code: string): Promise<ReferralCode | null> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting referral code:', error);
      return null;
    }
  }

  // Get all referral codes for a user (owned by them)
  async getUserReferralCodes(userId: string): Promise<ReferralCode[]> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user referral codes:', error);
      return [];
    }
  }

  // Get the user's permanent affiliate code if any
  async getUserPermanentAffiliateCode(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('permanent_affiliate_code')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.permanent_affiliate_code || null;
    } catch (error) {
      console.error('Error getting permanent affiliate code:', error);
      return null;
    }
  }

  // Get platform URL for a user (checks affiliate codes first)
  async getPlatformUrlForUser(userId: string, platformId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('get_platform_url_for_user', {
        p_user_id: userId,
        p_platform_id: platformId
      });

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error getting platform URL:', error);
      return null;
    }
  }

  // Create a new referral code
  async createReferralCode(params: {
    code: string;
    code_type: 'affiliate' | 'user' | 'promotional';
    owner_id?: string;
    description?: string;
    is_permanent?: boolean;
    commission_rate?: number;
    fixed_bonus?: number;
    usage_limit?: number;
    expires_at?: string;
  }): Promise<ReferralCode | null> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .insert({
          code: params.code.toUpperCase(),
          code_type: params.code_type,
          owner_id: params.owner_id,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          description: params.description,
          is_permanent: params.is_permanent || false,
          commission_rate: params.commission_rate || 0,
          fixed_bonus: params.fixed_bonus || 0,
          usage_limit: params.usage_limit,
          expires_at: params.expires_at
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating referral code:', error);
      return null;
    }
  }

  // Update affiliate platform URLs
  async updateAffiliatePlatformUrls(
    codeId: string, 
    platformUrls: Array<{ platform_id: string; platform_name: string; url: string }>
  ): Promise<boolean> {
    try {
      // Delete existing URLs
      await supabase
        .from('affiliate_platform_urls')
        .delete()
        .eq('code_id', codeId);

      // Insert new URLs
      if (platformUrls.length > 0) {
        const { error } = await supabase
          .from('affiliate_platform_urls')
          .insert(
            platformUrls.map(p => ({
              code_id: codeId,
              platform_id: p.platform_id,
              platform_name: p.platform_name,
              url: p.url
            }))
          );

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating platform URLs:', error);
      return false;
    }
  }

  // Get affiliate earnings
  async getAffiliateEarnings(codeId: string): Promise<AffiliateEarning[]> {
    try {
      const { data, error } = await supabase
        .from('affiliate_earnings')
        .select('*')
        .eq('affiliate_code_id', codeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting affiliate earnings:', error);
      return [];
    }
  }

  // Get code usage statistics
  async getCodeUsageStats(codeId: string): Promise<{
    total_users: number;
    total_earnings: number;
    recent_usage: ReferralCodeUsage[];
  }> {
    try {
      // Get usage count
      const { data: usage, error: usageError } = await supabase
        .from('referral_code_usage')
        .select('*')
        .eq('code_id', codeId)
        .order('applied_at', { ascending: false })
        .limit(10);

      if (usageError) throw usageError;

      // Get earnings
      const { data: earnings, error: earningsError } = await supabase
        .from('affiliate_earnings')
        .select('amount')
        .eq('affiliate_code_id', codeId)
        .eq('status', 'approved');

      if (earningsError) throw earningsError;

      const totalEarnings = earnings?.reduce((sum, e) => sum + e.amount, 0) || 0;

      return {
        total_users: usage?.length || 0,
        total_earnings: totalEarnings,
        recent_usage: usage || []
      };
    } catch (error) {
      console.error('Error getting code usage stats:', error);
      return {
        total_users: 0,
        total_earnings: 0,
        recent_usage: []
      };
    }
  }

  // Track an affiliate earning event
  async trackAffiliateEarning(
    userId: string,
    earningType: 'signup' | 'deposit' | 'activity' | 'purchase',
    baseAmount: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('track_affiliate_earning', {
        p_user_id: userId,
        p_earning_type: earningType,
        p_base_amount: baseAmount
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error tracking affiliate earning:', error);
      return false;
    }
  }

  // Check if a code is available
  async isCodeAvailable(code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('code', code.toUpperCase())
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned means code is available
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking code availability:', error);
      return false;
    }
  }

  // Generate a unique referral link
  generateReferralLink(code: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${code}`;
  }

  // Migrate user's existing referral code to new system
  async migrateUserReferralCode(userId: string): Promise<boolean> {
    try {
      // Get user's existing referral code
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
        .single();

      if (profileError || !profile?.referral_code) {
        return false;
      }

      // Check if already migrated
      const existing = await this.getReferralCode(profile.referral_code);
      if (existing) {
        return true;
      }

      // Create new referral code entry
      const created = await this.createReferralCode({
        code: profile.referral_code,
        code_type: 'user',
        owner_id: userId,
        description: 'User referral code',
        fixed_bonus: 10.00
      });

      return created !== null;
    } catch (error) {
      console.error('Error migrating referral code:', error);
      return false;
    }
  }
}

export const enhancedReferralService = new EnhancedReferralService();