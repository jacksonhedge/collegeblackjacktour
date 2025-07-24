import React from 'react';
import { paymentConfig } from '../config/payment.config';

const TestMeldConfig = () => {
  const envVars = {
    VITE_MELD_ENV: import.meta.env.VITE_MELD_ENV,
    VITE_MELD_API_KEY: import.meta.env.VITE_MELD_API_KEY,
    VITE_MELD_API_SECRET: import.meta.env.VITE_MELD_API_SECRET,
    VITE_MELD_SANDBOX_API_KEY: import.meta.env.VITE_MELD_SANDBOX_API_KEY,
    VITE_MELD_SANDBOX_API_SECRET: import.meta.env.VITE_MELD_SANDBOX_API_SECRET,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    PROD: import.meta.env.PROD
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      background: '#333', 
      color: 'white', 
      padding: 20, 
      borderRadius: 8,
      fontSize: 12,
      maxWidth: 400
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Meld Config Debug</h3>
      
      <div style={{ marginBottom: 10 }}>
        <strong>Environment Variables:</strong>
        <pre style={{ margin: 5, fontSize: 11 }}>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key}>
              {key}: {value ? (typeof value === 'string' && value.length > 20 ? `${value.substring(0, 20)}...` : String(value)) : 'NOT SET'}
            </div>
          ))}
        </pre>
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong>Payment Config:</strong>
        <pre style={{ margin: 5, fontSize: 11 }}>
          Environment: {paymentConfig.meld.environment}
          Base URL: {paymentConfig.meld.baseURL}
          API Key: {paymentConfig.meld.apiKey ? '✓ Set' : '✗ Not set'}
          API Secret: {paymentConfig.meld.apiSecret ? '✓ Set' : '✗ Not set'}
        </pre>
      </div>

      <div>
        <strong>Status:</strong>
        <div style={{ color: paymentConfig.meld.apiKey && paymentConfig.meld.apiSecret ? '#4f4' : '#f44' }}>
          {paymentConfig.meld.apiKey && paymentConfig.meld.apiSecret ? '✓ Ready' : '✗ Missing credentials'}
        </div>
      </div>
    </div>
  );
};

export default TestMeldConfig;