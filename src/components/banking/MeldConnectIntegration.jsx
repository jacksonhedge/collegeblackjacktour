import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { meldProxyService } from '../../services/meld/MeldProxyService';
import { Loader2, AlertCircle, X } from 'lucide-react';

const MeldConnectIntegration = ({ onSuccess, onClose }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [widgetUrl, setWidgetUrl] = useState(null);
  const [connectionId, setConnectionId] = useState(null);

  useEffect(() => {
    initializeMeldConnect();
  }, []);

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event) => {
      // Verify the message is from Meld
      if (!event.origin.includes('meld.io')) return;

      const { type, data } = event.data;

      switch (type) {
        case 'CONNECT_COMPLETE':
          handleMeldSuccess(data);
          break;
        case 'CONNECT_EXIT':
          if (data.error) {
            setError('Connection failed. Please try again.');
          } else {
            onClose();
          }
          break;
        case 'CONNECT_ERROR':
          setError(data.message || 'An error occurred during connection.');
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  const initializeMeldConnect = async () => {
    try {
      setLoading(true);
      
      // Use the proxy service to create connection
      const connectionData = await meldProxyService.initiateBankConnection({
        user_id: currentUser.id,
        // Don't pass institution_id to show the picker
        products: ['BALANCES', 'TRANSACTIONS'],
        optionalProducts: ['IDENTIFIERS'],
        regions: ['US']
      });
      
      if (connectionData.widgetUrl) {
        // Set the widget URL for the iframe
        setWidgetUrl(connectionData.widgetUrl);
        setConnectionId(connectionData.connectionId);
      }
    } catch (err) {
      console.error('Error initializing Meld Connect:', err);
      setError('Failed to initialize bank connection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMeldSuccess = async (data) => {
    try {
      setLoading(true);
      
      // Get the connection details from the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/meld/connections/${connectionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get connection details');
      }

      const connectionDetails = await response.json();
      
      // Get accounts for this connection
      const accountsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/meld/connections/${connectionId}/accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });

      if (!accountsResponse.ok) {
        throw new Error('Failed to get accounts');
      }

      const accountsData = await accountsResponse.json();
      
      // Success! Account is now connected
      if (onSuccess) {
        onSuccess({
          connectionId,
          accounts: accountsData.data || [],
          institution: data.institution,
          ...connectionDetails
        });
      }
    } catch (err) {
      console.error('Error completing connection:', err);
      setError('Failed to complete bank connection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative p-8 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-xl max-w-md w-full`}>
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Connection Error
            </h3>
            <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setError(null);
                  initializeMeldConnect();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !widgetUrl) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm`}>
        <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-xl`}>
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Initializing secure bank connection...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (widgetUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative w-full max-w-md h-[640px] bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Connect Your Bank
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <iframe
            src={widgetUrl}
            className="w-full h-full"
            style={{ border: 'none' }}
            title="Meld Bank Connection"
          />
        </div>
      </div>
    );
  }

  return null;
};

export default MeldConnectIntegration;