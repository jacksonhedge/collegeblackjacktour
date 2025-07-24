import { renderHook, act } from '@testing-library/react';
import { useGroup } from '../useGroup';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useGroup as useGroupContext } from '../../contexts/GroupContext';
import { toast } from 'react-hot-toast';
import { 
  LOADING_STATE, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  GROUP_ROLES 
} from '../../constants';
import type { Group, User, GroupMember, GroupContextType } from '../../types/group';

// Mock dependencies
jest.mock('../../contexts/AuthContext');
jest.mock('../../contexts/GroupContext');
jest.mock('react-hot-toast');

// Mock data
const mockUser: User = {
  uid: 'user-1',
  displayName: 'Test User',
  email: 'test@example.com',
  createdAt: '2024-01-01'
};

const mockGroupMember: GroupMember = {
  ...mockUser,
  role: GROUP_ROLES.owner,
  joinedAt: '2024-01-01'
};

const mockGroup: Group = {
  id: 'group-1',
  name: 'Test Group',
  description: 'Test Description',
  emoji: '👥',
  ownerId: 'user-1',
  owner: mockUser,
  members: [mockGroupMember],
  memberIds: ['user-1'],
  pendingMembers: [],
  dateCreated: '2024-01-01',
  isHidden: false,
  visibility: 'private',
  inviteLink: 'http://example.com/invite/group-1',
  status: 'active',
  wallet: {
    platformId: 'group_group-1',
    groupId: 'group-1',
    ownerId: 'user-1',
    name: 'Group Wallet',
    logo: '/images/BankrollLogoTransparent.png',
    cashBalance: 0,
    bonusBalances: [],
    totalBonusBalance: 0,
    lastUpdated: new Date(),
    status: 'active',
    connected: true,
    memberBalances: {},
    expenses: []
  },
  type: 'default',
  leagueInfo: null
};

const createMockGroupContext = (overrides = {}): GroupContextType => ({
  groups: [mockGroup],
  loading: false,
  error: null,
  createGroup: jest.fn().mockResolvedValue('new-group-id'),
  getGroup: jest.fn().mockResolvedValue(mockGroup),
  updateGroup: jest.fn().mockResolvedValue(mockGroup),
  deleteGroup: jest.fn().mockResolvedValue(true),
  refreshGroups: jest.fn().mockResolvedValue(undefined),
  inviteMembers: jest.fn().mockResolvedValue(undefined),
  removeMember: jest.fn().mockResolvedValue(undefined),
  updateMemberRole: jest.fn().mockResolvedValue(undefined),
  ...overrides
});

describe('useGroup', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mocks
    (useAuth as unknown as Function).mockReturnValue({ currentUser: mockUser });
    (useGroupContext as unknown as Function).mockReturnValue(createMockGroupContext());
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useGroup());

    expect(result.current.group.data).toBeNull();
    expect(result.current.group.loading).toBeFalsy();
    expect(result.current.group.error).toBeNull();
    expect(result.current.loadingState).toBe(LOADING_STATE.IDLE);
    expect(result.current.members).toEqual([]);
    expect(result.current.isOwner).toBeFalsy();
    expect(result.current.isMember).toBeFalsy();
  });

  it('should fetch group data when id is provided', async () => {
    const { result } = renderHook(() => 
      useGroup({ id: 'group-1', autoFetch: true })
    );

    expect(result.current.group.loading).toBeTruthy();
    expect(result.current.loadingState).toBe(LOADING_STATE.LOADING);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.group.data).toEqual(mockGroup);
    expect(result.current.group.loading).toBeFalsy();
    expect(result.current.loadingState).toBe(LOADING_STATE.SUCCESS);
    expect(result.current.members).toEqual(mockGroup.members);
    expect(result.current.isOwner).toBeTruthy();
    expect(result.current.isMember).toBeTruthy();
  });

  it('should handle fetch error', async () => {
    const error = new Error(ERROR_MESSAGES.GROUP.NOT_FOUND);
    (useGroupContext as unknown as Function).mockReturnValue(
      createMockGroupContext({
        getGroup: jest.fn().mockRejectedValue(error)
      })
    );

    const { result } = renderHook(() => 
      useGroup({ id: 'invalid-id', autoFetch: true })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.group.error).toEqual(error);
    expect(result.current.loadingState).toBe(LOADING_STATE.ERROR);
    expect(toast.error).toHaveBeenCalledWith(ERROR_MESSAGES.GROUP.NOT_FOUND);
  });

  it('should update group successfully', async () => {
    const { result } = renderHook(() => 
      useGroup({ id: 'group-1', autoFetch: true })
    );

    await act(async () => {
      await Promise.resolve();
    });

    const updateData = { name: 'Updated Group' };
    await act(async () => {
      await result.current.updateGroup(updateData);
    });

    expect(result.current.loadingState).toBe(LOADING_STATE.SUCCESS);
    expect(toast.success).toHaveBeenCalledWith(SUCCESS_MESSAGES.GROUP.UPDATED);
  });

  it('should delete group successfully', async () => {
    const { result } = renderHook(() => 
      useGroup({ id: 'group-1', autoFetch: true })
    );

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.deleteGroup();
    });

    expect(result.current.loadingState).toBe(LOADING_STATE.SUCCESS);
    expect(toast.success).toHaveBeenCalledWith(SUCCESS_MESSAGES.GROUP.DELETED);
  });

  it('should invite members successfully', async () => {
    const { result } = renderHook(() => 
      useGroup({ id: 'group-1', autoFetch: true })
    );

    await act(async () => {
      await Promise.resolve();
    });

    const emails = ['new@example.com'];
    await act(async () => {
      await result.current.inviteMembers(emails);
    });

    expect(result.current.loadingState).toBe(LOADING_STATE.SUCCESS);
    expect(toast.success).toHaveBeenCalledWith(SUCCESS_MESSAGES.INVITE.SENT);
  });

  it('should update member role successfully', async () => {
    const { result } = renderHook(() => 
      useGroup({ id: 'group-1', autoFetch: true })
    );

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.updateMemberRole('user-2', GROUP_ROLES.admin);
    });

    expect(result.current.loadingState).toBe(LOADING_STATE.SUCCESS);
    expect(toast.success).toHaveBeenCalledWith('Member role updated successfully');
  });

  it('should handle unauthorized actions', async () => {
    (useAuth as unknown as Function).mockReturnValue({ 
      currentUser: { ...mockUser, uid: 'user-2' } 
    });

    const { result } = renderHook(() => 
      useGroup({ id: 'group-1', autoFetch: true })
    );

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      try {
        await result.current.updateGroup({ name: 'Updated Group' });
        expect('Should have thrown an error').toBeFalsy();
      } catch (error) {
        expect(error instanceof Error && error.message).toBe(ERROR_MESSAGES.GROUP.UNAUTHORIZED);
      }
    });

    expect(result.current.loadingState).toBe(LOADING_STATE.ERROR);
    expect(toast.error).toHaveBeenCalledWith(ERROR_MESSAGES.GROUP.UNAUTHORIZED);
  });
});
