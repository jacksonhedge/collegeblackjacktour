import React, { useState } from 'react';
import { usePaymentProvider, useProviderSelection } from '../../hooks/usePaymentProvider';
import { PaymentProviderType } from '../../services/payments/PaymentServiceManager';
import { LinkAccountData } from '../../services/payments/interfaces/PaymentProvider';

export const PaymentProviderDemo: React.FC = () => {
  const [state, actions] = usePaymentProvider();
  const { getRecommendedProvider, compareProviders } = useProviderSelection();
  const [showComparison, setShowComparison] = useState(false);

  const handleCreateCustomer = async () => {
    const customer = await actions.createCustomer({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+1234567890',
      externalId: `user_${Date.now()}`
    });

    if (customer) {
      console.log('Customer created:', customer);
    }
  };

  const handleLinkAccount = async () => {
    // Example for Meld (with Plaid token)
    if (state.currentProvider === PaymentProviderType.MELD) {
      const accountData: LinkAccountData = {
        meldToken: 'plaid_public_token_here' // This would come from Plaid Link
      };
      
      const account = await actions.linkAccount(accountData);
      if (account) {
        console.log('Account linked:', account);
      }
    }
    
    // Example for Dwolla (with account details)
    if (state.currentProvider === PaymentProviderType.DWOLLA) {
      const accountData: LinkAccountData = {
        accountNumber: '123456789',
        routingNumber: '987654321',
        accountType: 'checking'
      };
      
      const account = await actions.linkAccount(accountData);
      if (account) {
        console.log('Account linked:', account);
      }
    }
  };

  const handleCreateTransfer = async () => {
    if (state.accounts.length < 2) {
      alert('Need at least 2 accounts to create a transfer');
      return;
    }

    const transfer = await actions.createTransfer({
      sourceAccountId: state.accounts[0].id,
      destinationAccountId: state.accounts[1].id,
      amount: 50.00,
      currency: 'USD',
      description: 'Test transfer'
    });

    if (transfer) {
      console.log('Transfer created:', transfer);
    }
  };

  const providerComparison = compareProviders();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payment Provider Integration Demo</h1>

      {/* Provider Selection */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Current Provider</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => actions.switchProvider(PaymentProviderType.MELD)}
            className={`px-4 py-2 rounded ${
              state.currentProvider === PaymentProviderType.MELD
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            Meld
          </button>
          <button
            onClick={() => actions.switchProvider(PaymentProviderType.DWOLLA)}
            className={`px-4 py-2 rounded ${
              state.currentProvider === PaymentProviderType.DWOLLA
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            Dwolla
          </button>
        </div>
        
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="text-blue-500 underline text-sm"
        >
          {showComparison ? 'Hide' : 'Show'} Provider Comparison
        </button>
      </div>

      {/* Provider Comparison */}
      {showComparison && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-3">Provider Comparison</h2>
          <div className="grid grid-cols-2 gap-4">
            {providerComparison.map(({ type, features }) => (
              <div key={type} className="p-3 border rounded">
                <h3 className="font-semibold capitalize mb-2">{type}</h3>
                <ul className="text-sm space-y-1">
                  <li>Instant Transfers: {features.supportsInstantVerification ? '✅' : '❌'}</li>
                  <li>Plaid Integration: {features.supportsPlaidIntegration ? '✅' : '❌'}</li>
                  <li>Transfer Speed: {features.transferSpeed}</li>
                  <li>Max Amount: ${features.maxTransferAmount.toLocaleString()}</li>
                  <li>ACH Fee: ${features.fees.achTransfer || 'Free'}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Display */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Status</h2>
        <div className="space-y-2 text-sm">
          <p>Provider: <span className="font-mono">{state.currentProvider}</span></p>
          <p>Authenticated: {state.isAuthenticated ? '✅' : '❌'}</p>
          <p>Customer: {state.customer ? state.customer.email : 'Not created'}</p>
          <p>Accounts: {state.accounts.length}</p>
          <p>Transfers: {state.transfers.length}</p>
        </div>
        {state.error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            Error: {state.error}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={actions.authenticate}
            disabled={state.isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Authenticate
          </button>
          
          <button
            onClick={handleCreateCustomer}
            disabled={state.isLoading || !state.isAuthenticated}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Create Customer
          </button>
          
          <button
            onClick={handleLinkAccount}
            disabled={state.isLoading || !state.customer}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            Link Account
          </button>
          
          <button
            onClick={handleCreateTransfer}
            disabled={state.isLoading || state.accounts.length < 2}
            className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
          >
            Create Transfer
          </button>
          
          <button
            onClick={actions.refreshAccounts}
            disabled={state.isLoading || !state.customer}
            className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Refresh Accounts
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            Loading...
          </div>
        </div>
      )}

      {/* Recommendation Example */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Provider Recommendation</h2>
        <div className="space-y-2">
          <p className="text-sm">
            Need instant transfers? 
            <span className="ml-2 font-mono">
              {getRecommendedProvider({ requiresInstantTransfer: true })}
            </span>
          </p>
          <p className="text-sm">
            Large transfer ($25,000)? 
            <span className="ml-2 font-mono">
              {getRecommendedProvider({ transferAmount: 25000 })}
            </span>
          </p>
          <p className="text-sm">
            Need Plaid integration? 
            <span className="ml-2 font-mono">
              {getRecommendedProvider({ requiresPlaidIntegration: true })}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};