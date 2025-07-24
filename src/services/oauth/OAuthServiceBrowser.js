// Browser-compatible OAuth service stub
// The actual OAuth operations happen on the server

class OAuthServiceBrowser {
  constructor() {
    this.instance = null;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new OAuthServiceBrowser();
    }
    return this.instance;
  }

  // Browser stub methods that redirect to server endpoints
  async validateAuthorizationRequest(params) {
    // This should be handled by the server
    throw new Error('OAuth operations must be performed on the server');
  }

  async exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
    // This should be handled by the server
    throw new Error('OAuth operations must be performed on the server');
  }

  async validateAccessToken(token) {
    // This should be handled by the server
    throw new Error('OAuth operations must be performed on the server');
  }

  async revokeAccessToken(token) {
    // This should be handled by the server
    throw new Error('OAuth operations must be performed on the server');
  }
}

export default OAuthServiceBrowser.getInstance();