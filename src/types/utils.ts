import type { Group, User } from './group';

// Group-related utility types
export type GroupWithoutMembers = Omit<Group, 'members'>;
export type GroupMember = Pick<User, 'uid' | 'displayName' | 'email' | 'photoURL'>;
export type GroupInvite = {
  groupId: string;
  inviterId: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
};

// Generic utility types
export type WithId<T> = T & { id: string };
export type WithTimestamp<T> = T & {
  createdAt: string;
  updatedAt?: string;
};

// Function types
export type AsyncFunction<T = void> = () => Promise<T>;
export type ErrorCallback = (error: Error) => void;
export type SuccessCallback<T> = (result: T) => void;

// React prop types
export type WithChildren<T = {}> = T & { children: React.ReactNode };
export type WithClassName<T = {}> = T & { className?: string };
export type WithOnClick<T = {}> = T & { onClick?: (event: React.MouseEvent) => void };

// Form-related types
export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;
export type FormValues<T> = Partial<T>;

// API-related types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// State management types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type AsyncState<T, E = Error> = {
  data: T | null;
  loading: boolean;
  error: E | null;
};

// Event handler types
export type EventHandler<T = void> = (event: React.SyntheticEvent) => T;
export type ChangeHandler = EventHandler<void>;
export type SubmitHandler<T> = (values: T) => void | Promise<void>;

// Validation types
export type ValidationRule<T> = {
  validate: (value: T) => boolean | Promise<boolean>;
  message: string;
};

export type Validator<T> = (value: T) => string | undefined | Promise<string | undefined>;

// Helper type functions
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function assertNonNull<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message ?? 'Value must not be null or undefined');
  }
}

export function isNonEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Type guards
export function isGroup(value: unknown): value is Group {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'ownerId' in value &&
    'memberIds' in value
  );
}

export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'uid' in value &&
    typeof (value as User).uid === 'string'
  );
}

// Type inference helpers
export type InferProps<T> = T extends React.ComponentType<infer P> ? P : never;
export type InferState<T> = T extends React.Component<any, infer S> ? S : never;
