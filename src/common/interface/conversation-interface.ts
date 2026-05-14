// Conversation Management Interfaces

export interface ConversationMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  nickname?: string;
  isMuted: boolean;
  lastReadAt?: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationInvite {
  id: string;
  conversationId: string;
  invitedBy: string;
  userId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  message?: string;
  expiresAt: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  conversationTitle?: string;
  conversationType?: string;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  createdAt: string;
}

export interface ConversationPoll {
  id: string;
  conversationId: string;
  createdBy: string;
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  allowAddOption: boolean;
  isAnonymous: boolean;
  status: 'OPEN' | 'CLOSED';
  expiresAt?: string;
  closedAt?: string;
  closedBy?: string;
  createdAt: string;
  updatedAt: string;
  totalVotes?: number;
  userVote?: {
    id: string;
    pollId: string;
    userId: string;
    optionIds: string[];
    votedAt: string;
  };
}

export interface CallParticipant {
  userId: string;
  joinedAt: string;
  leftAt?: string;
}

export interface ConversationCall {
  id: string;
  conversationId: string;
  startedBy: string;
  type: 'AUDIO' | 'VIDEO';
  status: 'ONGOING' | 'ENDED';
  startedAt: string;
  endedAt?: string;
  endedBy?: string;
  endReason?: string;
  participants: CallParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSettings {
  conversationId: string;
  permissions?: {
    canAddMembers: boolean;
    canRemoveMembers: boolean;
    canCreatePolls: boolean;
    canStartCall: boolean;
    canSendMessage: boolean;
  };
  policies?: {
    maxMembers: number;
    inviteApproval: boolean;
    messageRetention: number;
  };
  features?: {
    polls: boolean;
    calls: boolean;
    fileSharing: boolean;
    reactions: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreateGroupRequest {
  name: string;
  memberIds: string[];
  avatarUrl?: string;
}

export interface CreateDirectRequest {
  participantId: string;
}

export interface UpdateConversationRequest {
  name?: string;
  avatarUrl?: string;
}

export interface AddMembersRequest {
  memberIds: string[];
}

export interface UpdateRoleRequest {
  role: 'ADMIN' | 'MEMBER';
}

export interface UpdateSettingsRequest {
  nickname?: string;
  isMuted?: boolean;
}

export interface SendInviteRequest {
  userIds: string[];
  message?: string;
  expiresInHours?: number;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
  allow_multiple?: boolean;
  allow_add_option?: boolean;
  is_anonymous?: boolean;
  expires_in_hours?: number;
}

export interface VotePollRequest {
  option_ids: string[];
}

export interface AddPollOptionRequest {
  label: string;
}

export interface EndCallRequest {
  reason?: string;
}

export interface UpdateGroupSettingsRequest {
  permissions?: {
    canAddMembers: boolean;
    canRemoveMembers: boolean;
    canCreatePolls: boolean;
    canStartCall: boolean;
    canSendMessage: boolean;
  };
  policies?: {
    maxMembers: number;
    inviteApproval: boolean;
    messageRetention: number;
  };
  features?: {
    polls: boolean;
    calls: boolean;
    fileSharing: boolean;
    reactions: boolean;
  };
}

// Response Types
export interface ConversationListResponse {
  success: boolean;
  data: ConversationDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Re-export existing types from chat-interface
export type {
  ConversationDto,
  ConversationListMeta,
  UiMessage,
  MessagePageDto,
  PaginationState,
  IChat
} from './chat-interface';
