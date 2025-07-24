declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Firebase config
      VITE_FIREBASE_API_KEY: string;
      VITE_FIREBASE_AUTH_DOMAIN: string;
      VITE_FIREBASE_PROJECT_ID: string;
      VITE_FIREBASE_STORAGE_BUCKET: string;
      VITE_FIREBASE_MESSAGING_SENDER_ID: string;
      VITE_FIREBASE_APP_ID: string;
      VITE_FIREBASE_MEASUREMENT_ID: string;
      
      // API endpoints
      VITE_API_URL: string;
      VITE_FIREBASE_DATABASE_URL: string;
      
      // Feature flags
      NODE_ENV: 'development' | 'production' | 'test';
      
      // Other configurations
      VITE_STORAGE_BUCKET: string;
      VITE_FUNCTIONS_REGION: string;
      
      // Optional configurations
      VITE_ENABLE_ANALYTICS?: string;
      VITE_ENABLE_PERFORMANCE_MONITORING?: string;
    }
  }
}

// Need to export something to make this a module
export {};
