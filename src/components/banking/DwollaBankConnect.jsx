import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DwollaProxyService } from '../../services/payments/DwollaProxyService';
import { Search, Building2, ChevronRight, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const BANK_CONNECTION_STATES = {
  SEARCH: 'search',
  FORM: 'form',
  CONNECTING: 'connecting',
  SUCCESS: 'success',
  ERROR: 'error'
};

export default function DwollaBankConnect({ onSuccess, onCancel }) {
  const { currentUser } = useAuth();
  const [connectionState, setConnectionState] = useState(BANK_CONNECTION_STATES.SEARCH);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [iavToken, setIavToken] = useState(null);
  
  // Form state for manual bank account entry
  const [formData, setFormData] = useState({
    routingNumber: '',
    accountNumber: '',
    accountType: 'checking',
    accountName: ''
  });

  // Initialize Dwolla service
  const dwollaService = DwollaProxyService.getInstance();

  useEffect(() => {
    initializeDwollaCustomer();
  }, []);

  const initializeDwollaCustomer = async () => {
    try {
      setLoading(true);
      await dwollaService.authenticate();
      
      // Check if user already has a Dwolla customer ID
      if (currentUser.dwollaCustomerId) {
        setCustomerId(currentUser.dwollaCustomerId);
      } else {
        // Create a new Dwolla customer
        const customerData = {
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email,
          externalId: currentUser.id
        };
        
        const customer = await dwollaService.createCustomer(customerData);
        setCustomerId(customer.id);
        
        // Update user profile with Dwolla customer ID
        await updateUserProfile({ dwollaCustomerId: customer.id });
      }
    } catch (err) {
      console.error('Failed to initialize Dwolla customer:', err);
      setError('Failed to initialize payment services');
      setConnectionState(BANK_CONNECTION_STATES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates) => {
    // This would update the user profile in your database
    // Implementation depends on your backend setup
    console.log('Updating user profile:', updates);
  };

  const handleUseManualEntry = () => {
    setConnectionState(BANK_CONNECTION_STATES.FORM);
    setError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Link bank account using manual entry
      const account = await dwollaService.linkAccount(customerId, {
        routingNumber: formData.routingNumber,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType
      });
      
      setConnectionState(BANK_CONNECTION_STATES.SUCCESS);
      
      if (onSuccess) {
        onSuccess({
          accountId: account.id,
          accountName: account.name,
          bankName: account.bankName || 'Bank Account',
          last4: account.last4
        });
      }
    } catch (err) {
      console.error('Failed to link bank account:', err);
      setError(err.message || 'Failed to connect bank account');
      setConnectionState(BANK_CONNECTION_STATES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantVerification = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get IAV token from Dwolla
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dwolla/customers/${customerId}/iav-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getCurrentUserToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get verification token');
      }
      
      const { token } = await response.json();
      setIavToken(token);
      
      // Initialize Dwolla IAV (Instant Account Verification)
      initializeDwollaIAV(token);
    } catch (err) {
      console.error('Failed to start instant verification:', err);
      setError('Failed to start instant verification');
    } finally {
      setLoading(false);
    }
  };

  const initializeDwollaIAV = (token) => {
    // Load Dwolla IAV script
    const script = document.createElement('script');
    script.src = 'https://cdn.dwolla.com/1/dwolla.js';
    script.async = true;
    script.onload = () => {
      // Initialize Dwolla IAV
      window.dwolla.configure(import.meta.env.VITE_DWOLLA_ENV || 'sandbox');
      
      window.dwolla.iav.start(
        token,
        {
          container: 'dwolla-iav-container',
          stylesheets: [
            'https://fonts.googleapis.com/css?family=Inter:400,500,600'
          ],
          microDeposits: false,
          fallbackToMicroDeposits: true,
          subscriber: ({ currentPage, error }) => {
            console.log('IAV Event:', currentPage, error);
            
            if (error) {
              setError(error.message || 'Verification failed');
              setConnectionState(BANK_CONNECTION_STATES.ERROR);
            }
          }
        },
        async (err, res) => {
          if (err) {
            console.error('IAV Error:', err);
            setError(err.message || 'Failed to verify account');
            setConnectionState(BANK_CONNECTION_STATES.ERROR);
          } else {
            console.log('IAV Success:', res);
            setConnectionState(BANK_CONNECTION_STATES.SUCCESS);
            
            if (onSuccess) {
              // Fetch the newly created funding source details
              const accounts = await dwollaService.getAccounts(customerId);
              const newAccount = accounts[accounts.length - 1]; // Most recent account
              
              onSuccess({
                accountId: newAccount.id,
                accountName: newAccount.name,
                bankName: newAccount.bankName || 'Bank Account',
                last4: newAccount.last4
              });
            }
          }
        }
      );
    };
    
    document.body.appendChild(script);
  };

  const getCurrentUserToken = async () => {
    // Get the current user's auth token
    // Implementation depends on your auth setup
    return currentUser?.token || '';
  };

  const renderContent = () => {
    switch (connectionState) {
      case BANK_CONNECTION_STATES.SEARCH:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Connect Your Bank Account
              </h3>
              <p className="text-gray-600">
                Choose how you'd like to connect your bank account
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleInstantVerification}
                disabled={loading || !customerId}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Instant Verification</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Securely connect your bank account instantly
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>

              <button
                onClick={handleUseManualEntry}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Manual Entry</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter your routing and account numbers
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>

            <div id="dwolla-iav-container" className="min-h-[400px]"></div>
          </div>
        );

      case BANK_CONNECTION_STATES.FORM:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Enter Bank Account Details
              </h3>
              <p className="text-gray-600">
                Provide your bank account information
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Routing Number
                </label>
                <input
                  type="text"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleFormChange}
                  placeholder="123456789"
                  pattern="[0-9]{9}"
                  maxLength="9"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleFormChange}
                  placeholder="1234567890"
                  pattern="[0-9]+"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Nickname (Optional)
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleFormChange}
                  placeholder="My Checking Account"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setConnectionState(BANK_CONNECTION_STATES.SEARCH)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Connecting...' : 'Connect Account'}
                </button>
              </div>
            </form>
          </div>
        );

      case BANK_CONNECTION_STATES.CONNECTING:
        return (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connecting Your Bank
            </h3>
            <p className="text-gray-600">
              This may take a few moments...
            </p>
          </div>
        );

      case BANK_CONNECTION_STATES.SUCCESS:
        return (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Bank Connected Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your bank account has been securely linked
            </p>
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Done
            </button>
          </div>
        );

      case BANK_CONNECTION_STATES.ERROR:
        return (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Connection Failed
            </h3>
            <p className="text-gray-600 mb-6">
              {error || 'We couldn\'t connect to your bank. Please try again.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConnectionState(BANK_CONNECTION_STATES.SEARCH)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Try Again
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Dwolla</h2>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {loading && !iavToken ? (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Initializing payment services...</p>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}