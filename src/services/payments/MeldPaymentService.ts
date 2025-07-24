import { BasePaymentService } from './BasePaymentService';
import { paymentConfig } from '../../config/payment.config';
import {
  PaymentProvider,
  CreateCustomerData,
  Customer,
  UpdateCustomerData,
  LinkAccountData,
  Account,
  Balance,
  CreateTransferData,
  Transfer,
  TransferFilters,
  WebhookEvent,
  CustomerStatus,
  VerificationStatus,
  AccountType,
  AccountStatus,
  TransferStatus,
  WebhookEventType,
  PaymentProviderError
} from './interfaces/PaymentProvider';

interface MeldTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MeldLinkTokenResponse {
  linkToken: string;
  widgetUrl: string;
  expiresAt: string;
}

interface MeldCustomerResponse {
  id: string;
  externalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface MeldAccountResponse {
  id: string;
  customerId: string;
  institutionName: string;
  accountName: string;
  accountType: string;
  accountSubtype?: string;
  mask: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface MeldBalanceResponse {
  accountId: string;
  available: number;
  current: number;
  currency: string;
  lastUpdated: string;
}

interface MeldTransferResponse {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export class MeldPaymentService extends BasePaymentService implements PaymentProvider {
  private static instance: MeldPaymentService | null = null;

  private constructor() {
    super({
      baseURL: paymentConfig.meld.baseURL,
      apiKey: paymentConfig.meld.apiKey,
      apiSecret: paymentConfig.meld.apiSecret,
      environment: paymentConfig.meld.environment
    });
  }

  public static getInstance(): MeldPaymentService {
    if (!MeldPaymentService.instance) {
      MeldPaymentService.instance = new MeldPaymentService();
    }
    return MeldPaymentService.instance;
  }

  async authenticate(): Promise<void> {
    this.validateConfig();

    // Check if existing token is still valid (with 5 minute buffer)
    if (this.accessToken && this.tokenExpirationDate && 
        this.tokenExpirationDate > new Date(Date.now() + 300000)) {
      return;
    }

    try {
      const response = await this.makeRequest<MeldTokenResponse>('/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.apiKey}:${this.apiSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials'
        }).toString()
      });

      this.accessToken = response.access_token;
      this.tokenExpirationDate = new Date(Date.now() + response.expires_in * 1000);
    } catch (error) {
      throw new PaymentProviderError(
        'Failed to authenticate with Meld',
        'AUTHENTICATION_FAILED',
        undefined,
        error
      );
    }
  }

  isAuthenticated(): boolean {
    return !!(this.accessToken && this.tokenExpirationDate && 
             this.tokenExpirationDate > new Date());
  }

  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    await this.authenticate();

