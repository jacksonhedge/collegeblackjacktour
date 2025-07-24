// Payment Provider Configuration
export interface PaymentConfig {
  meld: MeldConfig;
  dwolla: DwollaConfig;
}

export interface MeldConfig {
  baseURL: string;
  apiKey: string;
  apiSecret: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
}

export interface DwollaConfig {
  baseURL: string;
  apiKey: string;
  apiSecret: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
}

// Development configuration
const developmentConfig: PaymentConfig = {
  meld: {
    baseURL: import.meta.env.VITE_MELD_ENV === 'production' ? 'https://api.meld.io/v1' : 'https://sandbox.meld.io/v1',
    apiKey: import.meta.env.VITE_MELD_SANDBOX_API_KEY || import.meta.env.VITE_MELD_API_KEY || '',
    apiSecret: import.meta.env.VITE_MELD_SANDBOX_API_SECRET || import.meta.env.VITE_MELD_API_SECRET || '',
    webhookSecret: import.meta.env.VITE_MELD_WEBHOOK_SECRET,
    environment: import.meta.env.VITE_MELD_ENV === 'production' ? 'production' : 'sandbox'
  },
  dwolla: {
    baseURL: 'https://api-sandbox.dwolla.com',
    apiKey: import.meta.env.VITE_DWOLLA_SANDBOX_API_KEY || '',
    apiSecret: import.meta.env.VITE_DWOLLA_SANDBOX_API_SECRET || '',
    webhookSecret: import.meta.env.VITE_DWOLLA_WEBHOOK_SECRET,
    environment: 'sandbox'
  }
};

// Production configuration
const productionConfig: PaymentConfig = {
  meld: {
    baseURL: 'https://api.meld.io/v1',
    apiKey: import.meta.env.VITE_MELD_API_KEY || '',
    apiSecret: import.meta.env.VITE_MELD_API_SECRET || '',
    webhookSecret: import.meta.env.VITE_MELD_WEBHOOK_SECRET,
    environment: 'production'
  },
  dwolla: {
    baseURL: 'https://api.dwolla.com',
    apiKey: import.meta.env.VITE_DWOLLA_API_KEY || '',
    apiSecret: import.meta.env.VITE_DWOLLA_API_SECRET || '',
    webhookSecret: import.meta.env.VITE_DWOLLA_WEBHOOK_SECRET,
    environment: 'production'
  }
};

// Export the appropriate configuration based on VITE_MELD_ENV
export const paymentConfig: PaymentConfig = import.meta.env.VITE_MELD_ENV === 'production'
  ? productionConfig 
  : developmentConfig;

// Helper function to validate configuration
export function validatePaymentConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate Meld configuration
  if (!paymentConfig.meld.apiKey) {
    errors.push('Meld API key is missing');
  }
  if (!paymentConfig.meld.apiSecret) {
    errors.push('Meld API secret is missing');
  }
  
  // Validate Dwolla configuration
  if (!paymentConfig.dwolla.apiKey) {
    errors.push('Dwolla API key is missing');
  }
  if (!paymentConfig.dwolla.apiSecret) {
    errors.push('Dwolla API secret is missing');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}