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

interface DwollaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface DwollaCustomerResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  type: string;
  created: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  _links: {
    self: { href: string };
    'funding-sources': { href: string };
    transfers: { href: string };
  };
}

interface DwollaFundingSourceResponse {
  id: string;
  status: string;
  type: string;
  bankAccountType?: string;
  name: string;
  created: string;
  balance?: {
    value: string;
    currency: string;
  };
  removed: boolean;
  channels: string[];
  bankName?: string;
  _links: {
    self: { href: string };
    customer: { href: string };
    'micro-deposits'?: { href: string };
  };
}

interface DwollaTransferResponse {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  created: string;
  metadata?: Record<string, any>;
  fees?: Array<{
    amount: {
      value: string;
      currency: string;
    };
  }>;
  _links: {
    self: { href: string };
    source: { href: string };
    destination: { href: string };
    cancel?: { href: string };
  };
}

export class DwollaPaymentService extends BasePaymentService implements PaymentProvider {
  private static instance: DwollaPaymentService | null = null;

  private constructor() {
    super({
      baseURL: paymentConfig.dwolla.baseURL,
      apiKey: paymentConfig.dwolla.apiKey,
      apiSecret: paymentConfig.dwolla.apiSecret,
      environment: paymentConfig.dwolla.environment
    });
  }

  public static getInstance(): DwollaPaymentService {
    if (!DwollaPaymentService.instance) {
      DwollaPaymentService.instance = new DwollaPaymentService();
    }
    return DwollaPaymentService.instance;
  }

