/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_CLAUDE_API_KEY: string;
  readonly VITE_MELD_SANDBOX_API_KEY: string;
  readonly VITE_MELD_SANDBOX_API_SECRET: string;
  readonly VITE_MELD_WEBHOOK_SECRET: string;
  readonly VITE_DWOLLA_SANDBOX_API_KEY: string;
  readonly VITE_DWOLLA_SANDBOX_API_SECRET: string;
  readonly VITE_DWOLLA_WEBHOOK_SECRET: string;
  readonly VITE_MELD_API_KEY: string;
  readonly VITE_MELD_API_SECRET: string;
  readonly VITE_DWOLLA_API_KEY: string;
  readonly VITE_DWOLLA_API_SECRET: string;
  readonly VITE_BANKROLL_MELD_ACCOUNT_ID: string;
  readonly VITE_MELD_BASE_URL: string;
  readonly VITE_MELD_VERSION: string;
  readonly VITE_MELD_ENV: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 