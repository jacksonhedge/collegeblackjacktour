import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase/client';
import { Shield, Code, Users, BarChart3, Plus, Settings, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function DeveloperPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    checkAuth();
    loadApps();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login?return_to=/developers');
      return;
    }
    setUser(user);
  };

  const loadApps = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const response = await fetch('/api/oauth/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApps(data);
      }
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Developer Portal
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Build applications with Bankroll OAuth
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New App
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Apps
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {apps.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {apps.reduce((sum, app) => sum + (app.active_users || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  API Calls Today
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {apps.reduce((sum, app) => sum + (app.api_calls_today || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apps List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Your Applications
            </h3>
            
            {apps.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No applications
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating a new OAuth application.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create New App
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {apps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onSelect={() => setSelectedApp(app)}
                    onCopy={copyToClipboard}
                    copiedField={copiedField}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create App Modal */}
      {showCreateModal && (
        <CreateAppModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadApps();
          }}
        />
      )}

      {/* App Details Modal */}
      {selectedApp && (
        <AppDetailsModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={loadApps}
          onCopy={copyToClipboard}
          copiedField={copiedField}
        />
      )}
    </div>
  );
}

function AppCard({ app, onSelect, onCopy, copiedField }) {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {app.logo_url ? (
            <img
              src={app.logo_url}
              alt={app.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Code className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              {app.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {app.description || 'No description'}
            </p>
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400">Client ID:</span>
                <code className="ml-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  {app.client_id}
                </code>
                <button
                  onClick={() => onCopy(app.client_id, `client-id-${app.id}`)}
                  className="ml-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {copiedField === `client-id-${app.id}` ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {app.client_type === 'confidential' && (
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400">Secret:</span>
                  <code className="ml-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    {showSecret ? app.client_secret : '••••••••'}
                  </code>
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="ml-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {showSecret ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => onCopy(app.client_secret, `client-secret-${app.id}`)}
                    className="ml-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {copiedField === `client-secret-${app.id}` ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onSelect}
          className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Settings className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

function CreateAppModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    redirect_uris: [''],
    client_type: 'confidential',
    homepage_url: '',
    privacy_policy_url: '',
    terms_of_service_url: '',
    support_email: '',
    allowed_scopes: ['openid', 'profile', 'email']
  });
  const [loading, setLoading] = useState(false);

  const availableScopes = [
    { id: 'openid', name: 'OpenID', description: 'Access unique identifier' },
    { id: 'profile', name: 'Profile', description: 'Access basic profile information' },
    { id: 'email', name: 'Email', description: 'Access email address' },
    { id: 'wallets:read', name: 'Read Wallets', description: 'View wallet balances' },
    { id: 'wallets:write', name: 'Manage Wallets', description: 'Perform wallet operations' },
    { id: 'groups:read', name: 'Read Groups', description: 'View groups' },
    { id: 'groups:write', name: 'Manage Groups', description: 'Create and manage groups' },
    { id: 'friends:read', name: 'Read Friends', description: 'View friends list' },
    { id: 'notifications:write', name: 'Send Notifications', description: 'Send notifications' },
    { id: 'offline_access', name: 'Offline Access', description: 'Access data offline' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch('/api/oauth/clients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          redirect_uris: formData.redirect_uris.filter(uri => uri.trim())
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating app:', error);
      alert('Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  const addRedirectUri = () => {
    setFormData({
      ...formData,
      redirect_uris: [...formData.redirect_uris, '']
    });
  };

  const updateRedirectUri = (index, value) => {
    const uris = [...formData.redirect_uris];
    uris[index] = value;
    setFormData({ ...formData, redirect_uris: uris });
  };

  const removeRedirectUri = (index) => {
    const uris = formData.redirect_uris.filter((_, i) => i !== index);
    setFormData({ ...formData, redirect_uris: uris });
  };

  const toggleScope = (scopeId) => {
    const scopes = formData.allowed_scopes.includes(scopeId)
      ? formData.allowed_scopes.filter(s => s !== scopeId)
      : [...formData.allowed_scopes, scopeId];
    setFormData({ ...formData, allowed_scopes: scopes });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Create New Application
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Application Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client Type
                </label>
                <select
                  value={formData.client_type}
                  onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="confidential">Confidential (Server-side apps)</option>
                  <option value="public">Public (Client-side apps)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.client_type === 'confidential' 
                    ? 'Can securely store client secret. Use for server-side applications.'
                    : 'Cannot securely store secrets. Use for SPAs, mobile apps, etc.'}
                </p>
              </div>
            </div>
          </div>

          {/* Redirect URIs */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Redirect URIs *
            </h4>
            <div className="space-y-2">
              {formData.redirect_uris.map((uri, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="url"
                    required
                    value={uri}
                    onChange={(e) => updateRedirectUri(index, e.target.value)}
                    placeholder="https://example.com/callback"
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {formData.redirect_uris.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRedirectUri(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRedirectUri}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                + Add another redirect URI
              </button>
            </div>
          </div>

          {/* Scopes */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Permissions (Scopes)
            </h4>
            <div className="space-y-2">
              {availableScopes.map((scope) => (
                <label key={scope.id} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.allowed_scopes.includes(scope.id)}
                    onChange={() => toggleScope(scope.id)}
                    disabled={['openid', 'profile', 'email'].includes(scope.id)}
                    className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {scope.name}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {scope.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional URLs */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Additional Information
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Homepage URL
                </label>
                <input
                  type="url"
                  value={formData.homepage_url}
                  onChange={(e) => setFormData({ ...formData, homepage_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Privacy Policy URL
                </label>
                <input
                  type="url"
                  value={formData.privacy_policy_url}
                  onChange={(e) => setFormData({ ...formData, privacy_policy_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Terms of Service URL
                </label>
                <input
                  type="url"
                  value={formData.terms_of_service_url}
                  onChange={(e) => setFormData({ ...formData, terms_of_service_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.support_email}
                  onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AppDetailsModal({ app, onClose, onUpdate, onCopy, copiedField }) {
  const [activeTab, setActiveTab] = useState('details');
  const [statistics, setStatistics] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [app]);

  const loadStatistics = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`/api/oauth/clients/${app.client_id}/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`/api/oauth/clients/${app.client_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error deleting app:', error);
      alert('Failed to delete application');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {app.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 px-1 border-b-2 text-sm font-medium ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`pb-2 px-1 border-b-2 text-sm font-medium ${
                activeTab === 'statistics'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-2 px-1 border-b-2 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Credentials */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Credentials
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client ID
                    </label>
                    <div className="mt-1 flex items-center">
                      <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                        {app.client_id}
                      </code>
                      <button
                        onClick={() => onCopy(app.client_id, 'detail-client-id')}
                        className="ml-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        {copiedField === 'detail-client-id' ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {app.client_type === 'confidential' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Client Secret
                      </label>
                      <div className="mt-1 flex items-center">
                        <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                          {app.client_secret}
                        </code>
                        <button
                          onClick={() => onCopy(app.client_secret, 'detail-client-secret')}
                          className="ml-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          {copiedField === 'detail-client-secret' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        Keep this secret secure. Do not share it publicly or commit it to version control.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* OAuth URLs */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  OAuth Endpoints
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Authorization:</span>
                    <code className="ml-2 text-sm">/api/oauth/authorize</code>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Token:</span>
                    <code className="ml-2 text-sm">/api/oauth/token</code>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User Info:</span>
                    <code className="ml-2 text-sm">/api/oauth/userinfo</code>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Revoke:</span>
                    <code className="ml-2 text-sm">/api/oauth/revoke</code>
                  </div>
                </div>
              </div>

              {/* Configuration */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Configuration
                </h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                    <dd className="text-sm text-gray-900 dark:text-white capitalize">{app.client_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Redirect URIs</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {app.redirect_uris.map((uri, index) => (
                        <div key={index} className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-1">
                          {uri}
                        </div>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Allowed Scopes</dt>
                    <dd className="flex flex-wrap gap-2 mt-1">
                      {app.allowed_scopes.map((scope) => (
                        <span key={scope} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {scope}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div>
              {loadingStats ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                </div>
              ) : statistics.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No statistics available yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Authorizations
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                        {statistics.reduce((sum, stat) => sum + stat.authorization_count, 0)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Tokens Issued
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                        {statistics.reduce((sum, stat) => sum + stat.token_count, 0)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Active Users
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                        {statistics[0]?.active_users || 0}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Daily Usage
                    </h5>
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Authorizations
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Tokens
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Active Users
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {statistics.map((stat) => (
                            <tr key={stat.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(stat.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.authorization_count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.token_count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {stat.active_users}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Danger Zone
                </h5>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  Deleting an application will revoke all access tokens and prevent users from signing in.
                </p>
                <button
                  onClick={handleDelete}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeveloperPortal;