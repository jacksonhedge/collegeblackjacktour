// JavaScript wrapper for TypeScript OAuth service
// This allows us to use the service in the Express server

// Use dynamic imports for Node.js modules
let crypto;
if (typeof window === 'undefined') {
  crypto = require('crypto');
}

// Import Supabase for both environments
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://cferwghhtstkxdiqhfqj.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

class OAuthServiceWrapper {
  constructor() {
    this.instance = null;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new OAuthServiceWrapper();
    }
    return this.instance;
  }

  // Generate secure random strings
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('base64url');
  }

  // Hash tokens for secure storage
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Verify PKCE code challenge
  verifyCodeChallenge(codeVerifier, codeChallenge, method = 'S256') {
    if (method === 'plain') {
      return codeVerifier === codeChallenge;
    } else {
      const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
      return hash === codeChallenge;
    }
  }

  // Validate redirect URI
  isValidRedirectUri(clientRedirectUris, redirectUri) {
    return clientRedirectUris.some(uri => {
      // Exact match
      if (uri === redirectUri) return true;
      
      // Allow localhost with any port for development
      if (uri.includes('localhost') && redirectUri.includes('localhost')) {
        const baseUri = uri.split(':')[0] + ':' + uri.split(':')[1];
        const baseRedirect = redirectUri.split(':')[0] + ':' + redirectUri.split(':')[1];
        return baseUri === baseRedirect;
      }
      
      return false;
    });
  }

  // Get OAuth client by client_id
  async getClient(clientId) {
    const { data, error } = await supabase
      .from('oauth_clients')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data;
  }

  // Create a new OAuth client
  async createClient(userId, clientData) {
    const clientId = this.generateSecureToken(16);
    const clientSecret = clientData.client_type === 'public' ? null : this.generateSecureToken(32);

    const { data, error } = await supabase
      .from('oauth_clients')
      .insert({
        user_id: userId,
        client_id: clientId,
        client_secret: clientSecret,
        client_type: clientData.client_type || 'confidential',
        name: clientData.name,
        description: clientData.description,
        logo_url: clientData.logo_url,
        redirect_uris: clientData.redirect_uris,
        allowed_scopes: clientData.allowed_scopes || ['openid', 'profile', 'email'],
        allowed_grant_types: ['authorization_code'],
        privacy_policy_url: clientData.privacy_policy_url,
        terms_of_service_url: clientData.terms_of_service_url,
        homepage_url: clientData.homepage_url,
        support_email: clientData.support_email
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Validate authorization request
  async validateAuthorizationRequest(request) {
    // Validate response type
    if (request.response_type !== 'code') {
      return { valid: false, error: 'unsupported_response_type' };
    }

    // Get and validate client
    const client = await this.getClient(request.client_id);
    if (!client) {
      return { valid: false, error: 'invalid_client' };
    }

    // Validate redirect URI
    if (!this.isValidRedirectUri(client.redirect_uris, request.redirect_uri)) {
      return { valid: false, error: 'invalid_redirect_uri' };
    }

    // Validate scopes
    const requestedScopes = request.scope.split(' ');
    const invalidScopes = requestedScopes.filter(scope => !client.allowed_scopes.includes(scope));
    if (invalidScopes.length > 0) {
      return { valid: false, error: 'invalid_scope' };
    }

    // Validate PKCE for public clients
    if (client.client_type === 'public' && !request.code_challenge) {
      return { valid: false, error: 'code_challenge_required' };
    }

    return { valid: true, client };
  }

  // Create authorization code
  async createAuthorizationCode(clientId, userId, redirectUri, scope, codeChallenge, codeChallengeMethod) {
    const code = this.generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error } = await supabase
      .from('oauth_authorization_codes')
      .insert({
        code,
        client_id: clientId,
        user_id: userId,
        redirect_uri: redirectUri,
        scope,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;
    return code;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForToken(request) {
    if (request.grant_type !== 'authorization_code') {
      throw new Error('Invalid grant type');
    }

    // Get and validate authorization code
    const { data: codeData, error: codeError } = await supabase
      .from('oauth_authorization_codes')
      .select('*')
      .eq('code', request.code)
      .eq('client_id', request.client_id)
      .is('used_at', null)
      .single();

    if (codeError || !codeData) {
      throw new Error('Invalid authorization code');
    }

    // Check if code is expired
    if (new Date(codeData.expires_at) < new Date()) {
      throw new Error('Authorization code expired');
    }

    // Validate redirect URI
    if (codeData.redirect_uri !== request.redirect_uri) {
      throw new Error('Invalid redirect URI');
    }

    // Get client
    const client = await this.getClient(request.client_id);
    if (!client) {
      throw new Error('Invalid client');
    }

    // Validate client credentials for confidential clients
    if (client.client_type === 'confidential') {
      if (!request.client_secret || request.client_secret !== client.client_secret) {
        throw new Error('Invalid client credentials');
      }
    }

    // Validate PKCE
    if (codeData.code_challenge) {
      if (!request.code_verifier) {
        throw new Error('Code verifier required');
      }
      
      const validPKCE = this.verifyCodeChallenge(
        request.code_verifier,
        codeData.code_challenge,
        codeData.code_challenge_method || 'S256'
      );
      
      if (!validPKCE) {
        throw new Error('Invalid code verifier');
      }
    }

    // Mark code as used
    await supabase
      .from('oauth_authorization_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('code', request.code);

    // Generate tokens
    const accessToken = this.generateSecureToken(32);
    const refreshToken = this.generateSecureToken(32);
    const expiresIn = 3600; // 1 hour

    // Store access token
    await supabase
      .from('oauth_access_tokens')
      .insert({
        token_hash: this.hashToken(accessToken),
        client_id: request.client_id,
        user_id: codeData.user_id,
        scope: codeData.scope,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString()
      });

    // Store refresh token
    await supabase
      .from('oauth_refresh_tokens')
      .insert({
        token_hash: this.hashToken(refreshToken),
        client_id: request.client_id,
        user_id: codeData.user_id,
        scope: codeData.scope,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });

    // Create ID token if openid scope is requested
    let idToken;
    if (codeData.scope.includes('openid')) {
      idToken = await this.createIdToken(codeData.user_id, request.client_id, codeData.scope);
    }

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      refresh_token: refreshToken,
      scope: codeData.scope.join(' '),
      id_token: idToken
    };
  }

  // Refresh access token
  async refreshAccessToken(request) {
    if (request.grant_type !== 'refresh_token' || !request.refresh_token) {
      throw new Error('Invalid grant type or missing refresh token');
    }

    const tokenHash = this.hashToken(request.refresh_token);

    // Get refresh token
    const { data: refreshTokenData, error } = await supabase
      .from('oauth_refresh_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('client_id', request.client_id)
      .is('revoked_at', null)
      .single();

    if (error || !refreshTokenData) {
      throw new Error('Invalid refresh token');
    }

    // Check if expired
    if (refreshTokenData.expires_at && new Date(refreshTokenData.expires_at) < new Date()) {
      throw new Error('Refresh token expired');
    }

    // Get client
    const client = await this.getClient(request.client_id);
    if (!client) {
      throw new Error('Invalid client');
    }

    // Validate client credentials for confidential clients
    if (client.client_type === 'confidential') {
      if (!request.client_secret || request.client_secret !== client.client_secret) {
        throw new Error('Invalid client credentials');
      }
    }

    // Revoke old refresh token
    await supabase
      .from('oauth_refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', refreshTokenData.id);

    // Generate new tokens
    const accessToken = this.generateSecureToken(32);
    const newRefreshToken = this.generateSecureToken(32);
    const expiresIn = 3600; // 1 hour

    // Store new access token
    await supabase
      .from('oauth_access_tokens')
      .insert({
        token_hash: this.hashToken(accessToken),
        client_id: request.client_id,
        user_id: refreshTokenData.user_id,
        scope: refreshTokenData.scope,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString()
      });

    // Store new refresh token with link to old one
    const { data: newRefreshTokenData } = await supabase
      .from('oauth_refresh_tokens')
      .insert({
        token_hash: this.hashToken(newRefreshToken),
        client_id: request.client_id,
        user_id: refreshTokenData.user_id,
        scope: refreshTokenData.scope,
        expires_at: refreshTokenData.expires_at
      })
      .select()
      .single();

    // Update old token to reference new one
    if (newRefreshTokenData) {
      await supabase
        .from('oauth_refresh_tokens')
        .update({ replaced_by: newRefreshTokenData.id })
        .eq('id', refreshTokenData.id);
    }

    // Create ID token if openid scope is included
    let idToken;
    if (refreshTokenData.scope.includes('openid')) {
      idToken = await this.createIdToken(refreshTokenData.user_id, request.client_id, refreshTokenData.scope);
    }

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      refresh_token: newRefreshToken,
      scope: refreshTokenData.scope.join(' '),
      id_token: idToken
    };
  }

  // Validate access token
  async validateAccessToken(token) {
    const tokenHash = this.hashToken(token);

    const { data, error } = await supabase
      .from('oauth_access_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .single();

    if (error || !data) {
      return { valid: false };
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: data.user_id,
      clientId: data.client_id,
      scope: data.scope
    };
  }

  // Get user info based on scope
  async getUserInfo(userId, scope) {
    const userInfo = {
      sub: userId // Subject identifier
    };

    // Get user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (scope.includes('profile') && profile) {
      userInfo.name = profile.display_name || profile.username;
      userInfo.picture = profile.avatar_url;
      userInfo.preferred_username = profile.username;
    }

    if (scope.includes('email')) {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      if (user) {
        userInfo.email = user.email;
        userInfo.email_verified = user.email_confirmed_at !== null;
      }
    }

    return userInfo;
  }

  // Create ID token (simplified - in production, use proper JWT library)
  async createIdToken(userId, clientId, scope) {
    const userInfo = await this.getUserInfo(userId, scope);
    
    const payload = {
      iss: 'https://auth.bankroll.com',
      sub: userId,
      aud: clientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      ...userInfo
    };

    // In production, sign this with a proper JWT library
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }

  // Save user consent
  async saveUserConsent(userId, clientId, scope) {
    await supabase
      .from('oauth_user_consents')
      .upsert({
        user_id: userId,
        client_id: clientId,
        scope,
        granted_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,client_id'
      });
  }

  // Check if user has already consented
  async hasUserConsented(userId, clientId, scope) {
    const { data } = await supabase
      .from('oauth_user_consents')
      .select('scope')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .is('revoked_at', null)
      .single();

    if (!data) return false;

    // Check if all requested scopes are already granted
    return scope.every(s => data.scope.includes(s));
  }

  // Revoke tokens
  async revokeToken(token, tokenType) {
    const tokenHash = this.hashToken(token);
    const table = tokenType === 'access_token' ? 'oauth_access_tokens' : 'oauth_refresh_tokens';

    await supabase
      .from(table)
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', tokenHash);
  }

  // Update client statistics
  async updateClientStatistics(clientId, type) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('oauth_client_statistics')
      .select('*')
      .eq('client_id', clientId)
      .eq('date', today)
      .single();

    if (data) {
      const update = {};
      if (type === 'authorization') {
        update.authorization_count = data.authorization_count + 1;
      } else {
        update.token_count = data.token_count + 1;
      }
      
      await supabase
        .from('oauth_client_statistics')
        .update(update)
        .eq('id', data.id);
    } else {
      const insert = {
        client_id: clientId,
        date: today,
        authorization_count: type === 'authorization' ? 1 : 0,
        token_count: type === 'token' ? 1 : 0
      };
      
      await supabase
        .from('oauth_client_statistics')
        .insert(insert);
    }
  }
}

// Export for CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OAuthServiceWrapper.getInstance();
}

// Export for ES6 modules (Vite/Browser)
export default OAuthServiceWrapper.getInstance();