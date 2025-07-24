/// <reference types="@types/jest" />

declare global {
  const jest: typeof import('@jest/globals').jest;
  const expect: typeof import('@jest/globals').expect;
  const describe: typeof import('@jest/globals').describe;
  const it: typeof import('@jest/globals').it;
  const test: typeof import('@jest/globals').test;
  const beforeAll: typeof import('@jest/globals').beforeAll;
  const beforeEach: typeof import('@jest/globals').beforeEach;
  const afterAll: typeof import('@jest/globals').afterAll;
  const afterEach: typeof import('@jest/globals').afterEach;

  namespace jest {
    interface Matchers<R> {
      toBeValidGroup(): R;
    }
  }
}

declare module '@testing-library/react-hooks' {
  export function renderHook<TProps, TResult>(
    callback: (props: TProps) => TResult,
    options?: {
      initialProps?: TProps;
      wrapper?: React.ComponentType<any>;
    }
  ): {
    result: { current: TResult };
    rerender: (props?: TProps) => void;
    unmount: () => void;
    waitForNextUpdate: () => Promise<void>;
  };

  export function act(callback: () => void | Promise<void>): Promise<void>;
}

declare module '@testing-library/react' {
  export * from '@testing-library/react';
  export function act(callback: () => void | Promise<void>): Promise<void>;
}

declare module '@testing-library/jest-dom' {
  export {};
}

declare module '@testing-library/user-event' {
  const userEvent: any;
  export default userEvent;
}

// Extend the NodeJS namespace for global declarations
declare global {
  namespace NodeJS {
    interface Global {
      TextEncoder: typeof TextEncoder;
      TextDecoder: typeof TextDecoder;
    }
  }
}

// Extend the Window interface for matchMedia
interface Window {
  matchMedia(query: string): MediaQueryList;
}

// Declare MediaQueryList interface
interface MediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
  addListener: (callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => any)) => void;
  removeListener: (callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => any)) => void;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
  dispatchEvent: (event: Event) => boolean;
}

// Export an empty object to make this a module
export {};
