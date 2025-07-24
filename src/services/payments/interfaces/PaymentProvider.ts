// Base Payment Provider Interface
export interface PaymentProvider {
  // Authentication
  authenticate(): Promise<void>;
  isAuthenticated(): boolean;
  
  // Customer Management
  createCustomer(customerData: CreateCustomerData): Promise<Customer>;
  getCustomer(customerId: string): Promise<Customer>;
  updateCustomer(customerId: string, updateData: UpdateCustomerData): Promise<Customer>;
  deleteCustomer(customerId: string): Promise<void>;
  
  // Account Management
  linkAccount(customerId: string, accountData: LinkAccountData): Promise<Account>;
  getAccounts(customerId: string): Promise<Account[]>;
  getAccount(accountId: string): Promise<Account>;
  unlinkAccount(accountId: string): Promise<void>;
  
  // Balance Operations
  getBalance(accountId: string): Promise<Balance>;
  
  // Transaction Operations
  createTransfer(transferData: CreateTransferData): Promise<Transfer>;
  getTransfer(transferId: string): Promise<Transfer>;
  cancelTransfer(transferId: string): Promise<void>;
  listTransfers(filters?: TransferFilters): Promise<Transfer[]>;
  
  // Webhook Management
  handleWebhook(payload: any, signature: string): Promise<WebhookEvent>;
}

// Data Types
export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Address;
  ssn?: string; // Last 4 digits for some providers
  externalId?: string; // Our system's user ID
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Address;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: CustomerStatus;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface LinkAccountData {
  accountNumber?: string;
  routingNumber?: string;
  accountType?: 'checking' | 'savings';
  plaidToken?: string;
  meldToken?: string;
}

export interface Account {
  id: string;
  customerId: string;
  name: string;
  type: AccountType;
  subtype?: string;
  status: AccountStatus;
  bankName?: string;
  last4?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Balance {
  accountId: string;
  available: number;
  current: number;
  currency: string;
  lastUpdated: Date;
}

export interface CreateTransferData {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface Transfer {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  status: TransferStatus;
  description?: string;
  fees?: TransferFee[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface TransferFee {
  type: string;
  amount: number;
  currency: string;
}

export interface TransferFilters {
  customerId?: string;
  accountId?: string;
  status?: TransferStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: any;
  createdAt: Date;
}

// Enums
export enum CustomerStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated'
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  RETRY = 'retry',
  DOCUMENT = 'document',
  SUSPENDED = 'suspended'
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  BALANCE = 'balance', // For wallet-type accounts
  CARD = 'card'
}

export enum AccountStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  CLOSED = 'closed'
}

export enum TransferStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum WebhookEventType {
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated',
  CUSTOMER_VERIFIED = 'customer.verified',
  CUSTOMER_SUSPENDED = 'customer.suspended',
  ACCOUNT_ADDED = 'account.added',
  ACCOUNT_REMOVED = 'account.removed',
  ACCOUNT_VERIFIED = 'account.verified',
  TRANSFER_CREATED = 'transfer.created',
  TRANSFER_COMPLETED = 'transfer.completed',
  TRANSFER_FAILED = 'transfer.failed',
  TRANSFER_CANCELLED = 'transfer.cancelled'
}

// Error Types
export class PaymentProviderError extends Error {
  code: string;
  statusCode?: number;
  details?: any;

  constructor(message: string, code: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'PaymentProviderError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}