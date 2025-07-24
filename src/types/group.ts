export type UserRole = 'owner' | 'admin' | 'member';
export type MemberStatus = 'owner' | 'admin' | 'member' | 'invited' | 'pending';

export interface User {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  username?: string;
  phone?: string;
  createdAt?: string;
  groups?: string[];
  role?: UserRole;
}

export interface GroupWallet {
  platformId: string;
  groupId: string;
  ownerId: string;
  name: string;
  logo: string;
  cashBalance: number;
  bonusBalances: any[];
  totalBonusBalance: number;
  lastUpdated: Date;
  status: string;
  connected: boolean;
  memberBalances: Record<string, number>;
  expenses: any[];
}

export interface PendingMember {
  identifier: string;
  type: 'email' | 'phone';
  status: MemberStatus;
  invitedAt: string;
  invitedBy?: string;
  message?: string;
}

export interface GroupMember extends User {
  role: UserRole;
  status: MemberStatus;
  joinedAt: string;
  invitedAt?: string;
  invitedBy?: string;
  lastActive?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  emoji: string;
  ownerId: string;
  owner: User;
  members: GroupMember[];
  memberIds: string[];
  pendingMembers: PendingMember[];
  dateCreated: string;
  isHidden: boolean;
  visibility: 'private' | 'public';
  inviteLink: string;
  status: string;
  wallet: GroupWallet;
  type: string;
  leagueInfo: any | null;
}

export interface GroupContextType {
  groups: Group[];
  loading: boolean;
  error: string | null;
  createGroup: (groupData: Partial<Group>) => Promise<string>;
  getGroup: (groupId: string) => Promise<Group>;
  updateGroup: (groupId: string, data: Partial<Group>) => Promise<Group>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  refreshGroups: () => Promise<void>;
  inviteMembers: (groupId: string, emails: string[]) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
  updateMemberRole: (groupId: string, userId: string, role: UserRole) => Promise<void>;
  joinGroup: (groupCode: string) => Promise<void>;
}

export interface InviteResult {
  success: boolean;
  message: string;
  invitedCount: number;
  skippedCount: number;
}

export interface GroupMemberUpdate {
  role?: UserRole;
  lastActive?: string;
}

export interface GroupInvite {
  id?: string;
  groupId: string;
  inviterId: string;
  inviteeEmail: string;
  inviteeUserId?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  message?: string;
  inviteToken?: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  declinedAt?: string;
}

export interface GroupError extends Error {
  code?: string;
  details?: unknown;
}

export interface GroupUpdateOptions {
  optimistic?: boolean;
  silent?: boolean;
}

export interface GroupQueryOptions {
  includeMembers?: boolean;
  includePending?: boolean;
  includeWallet?: boolean;
}

// Constants for group-related values
export const GROUP_ROLES: Record<UserRole, UserRole> = {
  owner: 'owner',
  admin: 'admin',
  member: 'member'
} as const;

export const MEMBER_STATUS = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  INVITED: 'invited',
  PENDING: 'pending'
} as const;

export const GROUP_INVITE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const;

export type GroupMemberStatus = MemberStatus;
export type GroupInviteStatus = typeof GROUP_INVITE_STATUS[keyof typeof GROUP_INVITE_STATUS];
