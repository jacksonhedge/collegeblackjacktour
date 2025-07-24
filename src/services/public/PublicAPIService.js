/**
 * Public.com API Service
 * Handles all interactions with Public's API for APY, trading, and crypto
 */

import { supabase } from '../supabase/config';

class PublicAPIService {
  constructor() {
    this.baseURL = process.env.VITE_PUBLIC_API_URL || 'https://api.public.com/v1';
    this.apiKey = process.env.VITE_PUBLIC_API_KEY;
    this.apiSecret = process.env.VITE_PUBLIC_API_SECRET;
    this.webhookSecret = process.env.VITE_PUBLIC_WEBHOOK_SECRET;
    
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Authentication
   */
  async authenticate() {
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseURL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.apiKey}:${this.apiSecret}`)}`
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          scope: 'accounts trading market_data'
        })
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Public API authentication failed:', error);
      throw error;
    }
  }

  async makeRequest(endpoint, options = {}) {
    const token = await this.authenticate();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  /**
   * Account Management
   */
  async createAccount(userId, accountData) {
    const response = await this.makeRequest('/accounts', {
      method: 'POST',
      body: JSON.stringify({
        external_id: userId,
        type: 'cash_management',
        features: ['apy_earnings', 'trading', 'crypto'],
        owner: accountData
      })
    });

    // Store account mapping
    await supabase
      .from('public_accounts')
      .insert({
        user_id: userId,
        public_account_id: response.id,
        account_type: 'integrated',
        features: ['apy', 'trading', 'crypto']
      });

    return response;
  }

  async getAccount(accountId) {
    return this.makeRequest(`/accounts/${accountId}`);
  }

  async getBalance(accountId) {
    return this.makeRequest(`/accounts/${accountId}/balance`);
  }

  /**
   * APY Services
   */
  async getAPYRate() {
    const rates = await this.makeRequest('/rates/apy');
    return rates.cash_management_rate;
  }

  async getInterestAccrued(accountId, startDate, endDate) {
    return this.makeRequest(`/accounts/${accountId}/interest`, {
      params: { start_date: startDate, end_date: endDate }
    });
  }

  async enableAPY(userId) {
    const { data: account } = await supabase
      .from('public_accounts')
      .select('public_account_id')
      .eq('user_id', userId)
      .single();

    if (!account) {
      throw new Error('No Public account found for user');
    }

    // Enable APY feature
    const response = await this.makeRequest(`/accounts/${account.public_account_id}/features`, {
      method: 'POST',
      body: JSON.stringify({
        feature: 'apy_earnings',
        enabled: true
      })
    });

    // Create APY tracking record
    await supabase
      .from('apy_accounts')
      .insert({
        user_id: userId,
        public_account_id: account.public_account_id,
        current_apy_rate: await this.getAPYRate()
      });

    return response;
  }

  /**
   * Stock Trading
   */
  async getMarketHours() {
    return this.makeRequest('/market/hours');
  }

  async getQuote(symbol) {
    return this.makeRequest(`/quotes/${symbol}`);
  }

  async getQuotes(symbols) {
    return this.makeRequest('/quotes', {
      params: { symbols: symbols.join(',') }
    });
  }

  async placeStockOrder(accountId, orderData) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        symbol: orderData.symbol,
        side: orderData.side, // 'buy' or 'sell'
        quantity: orderData.quantity,
        order_type: orderData.orderType || 'market',
        limit_price: orderData.limitPrice,
        time_in_force: orderData.timeInForce || 'day'
      })
    });
  }

  async getOrder(orderId) {
    return this.makeRequest(`/orders/${orderId}`);
  }

  async cancelOrder(orderId) {
    return this.makeRequest(`/orders/${orderId}`, {
      method: 'DELETE'
    });
  }

  async getPositions(accountId) {
    return this.makeRequest(`/accounts/${accountId}/positions`);
  }

  async getOrderHistory(accountId, limit = 100) {
    return this.makeRequest(`/accounts/${accountId}/orders`, {
      params: { limit, status: 'all' }
    });
  }

  /**
   * Cryptocurrency Trading
   */
  async getSupportedCryptos() {
    return this.makeRequest('/crypto/symbols');
  }

  async getCryptoQuote(symbol, side, amount) {
    return this.makeRequest('/crypto/quote', {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        side,
        base_currency: 'USD',
        amount
      })
    });
  }

  async placeCryptoOrder(accountId, orderData) {
    // Get quote first
    const quote = await this.getCryptoQuote(
      orderData.symbol,
      orderData.side,
      orderData.amount
    );

    // Place order with quote
    return this.makeRequest('/crypto/orders', {
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        quote_id: quote.id,
        symbol: orderData.symbol,
        side: orderData.side
      })
    });
  }

  async getCryptoPositions(accountId) {
    return this.makeRequest(`/accounts/${accountId}/crypto/positions`);
  }

  async getCryptoPrice(symbol) {
    const quote = await this.makeRequest(`/crypto/quotes/${symbol}`);
    return quote.price;
  }

  /**
   * Portfolio Analytics
   */
  async getPortfolioPerformance(accountId, period = '1M') {
    return this.makeRequest(`/accounts/${accountId}/performance`, {
      params: { period }
    });
  }

  async getAccountActivity(accountId, startDate, endDate) {
    return this.makeRequest(`/accounts/${accountId}/activity`, {
      params: { 
        start_date: startDate,
        end_date: endDate,
        types: 'all'
      }
    });
  }

  /**
   * B2B Services
   */
  async createSubAccount(partnerId, userData) {
    return this.makeRequest('/partners/accounts', {
      method: 'POST',
      body: JSON.stringify({
        partner_id: partnerId,
        user_data: userData,
        features: ['trading', 'crypto'],
        white_label: true
      })
    });
  }

  async getPartnerMetrics(partnerId) {
    return this.makeRequest(`/partners/${partnerId}/metrics`);
  }

  /**
   * Webhook Verification
   */
  verifyWebhook(payload, signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return signature === expectedSignature;
  }

  /**
   * Helper Methods
   */
  async getUserPublicAccount(userId) {
    const { data, error } = await supabase
      .from('public_accounts')
      .select('public_account_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new Error('No Public account found for user');
    }

    return data.public_account_id;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  calculateAPYEarnings(principal, rate, days) {
    const dailyRate = rate / 365;
    return principal * dailyRate * days;
  }
}

