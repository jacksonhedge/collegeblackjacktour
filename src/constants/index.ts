import { UserRole } from '../types/group';

// UI States
export const LOADING_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type LoadingState = typeof LOADING_STATE[keyof typeof LOADING_STATE];

// Group-related constants
export const GROUP_ROLES: Record<UserRole, UserRole> = {
  owner: 'owner',
  admin: 'admin',
  member: 'member'
} as const;

export const GROUP_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const;

export const GROUP_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  UNLISTED: 'unlisted',
} as const;

export const GROUP_MEMBER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  REMOVED: 'removed'
} as const;

export const GROUP_INVITE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired'
} as const;

export const GROUP_TYPE = {
  DEFAULT: 'default',
  LEAGUE: 'league',
  CLUB: 'club',
  ORGANIZATION: 'organization',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GROUP: {
    NOT_FOUND: 'Group not found',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    CREATION_FAILED: 'Failed to create group',
    UPDATE_FAILED: 'Failed to update group',
    DELETE_FAILED: 'Failed to delete group',
    INVALID_NAME: 'Group name must be between 3 and 50 characters',
    INVALID_DESCRIPTION: 'Group description cannot exceed 500 characters',
  },
  AUTH: {
    NOT_AUTHENTICATED: 'You must be logged in to perform this action',
    INVALID_CREDENTIALS: 'Invalid credentials',
    SESSION_EXPIRED: 'Your session has expired',
  },
  INVITE: {
    INVALID_EMAIL: 'Invalid email address',
    ALREADY_MEMBER: 'User is already a member of this group',
    ALREADY_INVITED: 'User has already been invited to this group',
    SEND_FAILED: 'Failed to send invite',
  },
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  GROUP: {
    CREATED: 'Group created successfully',
    UPDATED: 'Group updated successfully',
    DELETED: 'Group deleted successfully',
  },
  INVITE: {
    SENT: 'Invitation sent successfully',
    ACCEPTED: 'Invitation accepted successfully',
    DECLINED: 'Invitation declined successfully',
  },
} as const;

// Validation constants
export const VALIDATION = {
  GROUP_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
  },
  GROUP_DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

// Time constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  INVITE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 1 week
} as const;

// Animation durations (in milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// UI constants
export const UI = {
  TOAST_DURATION: 4000,
  MAX_MOBILE_WIDTH: 768,
  HEADER_HEIGHT: 64,
  SIDEBAR_WIDTH: 240,
} as const;

// Type exports
export type GroupStatus = typeof GROUP_STATUS[keyof typeof GROUP_STATUS];
export type GroupVisibility = typeof GROUP_VISIBILITY[keyof typeof GROUP_VISIBILITY];
export type GroupMemberStatus = typeof GROUP_MEMBER_STATUS[keyof typeof GROUP_MEMBER_STATUS];
export type GroupInviteStatus = typeof GROUP_INVITE_STATUS[keyof typeof GROUP_INVITE_STATUS];
export type GroupType = typeof GROUP_TYPE[keyof typeof GROUP_TYPE];

// Generic type for any constant object
export type ValueOf<T> = T[keyof T];
