import '@testing-library/jest-dom';
import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'util';
import type { Group } from './types/group';

interface MatcherResult {
  pass: boolean;
  message: () => string;
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.crypto
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: () => new Uint32Array(10),
    randomUUID: () => 'test-uuid'
  }
});

// Create browser-compatible TextEncoder/TextDecoder
class BrowserTextEncoder {
  private encoder: NodeTextEncoder;

  constructor() {
    this.encoder = new NodeTextEncoder();
  }

  encode(input?: string): Uint8Array {
    return this.encoder.encode(input);
  }
}

class BrowserTextDecoder {
  private decoder: NodeTextDecoder;

  constructor(label?: string, options?: TextDecoderOptions) {
    this.decoder = new NodeTextDecoder(label, options);
  }

  decode(input?: BufferSource | null, options?: TextDecodeOptions): string {
    if (input === null || input === undefined) {
      return '';
    }

    // Safe type assertion since we know the input is compatible
    const buffer = input instanceof ArrayBuffer ? input : input.buffer;
    return this.decoder.decode(buffer, options as { stream?: boolean });
  }
}

// Assign browser-compatible implementations
(global as any).TextEncoder = BrowserTextEncoder;
(global as any).TextDecoder = BrowserTextDecoder;

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  custom: jest.fn(),
  dismiss: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  writeBatch: jest.fn(),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock Firebase Analytics
jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
  logEvent: jest.fn(),
}));

// Mock contexts
jest.mock('./contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('./contexts/GroupContext', () => ({
  useGroup: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  }),
  useParams: () => ({}),
}));

// Add custom matchers
expect.extend({
  toBeValidGroup(received: unknown): MatcherResult {
    const pass = received &&
      typeof received === 'object' &&
      received !== null &&
      'id' in received &&
      'name' in received &&
      'ownerId' in received;
    
    if (pass) {
      return {
        message: () => `Expected ${JSON.stringify(received)} not to be a valid group`,
        pass: true
      };
    }

    return {
      message: () => `Expected ${JSON.stringify(received)} to be a valid group`,
      pass: false
    };
  },
});

// Declare custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidGroup(): R;
    }
  }
}

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