// Singleton instance
export const publicAPI = new PublicAPIService();

// React hooks for easy integration
export const usePublicAccount = (userId) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const accountId = await publicAPI.getUserPublicAccount(userId);
        const accountData = await publicAPI.getAccount(accountId);
        setAccount(accountData);
      } catch (error) {
        console.error('Failed to load Public account:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadAccount();
    }
  }, [userId]);

  return { account, loading };
};

export const useAPYBalance = (userId) => {
  const [balance, setBalance] = useState(0);
  const [interestEarned, setInterestEarned] = useState(0);
  const [apyRate, setAPYRate] = useState(0);

  useEffect(() => {
    const loadAPYData = async () => {
      try {
        const accountId = await publicAPI.getUserPublicAccount(userId);
        const [balanceData, rateData] = await Promise.all([
          publicAPI.getBalance(accountId),
          publicAPI.getAPYRate()
        ]);

        setBalance(balanceData.cash_balance);
        setAPYRate(rateData);

        // Calculate this month's interest
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const interest = await publicAPI.getInterestAccrued(
          accountId,
          startOfMonth.toISOString(),
          new Date().toISOString()
        );
        setInterestEarned(interest.total);
      } catch (error) {
        console.error('Failed to load APY data:', error);
      }
    };

    if (userId) {
      loadAPYData();
      // Refresh every minute
      const interval = setInterval(loadAPYData, 60000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  return { balance, interestEarned, apyRate };
};