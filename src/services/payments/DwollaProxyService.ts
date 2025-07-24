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

/**
 * DwollaProxyService provides a client-side interface to Dwolla through backend proxy routes.
 * This approach keeps API credentials secure on the server while providing full Dwolla functionality.
 */
export class DwollaProxyService implements PaymentProvider {
  private static instance: DwollaProxyService | null = null;
  private baseURL: string;
  private authToken: string | null = null;

  private constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  }

  public static getInstance(): DwollaProxyService {
    if (!DwollaProxyService.instance) {
      DwollaProxyService.instance = new DwollaProxyService();
    }
    return DwollaProxyService.instance;
  }

  // Helper method to get current user token
  private async getUserToken(): Promise<string> {
    // This should be implemented based on your auth system
    // For now, return a placeholder
    return this.authToken || '';
  }

  // Helper method to make API requests
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getUserToken();
    
    const response = await fetch(`${this.baseURL}/api/dwolla${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new PaymentProviderError(
        error.message || error.error || 'Request failed',
        'API_ERROR',
        response.status,
        error
      );
    }

    return response.json();
  }

  async authenticate(): Promise<void> {
    // Authentication is handled server-side
    // Client just needs to ensure user is authenticated
    const token = await this.getUserToken();
    if (!token) {
      throw new PaymentProviderError(
        'User authentication required',
        'AUTHENTICATION_REQUIRED',
        401
      );
    }
    this.authToken = token;
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    const response = await this.makeRequest<{
      success: boolean;
      customerId: string;
      customer?: any;
    }>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        ...customerData,
        user_id: customerData.externalId,
      }),
    });

    // If customer details are returned, use them
    if (response.customer) {
      return this.mapResponseToCustomer(response.customer);
    }

    // Otherwise, fetch the customer details
    return this.getCustomer(response.customerId);
  }

  async getCustomer(customerId: string): Promise<Customer> {
    const response = await this.makeRequest<any>(`/customers/${customerId}`);
    return this.mapResponseToCustomer(response);
  }

  async updateCustomer(customerId: string, updateData: UpdateCustomerData): Promise<Customer> {
    await this.makeRequest(`/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });

    return this.getCustomer(customerId);
  }

  async deleteCustomer(customerId: string): Promise<void> {
    await this.makeRequest(`/customers/${customerId}`, {
      method: 'DELETE',
    });
  }

  async linkAccount(customerId: string, accountData: LinkAccountData): Promise<Account> {
    const response = await this.makeRequest<{
      success: boolean;
      fundingSourceId: string;
    }>(`/customers/${customerId}/funding-sources`, {
      method: 'POST',
      body: JSON.stringify({
        routingNumber: accountData.routingNumber,
        accountNumber: accountData.accountNumber,
        bankAccountType: accountData.accountType || 'checking',
        name: `${accountData.accountType || 'checking'} account`,
      }),
    });

    return this.getAccount(response.fundingSourceId);
  }

  async getAccounts(customerId: string): Promise<Account[]> {
    const response = await this.makeRequest<{
      _embedded: { 'funding-sources': any[] };
    }>(`/customers/${customerId}/funding-sources`);

    return response._embedded['funding-sources']
      .filter(source => !source.removed)
      .map(source => this.mapResponseToAccount(source));
  }

  async getAccount(accountId: string): Promise<Account> {
    const response = await this.makeRequest<any>(`/funding-sources/${accountId}`);
    return this.mapResponseToAccount(response);
  }

  async unlinkAccount(accountId: string): Promise<void> {
    await this.makeRequest(`/funding-sources/${accountId}`, {
      method: 'DELETE',
    });
  }

  async getBalance(accountId: string): Promise<Balance> {
    const response = await this.makeRequest<{
      balance: { value: string; currency: string };
      total?: { value: string; currency: string };
    }>(`/funding-sources/${accountId}/balance`);

    return {
      accountId,
      available: parseFloat(response.balance.value),
      current: parseFloat(response.total?.value || response.balance.value),
      currency: response.balance.currency,
      lastUpdated: new Date(),
    };
  }

  async createTransfer(transferData: CreateTransferData): Promise<Transfer> {
    const response = await this.makeRequest<{
      success: boolean;
      transferId: string;
    }>('/transfers', {
      method: 'POST',
      body: JSON.stringify({
        sourceId: transferData.sourceAccountId,
        destinationId: transferData.destinationAccountId,
        amount: transferData.amount,
        currency: transferData.currency,
        metadata: transferData.metadata,
      }),
    });

    return this.getTransfer(response.transferId);
  }

  async getTransfer(transferId: string): Promise<Transfer> {
    const response = await this.makeRequest<any>(`/transfers/${transferId}`);
    return this.mapResponseToTransfer(response);
  }

  async cancelTransfer(transferId: string): Promise<void> {
    await this.makeRequest(`/transfers/${transferId}/cancel`, {
      method: 'POST',
    });
  }

  async listTransfers(filters?: TransferFilters): Promise<Transfer[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters.status) params.append('status', filters.status);
    }

    const response = await this.makeRequest<{
      _embedded: { transfers: any[] };
    }>(`/transfers?${params.toString()}`);

    return response._embedded.transfers.map(transfer => 
      this.mapResponseToTransfer(transfer)
    );
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookEvent> {
    // Webhooks are handled server-side
    throw new PaymentProviderError(
      'Webhooks must be handled server-side',
      'NOT_IMPLEMENTED',
      501
    );
  }

  // Helper methods to map API responses to our interface types
  private mapResponseToCustomer(response: any): Customer {
    return {
      id: response.id,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      phone: response.phone,
      status: this.mapCustomerStatus(response.status),
      verificationStatus: this.mapVerificationStatus(response.status),
      createdAt: new Date(response.created),
      updatedAt: new Date(response.created),
      metadata: response.metadata,
    };
  }

  private mapResponseToAccount(response: any): Account {
    return {
      id: response.id,
      customerId: this.extractIdFromLink(response._links.customer.href),
      name: response.name,
      type: this.mapAccountType(response.type, response.bankAccountType),
      status: this.mapAccountStatus(response.status),
      bankName: response.bankName,
      last4: response.name?.match(/\*\*(\d{4})/)?.[1],
      createdAt: new Date(response.created),
      updatedAt: new Date(response.created),
    };
  }

  private mapResponseToTransfer(response: any): Transfer {
    return {
      id: response.id,
      sourceAccountId: this.extractIdFromLink(response._links.source.href),
      destinationAccountId: this.extractIdFromLink(response._links.destination.href),
      amount: parseFloat(response.amount.value),
      currency: response.amount.currency,
      status: this.mapTransferStatus(response.status),
      createdAt: new Date(response.created),
      updatedAt: new Date(response.created),
      metadata: response.metadata,
    };
  }

  private mapCustomerStatus(status: string): CustomerStatus {
    const statusMap: Record<string, CustomerStatus> = {
      'verified': CustomerStatus.ACTIVE,
      'unverified': CustomerStatus.ACTIVE,
      'suspended': CustomerStatus.SUSPENDED,
      'deactivated': CustomerStatus.DEACTIVATED,
    };
    return statusMap[status] || CustomerStatus.ACTIVE;
  }

  private mapVerificationStatus(status: string): VerificationStatus {
    const statusMap: Record<string, VerificationStatus> = {
      'unverified': VerificationStatus.UNVERIFIED,
      'pending': VerificationStatus.PENDING,
      'verified': VerificationStatus.VERIFIED,
      'retry': VerificationStatus.RETRY,
      'document': VerificationStatus.DOCUMENT,
      'suspended': VerificationStatus.SUSPENDED,
    };
    return statusMap[status] || VerificationStatus.UNVERIFIED;
  }

  private mapAccountType(type: string, bankAccountType?: string): AccountType {
    if (type === 'bank') {
      return bankAccountType === 'savings' ? AccountType.SAVINGS : AccountType.CHECKING;
    }
    if (type === 'balance') {
      return AccountType.BALANCE;
    }
    return AccountType.CHECKING;
  }

  private mapAccountStatus(status: string): AccountStatus {
    const statusMap: Record<string, AccountStatus> = {
      'unverified': AccountStatus.UNVERIFIED,
      'pending': AccountStatus.PENDING,
      'verified': AccountStatus.VERIFIED,
    };
    return statusMap[status] || AccountStatus.PENDING;
  }

  private mapTransferStatus(status: string): TransferStatus {
    const statusMap: Record<string, TransferStatus> = {
      'pending': TransferStatus.PENDING,
      'processed': TransferStatus.COMPLETED,
      'failed': TransferStatus.FAILED,
      'cancelled': TransferStatus.CANCELLED,
    };
    return statusMap[status] || TransferStatus.PENDING;
  }

  private extractIdFromLink(link: string): string {
    const parts = link.split('/');
    return parts[parts.length - 1];
  }
}