    const response = await this.makeRequest<MeldCustomerResponse>('/customers', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        externalId: customerData.externalId,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        dateOfBirth: customerData.dateOfBirth,
        address: customerData.address
      })
    });

    return this.mapMeldCustomerToCustomer(response);
  }

  async getCustomer(customerId: string): Promise<Customer> {
    await this.authenticate();

    const response = await this.makeRequest<MeldCustomerResponse>(
      `/customers/${customerId}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return this.mapMeldCustomerToCustomer(response);
  }

  async updateCustomer(customerId: string, updateData: UpdateCustomerData): Promise<Customer> {
    await this.authenticate();

    const response = await this.makeRequest<MeldCustomerResponse>(
      `/customers/${customerId}`,
      {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      }
    );

    return this.mapMeldCustomerToCustomer(response);
  }

  async deleteCustomer(customerId: string): Promise<void> {
    await this.authenticate();

    await this.makeRequest(`/customers/${customerId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
  }

  async getMeldLinkToken(customerId: string, products: string[] = ['TRANSACTIONS', 'BALANCES']): Promise<MeldLinkTokenResponse> {
    await this.authenticate();

    return await this.makeRequest<MeldLinkTokenResponse>('/link/token', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        customerId,
        products,
        optionalProducts: ['IDENTIFIERS', 'OWNERS'],
        accountPreferenceOverride: {
          allowRedirect: true
        },
        webhook: import.meta.env.VITE_MELD_WEBHOOK_URL || `${window.location.origin}/api/webhooks/meld`
      })
    });
  }

  async linkAccount(customerId: string, accountData: LinkAccountData): Promise<Account> {
    await this.authenticate();

    if (!accountData.meldToken) {
      throw new PaymentProviderError(
        'Meld token is required for linking accounts',
        'INVALID_ACCOUNT_DATA'
      );
    }

    const response = await this.makeRequest<MeldAccountResponse>('/accounts/link', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        customerId,
        publicToken: accountData.meldToken
      })
    });

    return this.mapMeldAccountToAccount(response);
  }

  async getAccounts(customerId: string): Promise<Account[]> {
    await this.authenticate();

    const response = await this.makeRequest<MeldAccountResponse[]>(
      `/customers/${customerId}/accounts`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return response.map(account => this.mapMeldAccountToAccount(account));
  }

  async getAccount(accountId: string): Promise<Account> {
    await this.authenticate();

    const response = await this.makeRequest<MeldAccountResponse>(
      `/accounts/${accountId}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return this.mapMeldAccountToAccount(response);
  }

  async unlinkAccount(accountId: string): Promise<void> {
    await this.authenticate();

    await this.makeRequest(`/accounts/${accountId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
  }

  async getBalance(accountId: string): Promise<Balance> {
    await this.authenticate();

    const response = await this.makeRequest<MeldBalanceResponse>(
      `/accounts/${accountId}/balance`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return {
      accountId: response.accountId,
      available: response.available,
      current: response.current,
      currency: response.currency,
      lastUpdated: new Date(response.lastUpdated)
    };
  }

  async createTransfer(transferData: CreateTransferData): Promise<Transfer> {
    await this.authenticate();

    const response = await this.makeRequest<MeldTransferResponse>('/transfers', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        sourceAccountId: transferData.sourceAccountId,
        destinationAccountId: transferData.destinationAccountId,
        amount: this.formatAmount(transferData.amount),
        currency: transferData.currency,
        description: transferData.description,
        metadata: transferData.metadata
      })
    });

    return this.mapMeldTransferToTransfer(response);
  }

  async getTransfer(transferId: string): Promise<Transfer> {
    await this.authenticate();

    const response = await this.makeRequest<MeldTransferResponse>(
      `/transfers/${transferId}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return this.mapMeldTransferToTransfer(response);
  }

  async cancelTransfer(transferId: string): Promise<void> {
    await this.authenticate();

    await this.makeRequest(`/transfers/${transferId}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }

  async listTransfers(filters?: TransferFilters): Promise<Transfer[]> {
    await this.authenticate();

    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.customerId) queryParams.append('customerId', filters.customerId);
      if (filters.accountId) queryParams.append('accountId', filters.accountId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());
    }

    const response = await this.makeRequest<MeldTransferResponse[]>(
      `/transfers?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return response.map(transfer => this.mapMeldTransferToTransfer(transfer));
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookEvent> {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new PaymentProviderError(
        'Invalid webhook signature',
        'INVALID_WEBHOOK_SIGNATURE'
      );
    }

    // Map Meld webhook event to our standard format
    return {
      id: payload.id,
      type: this.mapMeldWebhookType(payload.type),
      data: payload.data,
      createdAt: new Date(payload.created_at)
    };
  }

  // Private helper methods
  private mapMeldCustomerToCustomer(meldCustomer: MeldCustomerResponse): Customer {
    return {
      id: meldCustomer.id,
      firstName: meldCustomer.firstName,
      lastName: meldCustomer.lastName,
      email: meldCustomer.email,
      phone: meldCustomer.phone,
      status: this.mapMeldCustomerStatus(meldCustomer.status),
      verificationStatus: VerificationStatus.VERIFIED, // Meld handles verification
      createdAt: new Date(meldCustomer.createdAt),
      updatedAt: new Date(meldCustomer.updatedAt),
      metadata: { externalId: meldCustomer.externalId }
    };
  }

  private mapMeldAccountToAccount(meldAccount: MeldAccountResponse): Account {
    return {
      id: meldAccount.id,
      customerId: meldAccount.customerId,
      name: meldAccount.accountName,
      type: this.mapMeldAccountType(meldAccount.accountType),
      subtype: meldAccount.accountSubtype,
      status: this.mapMeldAccountStatus(meldAccount.status),
      bankName: meldAccount.institutionName,
      last4: meldAccount.mask,
      createdAt: new Date(meldAccount.createdAt),
      updatedAt: new Date(meldAccount.updatedAt)
    };
  }

  private mapMeldTransferToTransfer(meldTransfer: MeldTransferResponse): Transfer {
    return {
      id: meldTransfer.id,
      sourceAccountId: meldTransfer.sourceAccountId,
      destinationAccountId: meldTransfer.destinationAccountId,
      amount: this.parseAmount(meldTransfer.amount),
      currency: meldTransfer.currency,
      status: this.mapMeldTransferStatus(meldTransfer.status),
      description: meldTransfer.description,
      createdAt: new Date(meldTransfer.createdAt),
      updatedAt: new Date(meldTransfer.updatedAt)
    };
  }

  private mapMeldCustomerStatus(status: string): CustomerStatus {
    const statusMap: Record<string, CustomerStatus> = {
      'active': CustomerStatus.ACTIVE,
      'suspended': CustomerStatus.SUSPENDED,
      'deactivated': CustomerStatus.DEACTIVATED
    };
    return statusMap[status] || CustomerStatus.ACTIVE;
  }

  private mapMeldAccountType(type: string): AccountType {
    const typeMap: Record<string, AccountType> = {
      'checking': AccountType.CHECKING,
      'savings': AccountType.SAVINGS,
      'balance': AccountType.BALANCE,
      'card': AccountType.CARD
    };
    return typeMap[type] || AccountType.CHECKING;
  }

  private mapMeldAccountStatus(status: string): AccountStatus {
    const statusMap: Record<string, AccountStatus> = {
      'unverified': AccountStatus.UNVERIFIED,
      'pending': AccountStatus.PENDING,
      'verified': AccountStatus.VERIFIED,
      'suspended': AccountStatus.SUSPENDED,
      'closed': AccountStatus.CLOSED
    };
    return statusMap[status] || AccountStatus.PENDING;
  }

  private mapMeldTransferStatus(status: string): TransferStatus {
    const statusMap: Record<string, TransferStatus> = {
      'pending': TransferStatus.PENDING,
      'processing': TransferStatus.PROCESSING,
      'completed': TransferStatus.COMPLETED,
      'failed': TransferStatus.FAILED,
      'cancelled': TransferStatus.CANCELLED
    };
    return statusMap[status] || TransferStatus.PENDING;
  }

  private mapMeldWebhookType(type: string): WebhookEventType {
    const typeMap: Record<string, WebhookEventType> = {
      'customer.created': WebhookEventType.CUSTOMER_CREATED,
      'customer.updated': WebhookEventType.CUSTOMER_UPDATED,
      'account.added': WebhookEventType.ACCOUNT_ADDED,
      'account.removed': WebhookEventType.ACCOUNT_REMOVED,
      'transfer.created': WebhookEventType.TRANSFER_CREATED,
      'transfer.completed': WebhookEventType.TRANSFER_COMPLETED,
      'transfer.failed': WebhookEventType.TRANSFER_FAILED
    };
    return typeMap[type] || WebhookEventType.CUSTOMER_UPDATED;
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    // TODO: Implement webhook signature verification
    // This would typically involve HMAC verification using the webhook secret
    return true;
  }
}