import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase/client';
import { Shield, Check, X, Globe, Mail, User, Wallet, Users, Bell, Wifi } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import OAuthService from '../services/oauth/OAuthServiceBrowser';

function OAuthConsent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [client, setClient] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [requestedScopes, setRequestedScopes] = useState([]);

  // Get query parameters
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');

  const scopeIcons = {
    'openid': Globe,
    'profile': User,
    'email': Mail,
    'wallets:read': Wallet,
    'wallets:write': Wallet,
    'groups:read': Users,
    'groups:write': Users,
    'friends:read': Users,
    'notifications:write': Bell,
    'offline_access': Wifi
  };

  const scopeDescriptions = {
    'openid': 'Access your unique identifier',
    'profile': 'View your profile information (name, avatar)',
    'email': 'View your email address',
    'wallets:read': 'View your wallet balances and transaction history',
    'wallets:write': 'Perform wallet operations like deposits and withdrawals',
    'groups:read': 'View your groups and group information',
    'groups:write': 'Create and manage groups on your behalf',
    'friends:read': 'View your friends list',
    'notifications:write': 'Send you notifications',
    'offline_access': 'Access your data when you are offline'
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login with return URL
        const returnUrl = new URL(window.location.href);
        navigate(`/login?return_to=${encodeURIComponent(returnUrl)}`);
        return;
      }
      setUser(user);

      // Validate OAuth request
      if (!clientId || !redirectUri || !scope) {
        setError('Invalid request: Missing required parameters');
        setLoading(false);
        return;
      }

      // Get client details
      const clientData = await OAuthService.getClient(clientId);
      if (!clientData) {
        setError('Invalid client');
        setLoading(false);
        return;
      }
      setClient(clientData);

      // Parse requested scopes
      const scopes = scope.split(' ').filter(s => s);
      setRequestedScopes(scopes);

      // Check if user has already consented
      const hasConsented = await OAuthService.hasUserConsented(user.id, clientId, scopes);
      if (hasConsented || clientData.is_verified) {
        // Auto-approve and redirect
        await handleApprove(true);
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error('Error in OAuth consent:', err);
      setError('An error occurred while processing your request');
      setLoading(false);
    }
  };

  const handleApprove = async (autoApprove = false) => {
    setSubmitting(true);
    try {
      if (!autoApprove) {
        // Save user consent
        await OAuthService.saveUserConsent(user.id, clientId, requestedScopes);
      }

      // Generate authorization code
      const code = await OAuthService.createAuthorizationCode(
        clientId,
        user.id,
        redirectUri,
        requestedScopes,
        codeChallenge,
        codeChallengeMethod
      );

      // Update statistics
      await OAuthService.updateClientStatistics(clientId, 'authorization');

      // Redirect with code
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.append('code', code);
      if (state) {
        redirectUrl.searchParams.append('state', state);
      }
      window.location.href = redirectUrl.toString();
    } catch (err) {
      console.error('Error approving consent:', err);
      setError('Failed to authorize application');
      setSubmitting(false);
    }
  };

  const handleDeny = () => {
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.append('error', 'access_denied');
    if (state) {
      redirectUrl.searchParams.append('state', state);
    }
    window.location.href = redirectUrl.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <X className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Authorization Error
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Bankroll Logo */}
        <div className="text-center mb-8">
          <img
            src="/images/BankrollLogoTransparent.png"
            alt="Bankroll"
            className="h-12 mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sign in with Bankroll
          </h1>
        </div>

        {/* Consent Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* App Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              {client.logo_url ? (
                <img
                  src={client.logo_url}
                  alt={client.name}
                  className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {client.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {client.description || 'This application would like to:'}
                </p>
                {client.is_verified && (
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <Check className="h-3 w-3 mr-1" />
                    Verified by Bankroll
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="p-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              This app will be able to:
            </h4>
            <ul className="space-y-3">
              {requestedScopes.map((scope) => {
                const Icon = scopeIcons[scope] || Shield;
                return (
                  <li key={scope} className="flex items-start">
                    <Icon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {scopeDescriptions[scope] || scope}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>{client.name}</strong> will not be able to:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-300">
                <li>• Access your password or PIN</li>
                <li>• Make transactions without your approval</li>
                <li>• Access data beyond what's listed above</li>
              </ul>
            </div>

            {/* User Info */}
            <div className="mt-6 flex items-center text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4 mr-2" />
              <span>Signing in as {user.email}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-between space-x-3">
            <button
              onClick={handleDeny}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleApprove(false)}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Authorizing...' : 'Authorize'}
            </button>
          </div>

          {/* Footer Links */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center space-x-4 text-xs">
              {client.privacy_policy_url && (
                <a
                  href={client.privacy_policy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Privacy Policy
                </a>
              )}
              {client.terms_of_service_url && (
                <a
                  href={client.terms_of_service_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Terms of Service
                </a>
              )}
              {client.support_email && (
                <a
                  href={`mailto:${client.support_email}`}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Support
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <Shield className="inline h-3 w-3 mr-1" />
            This authorization is secure and follows OAuth 2.0 standards
          </p>
        </div>
      </div>
    </div>
  );
}

export default OAuthConsent;