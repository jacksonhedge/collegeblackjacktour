import { PaymentProvider, PaymentProviderError } from './interfaces/PaymentProvider';

export abstract class BasePaymentService implements PaymentProvider {
  protected baseURL: string;
  protected apiKey: string;
  protected apiSecret: string;
  protected accessToken: string | null = null;
  protected tokenExpirationDate: Date | null = null;
  protected environment: 'sandbox' | 'production';

  constructor(config: {
    baseURL: string;
    apiKey: string;
    apiSecret: string;
    environment: 'sandbox' | 'production';
  }) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.environment = config.environment;
  }

  // Abstract methods that must be implemented by subclasses
  abstract authenticate(): Promise<void>;
  abstract isAuthenticated(): boolean;
  abstract createCustomer(customerData: any): Promise<any>;
  abstract getCustomer(customerId: string): Promise<any>;
  abstract updateCustomer(customerId: string, updateData: any): Promise<any>;
  abstract deleteCustomer(customerId: string): Promise<void>;
  abstract linkAccount(customerId: string, accountData: any): Promise<any>;
  abstract getAccounts(customerId: string): Promise<any[]>;
  abstract getAccount(accountId: string): Promise<any>;
  abstract unlinkAccount(accountId: string): Promise<void>;
  abstract getBalance(accountId: string): Promise<any>;
  abstract createTransfer(transferData: any): Promise<any>;
  abstract getTransfer(transferId: string): Promise<any>;
  abstract cancelTransfer(transferId: string): Promise<void>;
  abstract listTransfers(filters?: any): Promise<any[]>;
  abstract handleWebhook(payload: any, signature: string): Promise<any>;

  // Common utility methods
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      let data: any;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        if (!response.ok) {
          throw new PaymentProviderError(
            `Request failed: ${response.statusText}`,
            'REQUEST_FAILED',
            response.status,
            responseText
          );
        }
        data = responseText;
      }

      if (!response.ok) {
        throw new PaymentProviderError(
          data?.message || `Request failed: ${response.statusText}`,
          data?.code || 'REQUEST_FAILED',
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof PaymentProviderError) {
        throw error;
      }
      
      throw new PaymentProviderError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'NETWORK_ERROR'
      );
    }
  }

  protected getAuthHeaders(): HeadersInit {
    if (!this.accessToken) {
      throw new PaymentProviderError(
        'Not authenticated. Please authenticate first.',
        'AUTHENTICATION_REQUIRED'
      );
    }

    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  protected validateConfig(): void {
    if (!this.apiKey) {
      throw new PaymentProviderError(
        'API key is required',
        'INVALID_CONFIG'
      );
    }

    if (!this.apiSecret) {
      throw new PaymentProviderError(
        'API secret is required',
        'INVALID_CONFIG'
      );
    }

    if (!this.baseURL) {
      throw new PaymentProviderError(
        'Base URL is required',
        'INVALID_CONFIG'
      );
    }
  }

  // Helper method to format amounts (convert dollars to cents)
  protected formatAmount(amount: number): number {
    return Math.round(amount * 100);
  }

  // Helper method to parse amounts (convert cents to dollars)
  protected parseAmount(amount: number): number {
    return amount / 100;
  }

  // Helper method for exponential backoff retry logic
  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof PaymentProviderError && error.statusCode && error.statusCode < 500) {
          // Don't retry client errors (4xx)
          throw error;
        }
        
        if (i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Retry failed');
  }

  // Helper method to handle pagination
  protected async *paginate<T>(
    fetchPage: (offset: number, limit: number) => Promise<{ items: T[]; total: number }>,
    pageSize: number = 50
  ): AsyncGenerator<T[], void, unknown> {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { items, total } = await fetchPage(offset, pageSize);
      
      if (items.length > 0) {
        yield items;
      }
      
      offset += items.length;
      hasMore = offset < total;
    }
  }
}