// src/types/group.ts

export interface PendingMember {
    id: string;
    identifier: string; // Phone number or email
    type: 'phone' | 'email';
    dateInvited: Date;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
  }
  
  export interface Group {
    id?: string;
    name: string;
    emoji: string;
    description?: string;
    ownerId: string;
    members: string[];
    pendingMembers: PendingMember[];
    dateCreated: Date;
    isHidden: boolean;
    visibility: 'public' | 'private';
    inviteLink?: string;
    status: string;
  }
  
  export interface GroupError {
    code: string;
    message: string;
  }
  
  export interface CreateGroupInput {
    name: string;
    emoji: string;
    description?: string;
    visibility?: 'public' | 'private';
    initialMembers?: string[];
  }
  
  export interface UpdateGroupInput {
    name?: string;
    emoji?: string;
    description?: string;
    visibility?: 'public' | 'private';
    isHidden?: boolean;
  }