  async authenticate(): Promise<void> {
    this.validateConfig();

    // Check if existing token is still valid (with 5 minute buffer)
    if (this.accessToken && this.tokenExpirationDate && 
        this.tokenExpirationDate > new Date(Date.now() + 300000)) {
      return;
    }

    try {
      const response = await this.makeRequest<DwollaTokenResponse>('/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.apiKey}:${this.apiSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      this.accessToken = response.access_token;
      this.tokenExpirationDate = new Date(Date.now() + response.expires_in * 1000);
    } catch (error) {
      throw new PaymentProviderError(
        'Failed to authenticate with Dwolla',
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

    const dwollaCustomerData: any = {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      type: 'personal'
    };

    // Add optional fields if provided
    if (customerData.dateOfBirth) {
      dwollaCustomerData.dateOfBirth = customerData.dateOfBirth;
    }
    if (customerData.phone) {
      dwollaCustomerData.phone = customerData.phone;
    }
    if (customerData.ssn) {
      dwollaCustomerData.ssn = customerData.ssn;
    }
    if (customerData.address) {
      dwollaCustomerData.address1 = customerData.address.street1;
      dwollaCustomerData.address2 = customerData.address.street2;
      dwollaCustomerData.city = customerData.address.city;
      dwollaCustomerData.state = customerData.address.state;
      dwollaCustomerData.postalCode = customerData.address.postalCode;
    }

    const response = await this.makeRequest<{ headers: Headers }>('/customers', {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Accept': 'application/vnd.dwolla.v1.hal+json'
      },
      body: JSON.stringify(dwollaCustomerData)
    });

    // Extract customer ID from Location header
    const locationHeader = response.headers.get('Location');
    if (!locationHeader) {
      throw new PaymentProviderError(
        'Failed to create customer: No location header returned',
        'CUSTOMER_CREATION_FAILED'
      );
    }

    const customerId = locationHeader.split('/').pop();
    if (!customerId) {
      throw new PaymentProviderError(
        'Failed to extract customer ID from location header',
        'CUSTOMER_CREATION_FAILED'
      );
    }

    // Fetch the created customer details
    return await this.getCustomer(customerId);
  }

  async getCustomer(customerId: string): Promise<Customer> {
    await this.authenticate();

    const response = await this.makeRequest<DwollaCustomerResponse>(
      `/customers/${customerId}`,
      {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Accept': 'application/vnd.dwolla.v1.hal+json'
        }
      }
    );

    return this.mapDwollaCustomerToCustomer(response);
  }

  async updateCustomer(customerId: string, updateData: UpdateCustomerData): Promise<Customer> {
    await this.authenticate();

    const dwollaUpdateData: any = {};
    
    if (updateData.firstName) dwollaUpdateData.firstName = updateData.firstName;
    if (updateData.lastName) dwollaUpdateData.lastName = updateData.lastName;
    if (updateData.email) dwollaUpdateData.email = updateData.email;
    if (updateData.phone) dwollaUpdateData.phone = updateData.phone;
    if (updateData.address) {
      dwollaUpdateData.address1 = updateData.address.street1;
      dwollaUpdateData.address2 = updateData.address.street2;
      dwollaUpdateData.city = updateData.address.city;
      dwollaUpdateData.state = updateData.address.state;
      dwollaUpdateData.postalCode = updateData.address.postalCode;
    }

    await this.makeRequest(`/customers/${customerId}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Accept': 'application/vnd.dwolla.v1.hal+json'
      },
      body: JSON.stringify(dwollaUpdateData)
    });

    return await this.getCustomer(customerId);
  }

  async deleteCustomer(customerId: string): Promise<void> {
    await this.authenticate();

    await this.makeRequest(`/customers/${customerId}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Accept': 'application/vnd.dwolla.v1.hal+json'
      },
      body: JSON.stringify({ status: 'deactivated' })
    });
  }

  async linkAccount(customerId: string, accountData: LinkAccountData): Promise<Account> {
    await this.authenticate();

    if (!accountData.accountNumber || !accountData.routingNumber) {
      throw new PaymentProviderError(
        'Account number and routing number are required for Dwolla',
        'INVALID_ACCOUNT_DATA'
      );
    }

    const fundingSourceData = {
      routingNumber: accountData.routingNumber,
      accountNumber: accountData.accountNumber,
      bankAccountType: accountData.accountType || 'checking',
      name: `${accountData.accountType || 'checking'} account`
    };

    const response = await this.makeRequest<{ headers: Headers }>(
      `/customers/${customerId}/funding-sources`,
      {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Accept': 'application/vnd.dwolla.v1.hal+json'
        },
        body: JSON.stringify(fundingSourceData)
      }
    );

    // Extract funding source ID from Location header
    const locationHeader = response.headers.get('Location');
    if (!locationHeader) {
      throw new PaymentProviderError(
        'Failed to link account: No location header returned',
        'ACCOUNT_LINK_FAILED'
      );
    }

    const accountId = locationHeader.split('/').pop();
    if (!accountId) {
      throw new PaymentProviderError(
        'Failed to extract account ID from location header',
        'ACCOUNT_LINK_FAILED'
      );
    }

    return await this.getAccount(accountId);
  }

  async getAccounts(customerId: string): Promise<Account[]> {
    await this.authenticate();

    const response = await this.makeRequest<{
      _embedded: { 'funding-sources': DwollaFundingSourceResponse[] }
    }>(
      `/customers/${customerId}/funding-sources`,
      {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Accept': 'application/vnd.dwolla.v1.hal+json'
        }
      }
    );

    return response._embedded['funding-sources']
      .filter(source => !source.removed)
      .map(source => this.mapDwollaFundingSourceToAccount(source));
  }

  async getAccount(accountId: string): Promise<Account> {
    await this.authenticate();

    const response = await this.makeRequest<DwollaFundingSourceResponse>(
      `/funding-sources/${accountId}`,
      {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Accept': 'application/vnd.dwolla.v1.hal+json'
        }
      }
    );

    return this.mapDwollaFundingSourceToAccount(response);
  }

  async unlinkAccount(accountId: string): Promise<void> {
    await this.authenticate();

    await this.makeRequest(`/funding-sources/${accountId}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Accept': 'application/vnd.dwolla.v1.hal+json'
      },
      body: JSON.stringify({ removed: true })
    });
  }

  async getBalance(accountId: string): Promise<Balance> {
    await this.authenticate();

    const response = await this.makeRequest<{
      balance: { value: string; currency: string };
      total?: { value: string; currency: string };
    }>(
      `/funding-sources/${accountId}/balance`,
      {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Accept': 'application/vnd.dwolla.v1.hal+json'
        }
      }
    );

    return {
      accountId,
      available: parseFloat(response.balance.value),
      current: parseFloat(response.total?.value || response.balance.value),
      currency: response.balance.currency,
      lastUpdated: new Date()
    };
  }

  async createTransfer(transferData: CreateTransferData): Promise<Transfer> {
    await this.authenticate();

    const dwollaTransferData = {
      _links: {
        source: { href: `${this.baseURL}/funding-sources/${transferData.sourceAccountId}` },
        destination: { href: `${this.baseURL}/funding-sources/${transferData.destinationAccountId}` }
      },
      amount: {
        currency: transferData.currency,
        value: transferData.amount.toFixed(2)
      },
      metadata: transferData.metadata
    };

    const response = await this.makeRequest<{ headers: Headers }>(
      '/transfers',
      {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Accept': 'application/vnd.dwolla.v1.hal+json'
        },
        body: JSON.stringify(dwollaTransferData)
      }
    );

    // Extract transfer ID from Location header
    const locationHeader = response.headers.get('Location');
    if (!locationHeader) {
      throw new PaymentProviderError(
        'Failed to create transfer: No location header returned',
        'TRANSFER_CREATION_FAILED'
      );
    }

    const transferId = locationHeader.split('/').pop();
    if (!transferId) {
      throw new PaymentProviderError(
        'Failed to extract transfer ID from location header',
        'TRANSFER_CREATION_FAILED'
      );
    }

    return await this.getTransfer(transferId);
  }

  async getTransfer(transferId: string): Promise<Transfer> {
    await this.authenticate();

    const response = await this.makeRequest<DwollaTransferResponse>(
      `/transfers/${transferId}`,
      {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Accept': 'application/vnd.dwolla.v1.hal+json'
        }
      }
    );

    return this.mapDwollaTransferToTransfer(response);
  }

  async cancelTransfer(transferId: string): Promise<void> {
    await this.authenticate();

    await this.makeRequest(`/transfers/${transferId}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Accept': 'application/vnd.dwolla.v1.hal+json'
      },
      body: JSON.stringify({ status: 'cancelled' })
    });
  }

  async listTransfers(filters?: TransferFilters): Promise<Transfer[]> {
    await this.authenticate();

    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());
    }

    const endpoint = filters?.customerId 
      ? `/customers/${filters.customerId}/transfers?${queryParams.toString()}`
      : `/transfers?${queryParams.toString()}`;

    const response = await this.makeRequest<{
      _embedded: { transfers: DwollaTransferResponse[] }
    }>(
      endpoint,
      {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Accept': 'application/vnd.dwolla.v1.hal+json'
        }
      }
    );

    return response._embedded.transfers.map(transfer => 
      this.mapDwollaTransferToTransfer(transfer)
    );
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookEvent> {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new PaymentProviderError(
        'Invalid webhook signature',
        'INVALID_WEBHOOK_SIGNATURE'
      );
    }

    // Map Dwolla webhook event to our standard format
    return {
      id: payload.id,
      type: this.mapDwollaWebhookType(payload.topic),
      data: payload,
      createdAt: new Date(payload.timestamp)
    };
  }

  // Private helper methods
  private mapDwollaCustomerToCustomer(dwollaCustomer: DwollaCustomerResponse): Customer {
    return {
      id: dwollaCustomer.id,
      firstName: dwollaCustomer.firstName,
      lastName: dwollaCustomer.lastName,
      email: dwollaCustomer.email,
      phone: dwollaCustomer.phone,
      status: this.mapDwollaCustomerStatus(dwollaCustomer.status),
      verificationStatus: this.mapDwollaVerificationStatus(dwollaCustomer.status),
      createdAt: new Date(dwollaCustomer.created),
      updatedAt: new Date(dwollaCustomer.created)
    };
  }

  private mapDwollaFundingSourceToAccount(fundingSource: DwollaFundingSourceResponse): Account {
    const customerId = this.extractIdFromLink(fundingSource._links.customer.href);
    
    return {
      id: fundingSource.id,
      customerId,
      name: fundingSource.name,
      type: this.mapDwollaAccountType(fundingSource.type, fundingSource.bankAccountType),
      status: this.mapDwollaAccountStatus(fundingSource.status),
      bankName: fundingSource.bankName,
      createdAt: new Date(fundingSource.created),
      updatedAt: new Date(fundingSource.created)
    };
  }

  private mapDwollaTransferToTransfer(dwollaTransfer: DwollaTransferResponse): Transfer {
    const sourceAccountId = this.extractIdFromLink(dwollaTransfer._links.source.href);
    const destinationAccountId = this.extractIdFromLink(dwollaTransfer._links.destination.href);

    return {
      id: dwollaTransfer.id,
      sourceAccountId,
      destinationAccountId,
      amount: parseFloat(dwollaTransfer.amount.value),
      currency: dwollaTransfer.amount.currency,
      status: this.mapDwollaTransferStatus(dwollaTransfer.status),
      fees: dwollaTransfer.fees?.map(fee => ({
        type: 'dwolla_fee',
        amount: parseFloat(fee.amount.value),
        currency: fee.amount.currency
      })),
      createdAt: new Date(dwollaTransfer.created),
      updatedAt: new Date(dwollaTransfer.created),
      metadata: dwollaTransfer.metadata
    };
  }

  private mapDwollaCustomerStatus(status: string): CustomerStatus {
    const statusMap: Record<string, CustomerStatus> = {
      'verified': CustomerStatus.ACTIVE,
      'unverified': CustomerStatus.ACTIVE,
      'retry': CustomerStatus.ACTIVE,
      'document': CustomerStatus.ACTIVE,
      'suspended': CustomerStatus.SUSPENDED,
      'deactivated': CustomerStatus.DEACTIVATED
    };
    return statusMap[status] || CustomerStatus.ACTIVE;
  }

  private mapDwollaVerificationStatus(status: string): VerificationStatus {
    const statusMap: Record<string, VerificationStatus> = {
      'unverified': VerificationStatus.UNVERIFIED,
      'retry': VerificationStatus.RETRY,
      'document': VerificationStatus.DOCUMENT,
      'verified': VerificationStatus.VERIFIED,
      'suspended': VerificationStatus.SUSPENDED
    };
    return statusMap[status] || VerificationStatus.UNVERIFIED;
  }

  private mapDwollaAccountType(type: string, bankAccountType?: string): AccountType {
    if (type === 'bank') {
      return bankAccountType === 'savings' ? AccountType.SAVINGS : AccountType.CHECKING;
    }
    if (type === 'balance') {
      return AccountType.BALANCE;
    }
    return AccountType.CHECKING;
  }

  private mapDwollaAccountStatus(status: string): AccountStatus {
    const statusMap: Record<string, AccountStatus> = {
      'unverified': AccountStatus.UNVERIFIED,
      'pending': AccountStatus.PENDING,
      'verified': AccountStatus.VERIFIED
    };
    return statusMap[status] || AccountStatus.PENDING;
  }

  private mapDwollaTransferStatus(status: string): TransferStatus {
    const statusMap: Record<string, TransferStatus> = {
      'pending': TransferStatus.PENDING,
      'processed': TransferStatus.COMPLETED,
      'failed': TransferStatus.FAILED,
      'cancelled': TransferStatus.CANCELLED
    };
    return statusMap[status] || TransferStatus.PENDING;
  }

  private mapDwollaWebhookType(topic: string): WebhookEventType {
    const typeMap: Record<string, WebhookEventType> = {
      'customer_created': WebhookEventType.CUSTOMER_CREATED,
      'customer_verification_document_needed': WebhookEventType.CUSTOMER_UPDATED,
      'customer_verification_document_uploaded': WebhookEventType.CUSTOMER_UPDATED,
      'customer_verified': WebhookEventType.CUSTOMER_VERIFIED,
      'customer_suspended': WebhookEventType.CUSTOMER_SUSPENDED,
      'customer_funding_source_added': WebhookEventType.ACCOUNT_ADDED,
      'customer_funding_source_removed': WebhookEventType.ACCOUNT_REMOVED,
      'customer_funding_source_verified': WebhookEventType.ACCOUNT_VERIFIED,
      'transfer_created': WebhookEventType.TRANSFER_CREATED,
      'transfer_completed': WebhookEventType.TRANSFER_COMPLETED,
      'transfer_failed': WebhookEventType.TRANSFER_FAILED,
      'transfer_cancelled': WebhookEventType.TRANSFER_CANCELLED
    };
    return typeMap[topic] || WebhookEventType.CUSTOMER_UPDATED;
  }

  private extractIdFromLink(link: string): string {
    const parts = link.split('/');
    return parts[parts.length - 1];
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    // TODO: Implement webhook signature verification
    // This would typically involve HMAC verification using the webhook secret
    return true;
  }
}