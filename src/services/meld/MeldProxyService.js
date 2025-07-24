// Meld Proxy Service - Makes calls through your backend to protect API keys
// This service communicates with your backend, which then calls Meld's API

class MeldProxyService {
  constructor() {
    // Your backend endpoint that proxies Meld requests
    this.backendUrl = import.meta.env.VITE_API_URL || 'https://api.bankroll.live';
    
    // Enable when backend URL is configured
    this.isEnabled = !!import.meta.env.VITE_API_URL;
  }

  // Helper method for backend API requests
  async makeBackendRequest(endpoint, method = 'GET', body = null) {
    // Check if Meld is enabled
    if (!this.isEnabled) {
      throw new Error('Bank connections are temporarily unavailable. Please try again later.');
    }
    
    const url = `${this.backendUrl}/api/meld${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      // Add your auth token if needed
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
    };

    const options = {
      method,
      headers,
      credentials: 'include' // Include cookies if using session-based auth
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
      console.error('Backend API Error:', error);
      throw error;
    }
  }

  // Create or get Meld user for current user
  async createOrGetMeldUser(userData) {
    return this.makeBackendRequest('/users/create-or-get', 'POST', userData);
  }

  // Initialize bank connection flow
  async initiateBankConnection(options = {}) {
    if (!this.isEnabled) {
      throw new Error('Bank connections are temporarily unavailable. Please try again later.');
    }
    return this.makeBackendRequest('/connections', 'POST', options);
  }

  // Get user's connected bank accounts
  async getConnectedAccounts() {
    return this.makeBackendRequest('/accounts', 'GET');
  }

  // Get specific account details
  async getAccountDetails(accountId) {
    return this.makeBackendRequest(`/accounts/${accountId}`, 'GET');
  }

  // Get account transactions
  async getAccountTransactions(accountId, options = {}) {
    const queryParams = new URLSearchParams(options).toString();
    const endpoint = queryParams 
      ? `/accounts/${accountId}/transactions?${queryParams}`
      : `/accounts/${accountId}/transactions`;
    
    return this.makeBackendRequest(endpoint, 'GET');
  }

  // Delete a bank connection
  async deleteBankConnection(connectionId) {
    return this.makeBackendRequest(`/connections/${connectionId}`, 'DELETE');
  }

  // Get available institutions
  async getAvailableInstitutions(searchTerm = '') {
    const endpoint = searchTerm 
      ? `/institutions?search=${encodeURIComponent(searchTerm)}`
      : '/institutions';
    
    return this.makeBackendRequest(endpoint, 'GET');
  }

  // Handle Meld Connect callback
  async handleConnectCallback(code, state) {
    return this.makeBackendRequest('/connections/callback', 'POST', { code, state });
  }

  // Verify micro-deposits
  async verifyMicroDeposits(accountId, amounts) {
    return this.makeBackendRequest(`/accounts/${accountId}/verify`, 'POST', { amounts });
  }

  // Check connection status
  async checkConnectionStatus(connectionId) {
    return this.makeBackendRequest(`/connections/${connectionId}/status`, 'GET');
  }
}

// Export singleton instance
export const meldProxyService = new MeldProxyService();