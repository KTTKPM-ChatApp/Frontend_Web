import http from "../api/http";
import { API } from "../api/path";
import { IApiResponse } from "../interface/auth-interface";
import type {
  ConversationListResponse,
  MessagePageDto,
  UiMessage,
  ConversationDto,
} from "../interface/chat-interface";

type RawConversationMember = {
  userId: string;
  username?: string;
  displayName?: string;
  role: string;
}

type RawConversation = {
  id: string;
  title?: string;
  name?: string;
  avatarUrl?: string | null;
  type?: string;
  memberCount?: number;
  memberIds?: string[];
  members?: RawConversationMember[];
  unreadCount?: number;
  isMuted?: boolean;
  lastMessage?: any;
  lastMessageAt?: string | number | null;
  createdAt?: string | null;
};

type RawMessage = {
  id?: string;
  messageId?: string;
  conversationId?: string;
  conversation_id?: string;
  senderId?: string;
  sender_id?: string;
  content?: string;
  body?: string;
  createdAt?: string | number | Date;
  created_at?: string | number | Date;
  attachments?: any[];
  replyToId?: string | null;
  reply_to_id?: string | null;
  editedAt?: string | number | Date;
  deletedAt?: string | number | Date;
  isDeleted?: boolean;
};

const toMillis = (value: any) => {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? Date.now() : t;
};

const normalizeConversation = (item: RawConversation): ConversationDto => {
  const memberCount = item.memberCount ?? item.memberIds?.length ?? 0;
  const members = item.members?.map((m: RawConversationMember) => ({
    userId: m.userId,
    displayName: m.displayName,
    role: m.role
  })) || [];

  // For direct conversations, show the other user's name
  let conversationName = item.name || item.title || "Cuộc trò chuyện";
  if (item.type === 'DIRECT' && members.length > 0) {
    // Find the other member (not current user - we'll need current user ID for this)
    // For now, just use the first member's display name if available
    const otherMember = members.find((m: RawConversationMember) => m.displayName);
    if (otherMember?.displayName) {
      conversationName = otherMember.displayName;
    }
  }

  return {
    id: item.id,
    name: conversationName,
    avatarUrl: item.avatarUrl ?? null,
    type: (item.type || "DIRECT").toLowerCase(),
    memberCount,
    unreadCount: item.unreadCount ?? 0,
    isMuted: Boolean(item.isMuted),
    lastMessage: item.lastMessage
      ? {
          id: item.lastMessage.id ?? "",
          content: item.lastMessage.content ?? "",
          createdAt: item.lastMessage.createdAt ?? null,
          senderId: item.lastMessage.senderId ?? "",
          senderName: item.lastMessage.senderName ?? "",
        }
      : null,
    lastMessageAt: item.lastMessageAt ?? item.lastMessage?.createdAt ?? null,
    createdAt: item.createdAt ?? null,
    members
  };
};

const normalizeMessage = (item: RawMessage, conversationId: string): UiMessage => ({
  messageId: item.messageId || item.id || crypto.randomUUID(),
  conversationId: item.conversationId || item.conversation_id || conversationId,
  senderId: item.senderId || item.sender_id || "",
  body: item.body || item.content || "",
  createdAt: toMillis(item.createdAt ?? item.created_at),
  attachments: Array.isArray(item.attachments) ? item.attachments : [],
  replyToMessageId: item.replyToId || item.reply_to_id || null,
  editedAt: item.editedAt ? toMillis(item.editedAt) : undefined,
  deletedAt: item.deletedAt ? toMillis(item.deletedAt) : undefined,
  isDeleted: Boolean(item.isDeleted),
});

