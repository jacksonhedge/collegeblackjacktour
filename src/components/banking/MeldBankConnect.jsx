import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { meldProxyService } from '../../services/meld/MeldProxyService';
import { MeldPaymentService } from '../../services/payments/MeldPaymentService';
import MeldACHPayment from './MeldACHPayment';
import MeldConnectIntegration from './MeldConnectIntegration';
import { 
  Building2, 
  Search, 
  ChevronRight, 
  Loader2, 
  Shield, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const MeldBankConnect = ({ onSuccess, onClose, proceedToPayment = false, useDropIn = true }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [step, setStep] = useState('search'); // search, connecting, success, error, payment
  const [institutions, setInstitutions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [error, setError] = useState(null);
  const [meldUser, setMeldUser] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);

  // Use Meld Connect drop-in in production
  const shouldUseMeldConnect = useDropIn && import.meta.env.VITE_MELD_ENV === 'production';

  // Popular banks for quick selection
  const popularBanks = [
    { id: 'chase', name: 'Chase', logo: '🏦' },
    { id: 'bofa', name: 'Bank of America', logo: '🏛️' },
    { id: 'wells_fargo', name: 'Wells Fargo', logo: '🏪' },
    { id: 'capital_one', name: 'Capital One', logo: '💳' },
    { id: 'pnc', name: 'PNC Bank', logo: '🏦' },
    { id: 'us_bank', name: 'US Bank', logo: '🏛️' }
  ];

  useEffect(() => {
    initializeMeldUser();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const delayDebounce = setTimeout(() => {
        searchInstitutions();
      }, 300);
      
      return () => clearTimeout(delayDebounce);
    } else {
      setInstitutions([]);
    }
  }, [searchTerm]);

  const initializeMeldUser = async () => {
    try {
      setLoading(true);
      const userData = {
        email: currentUser.email,
        firstName: currentUser.user_metadata?.first_name || '',
        lastName: currentUser.user_metadata?.last_name || '',
        userId: currentUser.id
      };
      
      // For now, we'll use the user data directly
      // In production, you'd create/get a Meld user through your backend
      setMeldUser(userData);
    } catch (err) {
      console.error('Error initializing Meld user:', err);
      setError('Failed to initialize bank connection');
    } finally {
      setLoading(false);
    }
  };

  const searchInstitutions = async () => {
    try {
      setLoading(true);
      const results = await meldProxyService.makeBackendRequest(
        `/institutions?q=${encodeURIComponent(searchTerm)}`, 
        'GET'
      );
      setInstitutions(results.data || []);
    } catch (err) {
      console.error('Error searching institutions:', err);
      if (err.message && err.message.includes('temporarily unavailable')) {
        setError('Bank connections are temporarily unavailable. Please try again later.');
        setStep('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionSelect = async (institution) => {
    try {
      setSelectedInstitution(institution);
      setStep('connecting');
      setError(null);

      // Create a connection through the proxy
      const connectionData = await meldProxyService.makeBackendRequest(
        '/connections',
        'POST',
        {
          user_id: currentUser.id,
          institution_id: institution.id,
          products: ['accounts', 'transactions'],
          webhook_url: `${window.location.origin}/api/webhooks/meld`,
          redirect_url: `${window.location.origin}/banking`
        }
      );

      // In a real implementation, this would open Meld's connection flow
      // For now, we'll simulate the connection process
      if (connectionData.connectUrl) {
        // Open Meld Connect in a popup or redirect
        window.open(connectionData.connectUrl, 'meld-connect', 'width=500,height=700');
        
        // Listen for the connection completion
        window.addEventListener('message', handleMeldMessage);
      } else {
        // Simulate successful connection for demo
        setTimeout(() => {
          const mockAccount = {
            id: `mock_${Date.now()}`,
            name: 'Checking Account',
            bankName: institution.name,
            last4: '1234',
            type: 'checking'
          };
          setConnectedAccount(mockAccount);
          
          if (proceedToPayment) {
            setStep('payment');
          } else {
            setStep('success');
            if (onSuccess) {
              onSuccess({
                institution: institution.name,
                accountsConnected: 1,
                account: mockAccount
              });
            }
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Error connecting to bank:', err);
      if (err.message && err.message.includes('temporarily unavailable')) {
        setError('Bank connections are temporarily unavailable. Please try again later.');
      } else {
        setError(err.message || 'Failed to connect to bank');
      }
      setStep('error');
    }
  };

  const handleMeldMessage = (event) => {
    // Handle messages from Meld Connect
    if (event.origin !== 'https://connect.meld.io' && event.origin !== 'https://connect-sb.meld.io') {
      return;
    }

    const { type, data } = event.data;
    
    if (type === 'meld-connect-success') {
      setConnectedAccount(data.account);
      
      if (proceedToPayment) {
        setStep('payment');
      } else {
        setStep('success');
        if (onSuccess) {
          onSuccess(data);
        }
      }
    } else if (type === 'meld-connect-error') {
      setError(data.message || 'Connection failed');
      setStep('error');
    }
    
    window.removeEventListener('message', handleMeldMessage);
  };

  const renderSearch = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img 
            src="/images/hedge-pay-logo.png" 
            alt="Hedge Pay" 
            className="h-12 w-auto"
          />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          ACH by Hedge Pay
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Securely connect your bank account for instant transfers
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for your bank..."
          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
            isDark 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
        />
      </div>

      {/* Popular Banks */}
      {!searchTerm && (
        <div>
          <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Popular Banks
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {popularBanks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => handleInstitutionSelect(bank)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{bank.logo}</span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {bank.name}
                </span>
                <ChevronRight className={`w-4 h-4 ml-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchTerm && institutions.length > 0 && (
        <div className="space-y-2">
          <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Search Results
          </h3>
          {institutions.map((institution) => (
            <button
              key={institution.id}
              onClick={() => handleInstitutionSelect(institution)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Building2 className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {institution.name}
              </span>
              <ChevronRight className={`w-4 h-4 ml-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && searchTerm && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      )}

      {/* No Results */}
      {searchTerm && !loading && institutions.length === 0 && (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          No banks found matching "{searchTerm}"
        </div>
      )}

      {/* Security Badge */}
      <div className={`flex items-center justify-center gap-2 pt-4 ${
        isDark ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <Shield className="w-4 h-4" />
        <span className="text-xs">Bank-level encryption powered by Hedge Pay</span>
      </div>
    </div>
  );

  const renderConnecting = () => (
    <div className="text-center py-12 space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
          <Building2 className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600" />
        </div>
      </div>
      <div>
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Connecting to {selectedInstitution?.name}
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          This may take a few moments...
        </p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
      </div>
      <div>
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Bank Connected Successfully!
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Your {selectedInstitution?.name} account has been linked
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setStep('payment')}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Add Funds Now
        </button>
        <button
          onClick={onClose}
          className={`px-6 py-2 rounded-lg transition-colors ${
            isDark 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Done
        </button>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
      </div>
      <div>
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Connection Failed
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {error || 'Unable to connect to your bank'}
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => {
            setStep('search');
            setError(null);
          }}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className={`px-6 py-2 rounded-lg transition-colors ${
            isDark 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Use Meld Connect drop-in if enabled
  if (shouldUseMeldConnect) {
    return (
      <MeldConnectIntegration
        onSuccess={(connectionData) => {
          setConnectedAccount(connectionData.account);
          
          if (proceedToPayment) {
            setStep('payment');
          } else {
            if (onSuccess) {
              onSuccess(connectionData);
            }
          }
        }}
        onClose={onClose}
      />
    );
  }

  // When in payment step, render the ACH payment component
  if (step === 'payment') {
    return (
      <MeldACHPayment
        connectedAccount={connectedAccount}
        onSuccess={(paymentData) => {
          if (onSuccess) {
            onSuccess({
              ...paymentData,
              bankConnected: true
            });
          }
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className={`relative max-w-md w-full mx-auto p-6 rounded-2xl ${
      isDark ? 'bg-gray-900' : 'bg-white'
    } shadow-xl`}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
          isDark 
            ? 'hover:bg-gray-800 text-gray-400' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content based on step */}
      {step === 'search' && renderSearch()}
      {step === 'connecting' && renderConnecting()}
      {step === 'success' && renderSuccess()}
      {step === 'error' && renderError()}

      {/* Test Mode Banner (for sandbox) */}
      {import.meta.env.VITE_MELD_ENV !== 'production' && (
        <div className="absolute bottom-0 left-0 right-0 bg-yellow-500/20 border-t border-yellow-500/40 px-4 py-2">
          <p className="text-xs text-yellow-600 text-center">
            🧪 Test Mode - Use sandbox credentials for testing
          </p>
        </div>
      )}
    </div>
  );
};

export default MeldBankConnect;