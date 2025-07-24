// Meld API Service for Bank Connections
// Documentation: https://docs.meld.io/

class MeldService {
  constructor() {
    // Use environment variables for API keys
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
      console.error('Meld API Error:', error);
      throw error;
    }
  }

  // Create a new user in Meld
  async createUser(userData) {
    return this.makeRequest('/users', 'POST', userData);
  }

  // Get user by ID
  async getUser(userId) {
    return this.makeRequest(`/users/${userId}`, 'GET');
  }

  // Initialize bank connection flow
  async createBankConnection(userId, options = {}) {
    const payload = {
      user_id: userId,
      ...options
    };
    
    return this.makeRequest('/connections', 'POST', payload);
  }

  // Get connection status
  async getConnectionStatus(connectionId) {
    return this.makeRequest(`/connections/${connectionId}`, 'GET');
  }

  // Get user's bank accounts
  async getUserAccounts(userId) {
    return this.makeRequest(`/users/${userId}/accounts`, 'GET');
  }

  // Get specific account details
  async getAccount(accountId) {
    return this.makeRequest(`/accounts/${accountId}`, 'GET');
  }

  // Get account transactions
  async getAccountTransactions(accountId, options = {}) {
    const queryParams = new URLSearchParams(options).toString();
    const endpoint = queryParams 
      ? `/accounts/${accountId}/transactions?${queryParams}`
      : `/accounts/${accountId}/transactions`;
    
    return this.makeRequest(endpoint, 'GET');
  }

  // Initiate account verification
  async initiateAccountVerification(accountId, verificationData) {
    return this.makeRequest(`/accounts/${accountId}/verify`, 'POST', verificationData);
  }

  // Delete a connection
  async deleteConnection(connectionId) {
    return this.makeRequest(`/connections/${connectionId}`, 'DELETE');
  }

  // Get institution list (for bank selection)
  async getInstitutions(options = {}) {
    const queryParams = new URLSearchParams(options).toString();
    const endpoint = queryParams 
      ? `/institutions?${queryParams}`
      : '/institutions';
    
    return this.makeRequest(endpoint, 'GET');
  }

  // Search institutions
  async searchInstitutions(searchTerm) {
    return this.getInstitutions({ search: searchTerm });
  }

  // Validate webhook signature (for backend use)
  validateWebhookSignature(payload, signature) {
    // This should be implemented on your backend
    // The signature validation logic depends on Meld's webhook signature method
    console.warn('Webhook validation should be done on the backend');
    return false;
  }

  // Helper to check if service is properly configured
  isConfigured() {
    return Boolean(this.apiKey);
  }

  // Get sandbox test credentials (for development)
  getSandboxTestCredentials() {
    if (import.meta.env.VITE_MELD_ENV !== 'production') {
      return {
        testInstitution: 'meld_sandbox_bank',
        testUsername: 'user_good',
        testPassword: 'pass_good',
        message: 'Use these credentials for testing in sandbox mode'
      };
    }
    return null;
  }
}

// Export singleton instance
export const meldService = new MeldService();