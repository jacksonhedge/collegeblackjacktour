import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useGroup as useGroupContext } from '../contexts/GroupContext';
import { toast } from 'react-hot-toast';
import type { Group, User, GroupMember, UserRole } from '../types/group';
import { 
  LOADING_STATE, 
  LoadingState, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  GROUP_ROLES 
} from '../constants';
import type { AsyncState } from '../types/utils';

interface UseGroupOptions {
  id?: string;
  autoFetch?: boolean;
}

interface UseGroupReturn {
  group: AsyncState<Group>;
  members: GroupMember[];
  isOwner: boolean;
  isMember: boolean;
  loadingState: LoadingState;
  fetchGroup: () => Promise<void>;
  updateGroup: (data: Partial<Group>) => Promise<void>;
  deleteGroup: () => Promise<void>;
  leaveGroup: () => Promise<void>;
  inviteMembers: (emails: string[]) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  updateMemberRole: (userId: string, role: UserRole) => Promise<void>;
}

export function useGroup(options: UseGroupOptions = {}): UseGroupReturn {
  const { currentUser } = useAuth();
  const groupContext = useGroupContext();
  const [loadingState, setLoadingState] = useState<LoadingState>(LOADING_STATE.IDLE);
  const [group, setGroup] = useState<AsyncState<Group>>({
    data: null,
    loading: false,
    error: null,
  });
  const [members, setMembers] = useState<GroupMember[]>([]);

  const isOwner = currentUser?.uid === group.data?.ownerId;
  const isMember = group.data?.memberIds?.includes(currentUser?.uid ?? '') ?? false;

  const fetchGroup = useCallback(async () => {
    if (!options.id) return;

    try {
      setGroup(prev => ({ ...prev, loading: true, error: null }));
      setLoadingState(LOADING_STATE.LOADING);

      const groupData = await groupContext.getGroup(options.id);
      
      if (!groupData) {
        throw new Error(ERROR_MESSAGES.GROUP.NOT_FOUND);
      }

      setGroup({
        data: groupData,
        loading: false,
        error: null,
      });
      setMembers(groupData.members);
      setLoadingState(LOADING_STATE.SUCCESS);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.GROUP.NOT_FOUND;
      setGroup(prev => ({
        ...prev,
        loading: false,
        error: new Error(errorMessage),
      }));
      setLoadingState(LOADING_STATE.ERROR);
      toast.error(errorMessage);
    }
  }, [options.id, groupContext]);

  const updateGroup = useCallback(async (data: Partial<Group>) => {
    if (!group.data?.id || !currentUser) return;

    try {
      setLoadingState(LOADING_STATE.LOADING);

      // Validate update permissions
      if (!isOwner) {
        throw new Error(ERROR_MESSAGES.GROUP.UNAUTHORIZED);
      }

      // Validate group name if it's being updated
      if (data.name && (data.name.length < 3 || data.name.length > 50)) {
        throw new Error(ERROR_MESSAGES.GROUP.INVALID_NAME);
      }

      // Validate description if it's being updated
      if (data.description && data.description.length > 500) {
        throw new Error(ERROR_MESSAGES.GROUP.INVALID_DESCRIPTION);
      }

      const updatedGroup = await groupContext.updateGroup(group.data.id, data);
      setGroup(prev => ({
        ...prev,
        data: updatedGroup,
        error: null,
      }));
      setLoadingState(LOADING_STATE.SUCCESS);
      toast.success(SUCCESS_MESSAGES.GROUP.UPDATED);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.GROUP.UPDATE_FAILED;
      setLoadingState(LOADING_STATE.ERROR);
      toast.error(errorMessage);
      throw error;
    }
  }, [group.data?.id, currentUser, isOwner, groupContext]);

  const deleteGroup = useCallback(async () => {
    if (!group.data?.id || !currentUser) return;

    try {
      setLoadingState(LOADING_STATE.LOADING);

      if (!isOwner) {
        throw new Error(ERROR_MESSAGES.GROUP.UNAUTHORIZED);
      }

      await groupContext.deleteGroup(group.data.id);
      setLoadingState(LOADING_STATE.SUCCESS);
      toast.success(SUCCESS_MESSAGES.GROUP.DELETED);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.GROUP.DELETE_FAILED;
      setLoadingState(LOADING_STATE.ERROR);
      toast.error(errorMessage);
      throw error;
    }
  }, [group.data?.id, currentUser, isOwner, groupContext]);

  const leaveGroup = useCallback(async () => {
    if (!group.data?.id || !currentUser) return;

    try {
      setLoadingState(LOADING_STATE.LOADING);

      if (isOwner) {
        throw new Error('Group owner cannot leave the group');
      }

      await groupContext.removeMember(group.data.id, currentUser.uid);
      setLoadingState(LOADING_STATE.SUCCESS);
      toast.success('Left group successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave group';
      setLoadingState(LOADING_STATE.ERROR);
      toast.error(errorMessage);
      throw error;
    }
  }, [group.data?.id, currentUser, isOwner, groupContext]);

  const inviteMembers = useCallback(async (emails: string[]) => {
    if (!group.data?.id || !currentUser) return;

    try {
      setLoadingState(LOADING_STATE.LOADING);

      // Validate emails
      const invalidEmails = emails.filter(email => !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      }

      await groupContext.inviteMembers(group.data.id, emails);
      setLoadingState(LOADING_STATE.SUCCESS);
      toast.success(SUCCESS_MESSAGES.INVITE.SENT);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.INVITE.SEND_FAILED;
      setLoadingState(LOADING_STATE.ERROR);
      toast.error(errorMessage);
      throw error;
    }
  }, [group.data?.id, currentUser, groupContext]);

  const removeMember = useCallback(async (userId: string) => {
    if (!group.data?.id || !currentUser || !isOwner) return;

    try {
      setLoadingState(LOADING_STATE.LOADING);
      await groupContext.removeMember(group.data.id, userId);
      setLoadingState(LOADING_STATE.SUCCESS);
      toast.success('Member removed successfully');
      
      // Update local members state
      setMembers(prev => prev.filter(member => member.uid !== userId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
      setLoadingState(LOADING_STATE.ERROR);
      toast.error(errorMessage);
      throw error;
    }
  }, [group.data?.id, currentUser, isOwner, groupContext]);

  const updateMemberRole = useCallback(async (userId: string, role: UserRole) => {
    if (!group.data?.id || !currentUser || !isOwner) return;

    try {
      setLoadingState(LOADING_STATE.LOADING);
      await groupContext.updateMemberRole(group.data.id, userId, role);
      setLoadingState(LOADING_STATE.SUCCESS);
      toast.success('Member role updated successfully');
      
      // Update local members state
      setMembers(prev => 
        prev.map(member => 
          member.uid === userId ? { ...member, role } : member
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update member role';
      setLoadingState(LOADING_STATE.ERROR);
      toast.error(errorMessage);
      throw error;
    }
  }, [group.data?.id, currentUser, isOwner, groupContext]);

  // Auto-fetch group data if id is provided and autoFetch is true
  useEffect(() => {
    if (options.id && options.autoFetch !== false) {
      fetchGroup();
    }
  }, [options.id, options.autoFetch, fetchGroup]);

  return {
    group,
    members,
    isOwner,
    isMember,
    loadingState,
    fetchGroup,
    updateGroup,
    deleteGroup,
    leaveGroup,
    inviteMembers,
    removeMember,
    updateMemberRole,
  };
}
