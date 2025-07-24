// Window augmentations
interface Window {
  // Add any custom window properties here
  ethereum?: {
    isMetaMask?: boolean;
    request: (...args: any[]) => Promise<any>;
  };
}

// Utility types
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type Nullable<T> = T | null;

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;

// Firebase related types
type FirebaseTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
};

// Custom event types
interface CustomEventMap {
  'wallet-connected': CustomEvent<{ address: string }>;
  'transaction-completed': CustomEvent<{ txHash: string }>;
}

declare global {
  // Add custom events to the window
  interface WindowEventMap extends CustomEventMap {}

  // Add custom error types
  interface Error {
    code?: string;
    details?: unknown;
  }

  // Add custom module declarations if needed
  module '*.svg' {
    const content: string;
    export default content;
  }

  module '*.png' {
    const content: string;
    export default content;
  }

  module '*.jpg' {
    const content: string;
    export default content;
  }

  // Add any other global augmentations here
  interface Array<T> {
    toUnique(): Array<T>; // Example of extending Array prototype
  }
}

// Export empty object to make this a module
export {};
