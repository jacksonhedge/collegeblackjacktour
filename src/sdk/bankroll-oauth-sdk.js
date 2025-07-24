/**
 * Bankroll OAuth SDK
 * Simple JavaScript SDK for implementing "Sign in with Bankroll"
 * 
 * @version 1.0.0
 */

class BankrollOAuth {
  constructor(config) {
    // If no config provided, don't throw - just create a stub instance
    if (!config) {
      console.warn('BankrollOAuth: No configuration provided');
      this.clientId = null;
      this.redirectUri = null;
      this.scope = 'openid profile email';
      this.baseUrl = 'https://app.bankroll.com';
      this.state = null;
      this.codeVerifier = null;
      this.codeChallenge = null;
      return;
    }
    
    if (!config.clientId) {
      throw new Error('clientId is required');
    }
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
    this.scope = config.scope || 'openid profile email';
    this.baseUrl = config.baseUrl || 'https://app.bankroll.com';
    this.state = null;
    this.codeVerifier = null;
    this.codeChallenge = null;
  }

  /**
   * Generate random string for state and PKCE
   */
  generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const values = crypto.getRandomValues(new Uint8Array(length));
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  }

  /**
   * Generate code challenge from verifier
   */
  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Start the OAuth authorization flow
   */
  async authorize(options = {}) {
    // Generate state for CSRF protection
    this.state = this.generateRandomString(32);
    sessionStorage.setItem('bankroll_oauth_state', this.state);

    // Generate PKCE values
    this.codeVerifier = this.generateRandomString(128);
    this.codeChallenge = await this.generateCodeChallenge(this.codeVerifier);
    sessionStorage.setItem('bankroll_oauth_verifier', this.codeVerifier);

    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: options.scope || this.scope,
      state: this.state,
      code_challenge: this.codeChallenge,
      code_challenge_method: 'S256'
    });

    // Add optional parameters
    if (options.login_hint) {
      params.append('login_hint', options.login_hint);
    }
    if (options.prompt) {
      params.append('prompt', options.prompt);
    }

    const authUrl = `${this.baseUrl}/api/oauth/authorize?${params}`;

    // Redirect or open popup
    if (options.popup) {
      return this.authorizeWithPopup(authUrl);
    } else {
      window.location.href = authUrl;
    }
  }

  /**
   * Open authorization in popup window
   */
  authorizeWithPopup(authUrl) {
    return new Promise((resolve, reject) => {
      const width = 500;
      const height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      const popup = window.open(
        authUrl,
        'bankroll_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for messages from popup
      const messageHandler = (event) => {
        if (event.origin !== this.baseUrl) return;

        if (event.data.type === 'bankroll_oauth_callback') {
          window.removeEventListener('message', messageHandler);
          popup.close();

          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            this.handleCallback(event.data.code, event.data.state)
              .then(resolve)
              .catch(reject);
          }
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was blocked
      if (!popup || popup.closed) {
        window.removeEventListener('message', messageHandler);
        reject(new Error('Popup was blocked'));
      }
    });
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code, state) {
    // Verify state
    const savedState = sessionStorage.getItem('bankroll_oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }

    // Get code verifier
    const codeVerifier = sessionStorage.getItem('bankroll_oauth_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code, codeVerifier);

    // Clean up session storage
    sessionStorage.removeItem('bankroll_oauth_state');
    sessionStorage.removeItem('bankroll_oauth_verifier');

    return tokens;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code, codeVerifier) {
    const response = await fetch(`${this.baseUrl}/api/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Failed to exchange code for tokens');
    }

    return response.json();
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    const response = await fetch(`${this.baseUrl}/api/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Failed to refresh token');
    }

    return response.json();
  }

  /**
   * Get user info
   */
  async getUserInfo(accessToken) {
    const response = await fetch(`${this.baseUrl}/api/oauth/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  /**
   * Revoke token
   */
  async revokeToken(token, tokenType = 'access_token') {
    const response = await fetch(`${this.baseUrl}/api/oauth/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        token: token,
        token_type_hint: tokenType,
        client_id: this.clientId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to revoke token');
    }

    return true;
  }

  /**
   * Parse callback URL (for redirect flow)
   */
  parseCallbackUrl(url = window.location.href) {
    try {
      // Don't attempt to parse if not properly configured
      if (!this.clientId) {
        return null;
      }
      
      const urlParams = new URLSearchParams(new URL(url).search);
      
      if (urlParams.has('error')) {
        throw new Error(urlParams.get('error_description') || urlParams.get('error'));
      }

      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (!code) {
        // Not an OAuth callback URL
        return null;
      }

      return { code, state };
    } catch (e) {
      // If URL is invalid, just return null
      console.warn('Invalid URL for OAuth callback:', e);
      return null;
    }
  }

  /**
   * Complete authorization (for redirect flow)
   */
  async completeAuthorization(url = window.location.href) {
    const result = this.parseCallbackUrl(url);
    if (!result) {
      throw new Error('Invalid callback URL');
    }
    const { code, state } = result;
    return this.handleCallback(code, state);
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BankrollOAuth;
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return BankrollOAuth; });
} else if (typeof window !== 'undefined') {
  window.BankrollOAuth = BankrollOAuth;
}