// Types for new conversation features
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
export interface MessageSearchParams {
  q?: string;
  senderId?: string;
  from?: number;
  to?: number;
  fileType?: "images" | "video" | "files";
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

export const chatService = {
  // Existing functions
  fetchListConversations(params: { page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const offset = (page - 1) * limit;
    return http
      .get<ConversationListResponse>(
        `${API.API_CONVERSATIONS_LIST}?limit=${limit}&offset=${offset}`
      )
      .then((res) => {
        const payload: any = res?.payload || {};
        const rows: RawConversation[] = Array.isArray(payload.data) ? payload.data : [];
        return {
          ...res,
          payload: {
            ...payload,
            data: rows.map(normalizeConversation),
          },
        };
      });
  },

  fetchMessages(
    conversationId: string,
    params: { limit?: number; cursor?: string }
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(params.limit ?? 50));
    if (params.cursor) {
      searchParams.set("before", params.cursor);
    }

    const url = `${API.API_MESSAGES(conversationId)}?${searchParams.toString()}`;
    return http.get<any>(url).then((res) => {
      const payload: any = res?.payload || {};
      const rows: RawMessage[] = Array.isArray(payload.data) ? payload.data : [];
      const items = rows.map((row) => normalizeMessage(row, conversationId));
      const hasMore = Boolean(payload?.meta?.hasNext) || items.length >= (params.limit ?? 50);
      const nextCursor =
        hasMore && items.length > 0 ? new Date(items[0].createdAt).toISOString() : null;

      const transformed: IApiResponse<MessagePageDto> = {
        success: true,
        data: {
          items,
          nextCursor,
          hasMore,
        },
      } as any;

      return {
        ...res,
        payload: transformed,
      };
    });
  },

  fetchMessageDetail(
    conversationId: string,
    createdAt: number,
    messageId: string
  ) {
    return http.get<IApiResponse<UiMessage>>(
      API.API_MESSAGE_DETAIL(conversationId, createdAt, messageId)
    );
  },

  fetchMessageReactions(messageId: string) {
    return http.get<IApiResponse<any[]>>(
      API.API_MESSAGE_REACTIONS(messageId)
    );
  },

  searchMessages(conversationId: string, params: MessageSearchParams) {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set("q", params.q);
    if (params.senderId) searchParams.set("senderId", params.senderId);
    if (params.from) searchParams.set("from", String(params.from));
    if (params.to) searchParams.set("to", String(params.to));
    if (params.fileType) searchParams.set("fileType", params.fileType);
    return http.get<IApiResponse<UiMessage[]>>(
      `${API.API_MESSAGES_SEARCH(conversationId)}?${searchParams.toString()}`
    );
  },

  forwardMessage(data: {
    forward_id: string;
    source_message_id: string;
    targets: Array<{ message_id: string; conversation_id: string }>;
  }) {
    return http.post<IApiResponse<any>>(API.API_MESSAGES_FORWARD, data);
  },

  pinMessage(conversationId: string, createdAt: number, messageId: string) {
    return http.post<IApiResponse<any>>(
      API.API_MESSAGE_PIN(conversationId, createdAt, messageId)
    );
  },

  unpinMessage(conversationId: string, createdAt: number, messageId: string) {
    return http.delete<IApiResponse<any>>(
      API.API_MESSAGE_PIN(conversationId, createdAt, messageId)
    );
  },

  getPinnedMessages(conversationId: string, limit: number = 20) {
    return http.get<IApiResponse<any[]>>(
      `${API.API_MESSAGE_PINS(conversationId)}?limit=${limit}`
    );
  },

  // New conversation management functions
  getConversationById(conversationId: string) {
    return http.get<IApiResponse<ConversationDto>>(
      API.API_CONVERSATIONS_DETAIL(conversationId)
    );
  },

  createGroupConversation(data: CreateGroupRequest) {
    return http
      .post<any>(API.API_CONVERSATIONS_LIST, {
        type: "GROUP",
        title: data.name,
        participantIds: data.memberIds,
      })
      .then((res) => {
        const raw = res?.payload || {};
        const normalized = normalizeConversation(raw);
        return {
          ...res,
          payload: {
            success: true,
            data: normalized,
          },
        };
      });
  },

  createDirectConversation(data: CreateDirectRequest) {
    return http
      .post<any>(API.API_CONVERSATIONS_LIST, {
        type: "DIRECT",
        participantIds: [data.participantId],
      })
      .then((res) => {
        const raw = res?.payload || {};
        const normalized = normalizeConversation(raw);
        return {
          ...res,
          payload: {
            success: true,
            data: normalized,
          },
        };
      });
  },

  updateConversation(conversationId: string, data: UpdateConversationRequest) {
    return http.patch<IApiResponse<ConversationDto>>(
      API.API_CONVERSATIONS_UPDATE(conversationId),
      data
    );
  },

  // Member management
  addMembers(conversationId: string, data: AddMembersRequest) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_ADD_MEMBER(conversationId),
      data
    );
  },

  removeMember(conversationId: string, memberId: string) {
    return http.delete<IApiResponse<any>>(
      API.API_CONVERSATIONS_REMOVE_MEMBER(conversationId, memberId)
    );
  },

  leaveConversation(conversationId: string) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_LEAVE(conversationId)
    );
  },

  updateMemberRole(conversationId: string, memberId: string, data: UpdateRoleRequest) {
    return http.patch<IApiResponse<any>>(
      API.API_CONVERSATIONS_UPDATE_ROLE(conversationId, memberId),
      data
    );
  },

  updateConversationSettings(conversationId: string, data: UpdateSettingsRequest) {
    return http.patch<IApiResponse<any>>(
      API.API_CONVERSATIONS_SETTINGS(conversationId),
      data
    );
  },

  markAsRead(conversationId: string) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_READ(conversationId)
    );
  },

  // Pin management
  pinConversation(conversationId: string) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_PIN(conversationId)
    );
  },

  unpinConversation(conversationId: string) {
    return http.delete<IApiResponse<any>>(
      API.API_CONVERSATIONS_UNPIN(conversationId)
    );
  },

  // Group settings
  updateGroupSettings(conversationId: string, data: UpdateGroupSettingsRequest) {
    return http.patch<IApiResponse<any>>(
      API.API_CONVERSATIONS_GROUP_SETTINGS(conversationId),
      data
    );
  },

  disbandGroup(conversationId: string) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_DISBAND(conversationId)
    );
  },

  // Invitation management
  sendInvites(conversationId: string, data: SendInviteRequest) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_INVITES_SEND(conversationId),
      data
    );
  },

  getPendingInvites(params: { page?: number; limit?: number; status?: string }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const status = params.status ? `&status=${params.status}` : '';
    
    return http.get<IApiResponse<any>>(
      `${API.API_CONVERSATIONS_INVITES_PENDING}?page=${page}&limit=${limit}${status}`
    );
  },

  acceptInvite(conversationId: string, inviteId: string) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_INVITES_ACCEPT(conversationId, inviteId)
    );
  },

  rejectInvite(conversationId: string, inviteId: string) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_INVITES_REJECT(conversationId, inviteId)
    );
  },

  cancelInvite(conversationId: string, inviteId: string) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_INVITES_CANCEL(conversationId, inviteId)
    );
  },

  // Poll management
  getPolls(conversationId: string, params: { page?: number; limit?: number; status?: string }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const status = params.status ? `&status=${params.status}` : '';
    
    return http.get<IApiResponse<any>>(
      `${API.API_CONVERSATIONS_POLLS_LIST(conversationId)}?page=${page}&limit=${limit}${status}`
    );
  },

  getPollDetails(conversationId: string, pollId: string) {
    return http.get<IApiResponse<any>>(
      API.API_CONVERSATIONS_POLLS_DETAIL(conversationId, pollId)
    );
  },

  createPoll(conversationId: string, data: CreatePollRequest) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_POLLS_CREATE(conversationId),
      data
    );
  },

  updatePoll(conversationId: string, pollId: string, data: any) {
    return http.patch<IApiResponse<any>>(
      API.API_CONVERSATIONS_POLLS_UPDATE(conversationId, pollId),
      data
    );
  },

  votePoll(conversationId: string, pollId: string, data: VotePollRequest) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_POLLS_VOTE(conversationId, pollId),
      data
    );
  },

  withdrawVote(conversationId: string, pollId: string) {
    return http.delete<IApiResponse<any>>(
      API.API_CONVERSATIONS_POLLS_WITHDRAW(conversationId, pollId)
    );
  },

  addPollOption(conversationId: string, pollId: string, data: AddPollOptionRequest) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_POLLS_ADD_OPTION(conversationId, pollId),
      data
    );
  },

  removePollOption(conversationId: string, pollId: string, optionId: string) {
    return http.delete<IApiResponse<any>>(
      API.API_CONVERSATIONS_POLLS_REMOVE_OPTION(conversationId, pollId, optionId)
    );
  },

  closePoll(conversationId: string, pollId: string) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_POLLS_CLOSE(conversationId, pollId)
    );
  },

  // Call management
  getIceServers() {
    return http.get<IApiResponse<any>>(
      API.API_CONVERSATIONS_ICE_SERVERS
    );
  },

  getCallHistory(conversationId: string, params: { page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    
    return http.get<IApiResponse<any>>(
      `${API.API_CONVERSATIONS_CALLS_HISTORY(conversationId)}?page=${page}&limit=${limit}`
    );
  },

  getCallState(conversationId: string) {
    return http.get<IApiResponse<any>>(
      API.API_CONVERSATIONS_CALLS_STATE(conversationId)
    );
  },

  endCall(conversationId: string, callId: string, data: EndCallRequest) {
    return http.post<IApiResponse<any>>(
      API.API_CONVERSATIONS_CALLS_END(conversationId, callId),
      data
    );
  },
};
