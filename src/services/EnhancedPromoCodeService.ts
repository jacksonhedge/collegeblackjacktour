import { enhancedReferralService } from './EnhancedReferralService';

/**
 * Enhanced PromoCode Service that integrates with the referral system
 * Handles dynamic platform URL mapping based on user's affiliate/promo codes
 */
class EnhancedPromoCodeService {
  // Default platform URLs (fallback when no custom URLs are defined)
  private defaultUrls: Record<string, string> = {
    // Sportsbook
    'draftkings-sportsbook': 'https://dksb.sng.link/As9kz/0uj4?_dl=https%3A%2F%2Fsportsbook.draftkings.com%2Fgateway%3Fs%3D471182079&pcid=414490&psn=3084&pcn=SSB18&pscn=100DB_50BB&pcrn=1&pscid=xx&pcrid=xx&wpcid=414490&wpsrc=3084&wpcn=SSB18&wpscn=100DB_50BB&wpcrn=1&wpscid=xx&wpcrid=xx&_forward_params=1',
    'fanduel-sportsbook': 'https://wlfanduelus.adsrv.eacdn.com/C.ashx?btag=a_42626b_16c_&affid=5594&siteid=42626&adid=16&c=662608032',
    'fanatics-sportsbook': 'https://track.fanaticsbettingpartners.com/track/d2ed08a4-86b2-4b78-8e8b-37ba1c9a20dd?type=seo&s1=662608032',
    'betmgm-sportsbook': 'https://sports.betmgm.com',
    'caesars-sportsbook': 'https://sportsbook.caesars.com',
    'espn-bet': 'https://espnbet.com',
    'betrivers': 'https://betrivers.com',
    
    // Casino
    'draftkings-casino': 'https://dksb.sng.link/As9kz/0uj4?_dl=https%3A%2F%2Fsportsbook.draftkings.com%2Fgateway%3Fs%3D471182079&pcid=414490&psn=3084&pcn=SSB18&pscn=100DB_50BB&pcrn=1&pscid=xx&pcrid=xx&wpcid=414490&wpsrc=3084&wpcn=SSB18&wpscn=100DB_50BB&wpcrn=1&wpscid=xx&wpcrid=xx&_forward_params=1',
    'fanduel-casino': 'https://wlfanduelus.adsrv.eacdn.com/C.ashx?btag=a_42627b_50c_&affid=5594&siteid=42627&adid=50&c=662608032',
    'fanatics-casino': 'https://casino.fanatics.com',
    'betmgm-casino': 'https://casino.betmgm.com',
    'caesars-casino': 'https://casino.caesars.com',
    'borgata': 'https://casino.borgataonline.com',
    
    // Fantasy
    'prizepicks': 'https://app.prizepicks.com/sign-up?invite_code=WINDAILY',
    'underdog': 'https://play.underdogfantasy.com/p-win-daily-sports',
    'sleeper': 'https://sleeper.app',
    'espn-fantasy': 'https://fantasy.espn.com',
    'yahoo-fantasy': 'https://sports.yahoo.com/fantasy',
    'betr-fantasy': 'https://betr.app',
    
    // Sweeps
    'mcluck': 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5356&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid',
    'pulsz': 'https://affiliates.pulsz.com/visit/?bta=3035&nci=5348&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid',
    'hello-millions': 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5357&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid',
    'crown-coins': 'https://crowncoinscasino.com/?landing=direct_su&utm_source=affiliates_seo&utm_content=662608032&utm_campaign=bankroll&utm_medium=bankroll&click_id={click_id}&deal_id=cfca54e2-e98f-4225-932b-80f69267d8b2',
    'sportsmillions': 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5414&afp={clickid}&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=PLAYBONUS&corid',
    'realprize': 'https://realprize.com/?af=2255&p1=662608032',
    'chumba': 'https://chumbacasino.com',
    'luckyland': 'https://luckylandslots.com',
    'wow-vegas': 'https://wowvegas.com',
    'high5': 'https://high5casino.com',
    
    // Lottery
    'jackpocket': 'https://jackpocket.com'
  };

  /**
   * Get platform URL for a specific user
   * Priority order:
   * 1. Permanent affiliate code URLs
   * 2. Active promotional code URLs
   * 3. Default platform URLs
   */
  async getPlatformUrl(userId: string | null, platformId: string): Promise<string> {
    try {
      // If user is logged in, check for custom URLs
      if (userId) {
        const customUrl = await enhancedReferralService.getPlatformUrlForUser(userId, platformId);
        if (customUrl) {
          return customUrl;
        }
      }

      // Return default URL
      return this.defaultUrls[platformId] || '';
    } catch (error) {
      console.error('Error getting platform URL:', error);
      return this.defaultUrls[platformId] || '';
    }
  }

