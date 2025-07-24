import { useState, useEffect, useCallback } from 'react';
import { paymentServiceManager, PaymentProviderType } from '../services/payments/PaymentServiceManager';
import { 
  PaymentProvider, 
  Customer, 
  Account, 
  Transfer, 
  CreateCustomerData,
  LinkAccountData,
  CreateTransferData,
  PaymentProviderError 
} from '../services/payments/interfaces/PaymentProvider';

interface UsePaymentProviderState {
  isLoading: boolean;
  error: string | null;
  currentProvider: PaymentProviderType;
  isAuthenticated: boolean;
  customer: Customer | null;
  accounts: Account[];
  transfers: Transfer[];
}

interface UsePaymentProviderActions {
  authenticate: () => Promise<void>;
  switchProvider: (provider: PaymentProviderType) => void;
  createCustomer: (data: CreateCustomerData) => Promise<Customer | null>;
  linkAccount: (accountData: LinkAccountData) => Promise<Account | null>;
  createTransfer: (transferData: CreateTransferData) => Promise<Transfer | null>;
  refreshAccounts: () => Promise<void>;
  refreshTransfers: () => Promise<void>;
  getProviderFeatures: () => ReturnType<typeof paymentServiceManager.getProviderFeatures>;
}

export function usePaymentProvider(
  initialProvider: PaymentProviderType = PaymentProviderType.MELD
): [UsePaymentProviderState, UsePaymentProviderActions] {
  const [state, setState] = useState<UsePaymentProviderState>({
    isLoading: false,
    error: null,
    currentProvider: initialProvider,
    isAuthenticated: false,
    customer: null,
    accounts: [],
    transfers: []
  });

  const [provider, setProvider] = useState<PaymentProvider>(
    paymentServiceManager.getProvider(initialProvider)
  );

  // Authenticate on mount and provider change
  useEffect(() => {
    authenticate();
  }, [state.currentProvider]);

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const authenticate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await provider.authenticate();
      setState(prev => ({ ...prev, isAuthenticated: true }));
    } catch (error) {
      const errorMessage = error instanceof PaymentProviderError 
        ? error.message 
        : 'Failed to authenticate with payment provider';
      setError(errorMessage);
      setState(prev => ({ ...prev, isAuthenticated: false }));
    } finally {
      setLoading(false);
    }
  };

  const switchProvider = useCallback((newProvider: PaymentProviderType) => {
    const newProviderInstance = paymentServiceManager.getProvider(newProvider);
    setProvider(newProviderInstance);
    setState(prev => ({
      ...prev,
      currentProvider: newProvider,
      isAuthenticated: false,
      customer: null,
      accounts: [],
      transfers: []
    }));
  }, []);

  const createCustomer = async (data: CreateCustomerData): Promise<Customer | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const customer = await provider.createCustomer(data);
      setState(prev => ({ ...prev, customer }));
      return customer;
    } catch (error) {
      const errorMessage = error instanceof PaymentProviderError 
        ? error.message 
        : 'Failed to create customer';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const linkAccount = async (accountData: LinkAccountData): Promise<Account | null> => {
    if (!state.customer) {
      setError('No customer found. Please create a customer first.');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const account = await provider.linkAccount(state.customer.id, accountData);
      setState(prev => ({ ...prev, accounts: [...prev.accounts, account] }));
      return account;
    } catch (error) {
      const errorMessage = error instanceof PaymentProviderError 
        ? error.message 
        : 'Failed to link account';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createTransfer = async (transferData: CreateTransferData): Promise<Transfer | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const transfer = await provider.createTransfer(transferData);
      setState(prev => ({ ...prev, transfers: [...prev.transfers, transfer] }));
      return transfer;
    } catch (error) {
      const errorMessage = error instanceof PaymentProviderError 
        ? error.message 
        : 'Failed to create transfer';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshAccounts = async () => {
    if (!state.customer) return;

    setLoading(true);
    setError(null);
    
    try {
      const accounts = await provider.getAccounts(state.customer.id);
      setState(prev => ({ ...prev, accounts }));
    } catch (error) {
      const errorMessage = error instanceof PaymentProviderError 
        ? error.message 
        : 'Failed to refresh accounts';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshTransfers = async () => {
    if (!state.customer) return;

    setLoading(true);
    setError(null);
    
    try {
      const transfers = await provider.listTransfers({ 
        customerId: state.customer.id,
        limit: 50 
      });
      setState(prev => ({ ...prev, transfers }));
    } catch (error) {
      const errorMessage = error instanceof PaymentProviderError 
        ? error.message 
        : 'Failed to refresh transfers';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProviderFeatures = () => {
    return paymentServiceManager.getProviderFeatures(state.currentProvider);
  };

  const actions: UsePaymentProviderActions = {
    authenticate,
    switchProvider,
    createCustomer,
    linkAccount,
    createTransfer,
    refreshAccounts,
    refreshTransfers,
    getProviderFeatures
  };

  return [state, actions];
}

// Hook for provider selection based on criteria
export function useProviderSelection() {
  const getRecommendedProvider = useCallback((criteria: {
    requiresInstantTransfer?: boolean;
    requiresPlaidIntegration?: boolean;
    requiresWireTransfer?: boolean;
    transferAmount?: number;
  }) => {
    return paymentServiceManager.getRecommendedProvider(criteria);
  }, []);

  const compareProviders = useCallback(() => {
    const providers = paymentServiceManager.getAvailableProviders();
    return providers.map(provider => ({
      type: provider,
      features: paymentServiceManager.getProviderFeatures(provider)
    }));
  }, []);

  return {
    getRecommendedProvider,
    compareProviders
  };
}