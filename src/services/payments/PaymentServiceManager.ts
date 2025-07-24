import { MeldPaymentService } from './MeldPaymentService';
import { DwollaPaymentService } from './DwollaPaymentService';
import { DwollaProxyService } from './DwollaProxyService';
import { PaymentProvider, PaymentProviderError } from './interfaces/PaymentProvider';

export enum PaymentProviderType {
  MELD = 'meld',
  DWOLLA = 'dwolla'
}

/**
 * PaymentServiceManager provides a unified interface for managing multiple payment providers.
 * It handles provider selection, switching, and provides a consistent API for payment operations.
 */
export class PaymentServiceManager {
  private static instance: PaymentServiceManager | null = null;
  private providers: Map<PaymentProviderType, PaymentProvider>;
  private defaultProvider: PaymentProviderType;

  private constructor() {
    this.providers = new Map();
    this.initializeProviders();
    this.defaultProvider = PaymentProviderType.MELD; // Default to Meld
  }

  public static getInstance(): PaymentServiceManager {
    if (!PaymentServiceManager.instance) {
      PaymentServiceManager.instance = new PaymentServiceManager();
    }
    return PaymentServiceManager.instance;
  }

  private initializeProviders(): void {
    // Initialize Meld provider
    this.providers.set(PaymentProviderType.MELD, MeldPaymentService.getInstance());
    
    // Initialize Dwolla provider
    // Use proxy service for client-side, direct service for server-side
    const isDwollaProxyEnabled = import.meta.env.VITE_API_URL;
    this.providers.set(
      PaymentProviderType.DWOLLA, 
      isDwollaProxyEnabled ? DwollaProxyService.getInstance() : DwollaPaymentService.getInstance()
    );
  }

  /**
   * Get a specific payment provider
   */
  public getProvider(type: PaymentProviderType): PaymentProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new PaymentProviderError(
        `Payment provider '${type}' not found`,
        'PROVIDER_NOT_FOUND'
      );
    }
    return provider;
  }

  /**
   * Get the default payment provider
   */
  public getDefaultProvider(): PaymentProvider {
    return this.getProvider(this.defaultProvider);
  }

  /**
   * Set the default payment provider
   */
  public setDefaultProvider(type: PaymentProviderType): void {
    if (!this.providers.has(type)) {
      throw new PaymentProviderError(
        `Payment provider '${type}' not found`,
        'PROVIDER_NOT_FOUND'
      );
    }
    this.defaultProvider = type;
  }

  /**
   * Get all available payment providers
   */
  public getAvailableProviders(): PaymentProviderType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is available
   */
  public isProviderAvailable(type: PaymentProviderType): boolean {
    return this.providers.has(type);
  }

  /**
   * Authenticate all providers
   */
  public async authenticateAll(): Promise<void> {
    const authPromises = Array.from(this.providers.values()).map(provider => 
      provider.authenticate().catch(error => {
        console.error('Failed to authenticate provider:', error);
        return null;
      })
    );
    await Promise.all(authPromises);
  }

  /**
   * Get provider-specific features
   */
  public getProviderFeatures(type: PaymentProviderType): ProviderFeatures {
    switch (type) {
      case PaymentProviderType.MELD:
        return {
          supportsPlaidIntegration: true,
          supportsInstantVerification: true,
          supportsACH: true,
          supportsWireTransfers: false,
          supportsInternationalTransfers: false,
          maxTransferAmount: 50000,
          transferSpeed: 'instant',
          requiresSSN: false,
          supportedAccountTypes: ['checking', 'savings'],
          fees: {
            accountLinking: 0,
            achTransfer: 0,
            instantTransfer: 0.75 // percentage
          }
        };
        
      case PaymentProviderType.DWOLLA:
        return {
          supportsPlaidIntegration: false,
          supportsInstantVerification: false,
          supportsACH: true,
          supportsWireTransfers: true,
          supportsInternationalTransfers: false,
          maxTransferAmount: 10000,
          transferSpeed: '1-3 business days',
          requiresSSN: true,
          supportedAccountTypes: ['checking', 'savings'],
          fees: {
            accountLinking: 0,
            achTransfer: 0.5, // flat fee
            instantTransfer: null // not supported
          }
        };
        
      default:
        throw new PaymentProviderError(
          `Unknown provider type: ${type}`,
          'UNKNOWN_PROVIDER'
        );
    }
  }

  /**
   * Get recommended provider based on use case
   */
  public getRecommendedProvider(criteria: ProviderSelectionCriteria): PaymentProviderType {
    // If instant transfers are required, use Meld
    if (criteria.requiresInstantTransfer) {
      return PaymentProviderType.MELD;
    }

    // If Plaid integration is needed, use Meld
    if (criteria.requiresPlaidIntegration) {
      return PaymentProviderType.MELD;
    }

    // If wire transfers are needed, use Dwolla
    if (criteria.requiresWireTransfer) {
      return PaymentProviderType.DWOLLA;
    }

    // If transfer amount is high, check limits
    if (criteria.transferAmount && criteria.transferAmount > 10000) {
      return PaymentProviderType.MELD;
    }

    // Default to Meld for better user experience
    return PaymentProviderType.MELD;
  }

  /**
   * Migrate customer from one provider to another
   */
  public async migrateCustomer(
    customerId: string,
    fromProvider: PaymentProviderType,
    toProvider: PaymentProviderType
  ): Promise<string> {
    const from = this.getProvider(fromProvider);
    const to = this.getProvider(toProvider);

    // Get customer data from source provider
    const customer = await from.getCustomer(customerId);

    // Create customer in destination provider
    const newCustomer = await to.createCustomer({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      dateOfBirth: customer.metadata?.dateOfBirth,
      externalId: customer.metadata?.externalId || customerId
    });

    return newCustomer.id;
  }
}

// Type definitions
export interface ProviderFeatures {
  supportsPlaidIntegration: boolean;
  supportsInstantVerification: boolean;
  supportsACH: boolean;
  supportsWireTransfers: boolean;
  supportsInternationalTransfers: boolean;
  maxTransferAmount: number;
  transferSpeed: string;
  requiresSSN: boolean;
  supportedAccountTypes: string[];
  fees: {
    accountLinking: number;
    achTransfer: number | null;
    instantTransfer: number | null;
  };
}

export interface ProviderSelectionCriteria {
  requiresInstantTransfer?: boolean;
  requiresPlaidIntegration?: boolean;
  requiresWireTransfer?: boolean;
  transferAmount?: number;
  accountType?: string;
}

// Export singleton instance
export const paymentServiceManager = PaymentServiceManager.getInstance();