  /**
   * Get all platform URLs for a user
   * Returns a map of platform IDs to URLs
   */
  async getAllPlatformUrls(userId: string | null): Promise<Record<string, string>> {
    const urls: Record<string, string> = {};

    // Start with default URLs
    Object.assign(urls, this.defaultUrls);

    // If user is logged in, override with custom URLs
    if (userId) {
      try {
        // Get user's permanent affiliate code
        const affiliateCode = await enhancedReferralService.getUserPermanentAffiliateCode(userId);
        
        if (affiliateCode) {
          // Get all custom URLs for this affiliate code
          const { data: customUrls } = await supabase
            .from('affiliate_platform_urls')
            .select('platform_id, url')
            .eq('code_id', affiliateCode);

          if (customUrls) {
            customUrls.forEach(cu => {
              urls[cu.platform_id] = cu.url;
            });
          }
        }

        // Also check for active promotional codes
        const { data: promoUrls } = await supabase
          .from('referral_code_usage')
          .select(`
            referral_codes!inner(
              id,
              code_type,
              is_active,
              affiliate_platform_urls(platform_id, url)
            )
          `)
          .eq('user_id', userId)
          .eq('referral_codes.code_type', 'promotional')
          .eq('referral_codes.is_active', true);

        if (promoUrls) {
          promoUrls.forEach(pu => {
            const platformUrls = pu.referral_codes?.affiliate_platform_urls;
            if (platformUrls) {
              platformUrls.forEach(url => {
                urls[url.platform_id] = url.url;
              });
            }
          });
        }
      } catch (error) {
        console.error('Error getting custom platform URLs:', error);
      }
    }

    return urls;
  }

  /**
   * Apply a promo code during signup
   * This will determine the type of code and apply it appropriately
   */
  async applyPromoCode(
    userId: string, 
    promoCode: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    message: string;
    codeType?: 'affiliate' | 'user' | 'promotional';
    isPermanent?: boolean;
  }> {
    try {
      const result = await enhancedReferralService.applyReferralCode(
        userId,
        promoCode,
        ipAddress,
        userAgent
      );

      return {
        success: result.success,
        message: result.message,
        codeType: result.code_type,
        isPermanent: result.is_permanent
      };
    } catch (error) {
      console.error('Error applying promo code:', error);
      return {
        success: false,
        message: 'Failed to apply promo code'
      };
    }
  }

  /**
   * Get user's active promo codes
   */
  async getUserPromoCodes(userId: string): Promise<{
    permanentAffiliateCode?: string;
    activePromoCodes: string[];
    userReferralCode?: string;
  }> {
    try {
      // Get permanent affiliate code
      const permanentAffiliateCode = await enhancedReferralService.getUserPermanentAffiliateCode(userId);

      // Get user's own referral code
      const userCodes = await enhancedReferralService.getUserReferralCodes(userId);
      const userReferralCode = userCodes.find(c => c.code_type === 'user')?.code;

      // Get active promotional codes
      const { data: activePromos } = await supabase
        .from('referral_code_usage')
        .select(`
          referral_codes!inner(
            code,
            code_type,
            is_active
          )
        `)
        .eq('user_id', userId)
        .eq('referral_codes.code_type', 'promotional')
        .eq('referral_codes.is_active', true);

      const activePromoCodes = activePromos?.map(p => p.referral_codes.code) || [];

      return {
        permanentAffiliateCode: permanentAffiliateCode || undefined,
        activePromoCodes,
        userReferralCode
      };
    } catch (error) {
      console.error('Error getting user promo codes:', error);
      return {
        activePromoCodes: []
      };
    }
  }

  /**
   * Replace placeholders in URLs with dynamic values
   */
  replacePlaceholders(url: string, params: Record<string, string>): string {
    let processedUrl = url;
    
    // Replace common placeholders
    const replacements = {
      '{clickid}': params.clickId || '',
      '{click_id}': params.clickId || '',
      '{user_id}': params.userId || '',
      '{ref_code}': params.refCode || '',
      '{source}': params.source || 'bankroll',
      '{campaign}': params.campaign || 'organic'
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      processedUrl = processedUrl.replace(new RegExp(placeholder, 'g'), value);
    });

    return processedUrl;
  }
}

// Import supabase after to avoid circular dependency
import { supabase } from '../services/supabase/config';

export const enhancedPromoCodeService = new EnhancedPromoCodeService();