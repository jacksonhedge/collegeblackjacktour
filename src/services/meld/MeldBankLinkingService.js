// Meld Bank Linking Service
// This service handles Meld's Bank Linking product for multi-provider support

class MeldBankLinkingService {
  constructor() {
    this.apiKey = import.meta.env.VITE_MELD_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_MELD_ENV === 'production' 
      ? 'https://api.meld.io' 
      : 'https://api-sb.meld.io';
  }

  // Helper method for API requests
  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `BASIC ${this.apiKey}`
    };

    const options = {
      method,
      headers
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Meld Bank Linking API Error:', error);
      throw error;
    }
  }

  // Create a new connection for bank linking
  async createConnection(params = {}) {
    const payload = {
      provider: params.provider || 'auto', // auto-select best provider
      user_id: params.userId,
      institution_id: params.institutionId,
      products: params.products || ['accounts', 'transactions', 'identity'],
      webhook_url: params.webhookUrl,
      redirect_url: params.redirectUrl,
      ...params
    };

    return this.makeRequest('/connections', 'POST', payload);
  }

  // Get connection details
  async getConnection(connectionId) {
    return this.makeRequest(`/connections/${connectionId}`, 'GET');
  }

  // Update connection (refresh data)
  async updateConnection(connectionId) {
    return this.makeRequest(`/connections/${connectionId}/update`, 'POST');
  }

  // Delete a connection
  async deleteConnection(connectionId) {
    return this.makeRequest(`/connections/${connectionId}`, 'DELETE');
  }

  // Get accounts for a connection
  async getAccounts(connectionId) {
    return this.makeRequest(`/connections/${connectionId}/accounts`, 'GET');
  }

  // Get transactions for an account
  async getTransactions(connectionId, accountId, params = {}) {
    const queryParams = new URLSearchParams({
      start_date: params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: params.endDate || new Date().toISOString().split('T')[0],
      ...params
    }).toString();

    return this.makeRequest(`/connections/${connectionId}/accounts/${accountId}/transactions?${queryParams}`, 'GET');
  }

  // Get identity information
  async getIdentity(connectionId) {
    return this.makeRequest(`/connections/${connectionId}/identity`, 'GET');
  }

  // Get balance information
  async getBalance(connectionId, accountId) {
    return this.makeRequest(`/connections/${connectionId}/accounts/${accountId}/balance`, 'GET');
  }

  // Get available institutions
  async getInstitutions(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/institutions?${queryParams}` : '/institutions';
    return this.makeRequest(endpoint, 'GET');
  }

  // Search institutions by name
  async searchInstitutions(query) {
    return this.getInstitutions({ q: query });
  }

  // Get supported providers
  async getProviders() {
    return this.makeRequest('/providers', 'GET');
  }

  // Get provider status
  async getProviderStatus(provider) {
    return this.makeRequest(`/providers/${provider}/status`, 'GET');
  }

  // Create Link token for Plaid-style flow
  async createLinkToken(params = {}) {
    const payload = {
      user_id: params.userId,
      products: params.products || ['accounts', 'transactions'],
      webhook: params.webhookUrl,
      redirect_uri: params.redirectUri,
      institution_id: params.institutionId,
      ...params
    };

    return this.makeRequest('/link/token', 'POST', payload);
  }

  // Exchange public token for access token
  async exchangePublicToken(publicToken) {
    return this.makeRequest('/link/exchange', 'POST', { public_token: publicToken });
  }

  // Get webhook verification
  async verifyWebhook(headers, body) {
    // This should be done on the backend
    console.warn('Webhook verification should be performed on the backend');
    return false;
  }

  // Helper to determine best provider for an institution
  async getBestProvider(institutionId) {
    const providers = await this.getProviders();
    // Logic to determine best provider based on institution support
    // This would typically be handled by Meld's auto-selection
    return 'auto';
  }

  // Get connection status
  async getConnectionStatus(connectionId) {
    const connection = await this.getConnection(connectionId);
    return {
      status: connection.status,
      lastSync: connection.last_successful_sync,
      provider: connection.provider,
      institutionName: connection.institution_name,
      error: connection.error
    };
  }

  // Initiate account verification (micro-deposits)
  async initiateVerification(connectionId, accountId) {
    return this.makeRequest(`/connections/${connectionId}/accounts/${accountId}/verify`, 'POST');
  }

  // Complete account verification
  async completeVerification(connectionId, accountId, amounts) {
    return this.makeRequest(`/connections/${connectionId}/accounts/${accountId}/verify`, 'PUT', { amounts });
  }

  // Get available products for a connection
  async getAvailableProducts(connectionId) {
    return this.makeRequest(`/connections/${connectionId}/products`, 'GET');
  }

  // Add products to existing connection
  async addProducts(connectionId, products) {
    return this.makeRequest(`/connections/${connectionId}/products`, 'POST', { products });
  }
}

// Export singleton instance
export const meldBankLinkingService = new MeldBankLinkingService();