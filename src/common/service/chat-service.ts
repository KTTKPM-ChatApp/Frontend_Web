import http from "../api/http";
import { API } from "../api/path";
import type { IApiResponse } from "../interface/auth-interface";
import type {
  ConversationListResponse,
  MessagePageDto,
  UiMessage,
  ConversationDto,
  ConversationMemberDto,
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
  })) || (item.memberIds?.map((id: string) => ({
    userId: id,
    role: "",
  } as ConversationMemberDto)) || []);

  let conversationName = item.title || item.name || "Cuộc trò chuyện";
  // Với GROUP: ưu tiên title (tên nhóm), không dùng name (tên user)
  if ((item.type || '').toUpperCase() === 'GROUP') {
    conversationName = item.title || "Cuộc trò chuyện";
  } else if ((item.type || '').toUpperCase() === 'DIRECT' && members.length > 0) {
    const otherMember = members.find((m: any) => m.displayName);
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
  description?: string;
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
  fetchListConversations(params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    return http.get<ConversationListResponse>(`${API.API_CONVERSATIONS_LIST}?page=${page}&limit=${limit}`);
  },

  createConversation(type: 'DIRECT' | 'GROUP', participantIds: string[], title?: string) {
    return http.post(API.API_CONVERSATIONS_CREATE, {
      type,
      participantIds,
      title
    });
  },

  fetchMessages(conversationId: string, params: { limit?: number; before?: string | null } = {}) {
    const urlParams = new URLSearchParams();
    if (params.limit) urlParams.set("limit", String(params.limit));
    if (params.before) urlParams.set("cursor", params.before);
    
    return http.get<IApiResponse<any>>(
      `${API.API_MESSAGES_LIST(conversationId)}?${urlParams.toString()}`
    );
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

  editMessageContent(conversationId: string, createdAt: number, messageId: string, content: string) {
    return http.patch<IApiResponse<any>>(
      API.API_MESSAGE_DETAIL(conversationId, createdAt, messageId),
      { content }
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
      .post<any>(API.API_CONVERSATIONS_CREATE_GROUP, {
        name: data.name,
        memberIds: data.memberIds,
        avatarUrl: data.avatarUrl,
        description: data.description,
      })
      .then((res) => {
        console.log("[chat-service] createGroupConversation response:", res);
        
        if (!res.ok) {
          console.error("[chat-service] createGroupConversation failed:", res.payload);
          throw new Error(res.payload?.message || "Failed to create group");
        }
        
        const raw = res?.payload || {};
        console.log("[chat-service] createGroupConversation raw:", raw);
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
      .post<any>(API.API_CONVERSATIONS_DIRECT, {
        participantId: data.participantId,
      })
      .then((res) => {
        // Backend trả về JSON trực tiếp, không có wrapper { success, data }
        // Nên payload chính là conversation object
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

  sendMessage(conversationId: string, content: string, contentType = 'TEXT', attachments: any[] = [], replyToId?: string | null) {
    return http.post(API.API_CONVERSATIONS_SEND_MESSAGE(conversationId), {
      content,
      contentType,
      attachments,
      reply_to_id: replyToId || undefined
    });
  },

  fetchConversationById(conversationId: string) {
    return http.get(API.API_CONVERSATIONS_DETAIL(conversationId));
  },

  pinConversation(conversationId: string) {
    console.log('pinConversation called with:', conversationId);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented yet' } });
  },

  unpinConversation(conversationId: string) {
    console.log('unpinConversation called with:', conversationId);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented yet' } });
  },

  fetchPinnedMessages(conversationId: string) {
    return http.get<{ data?: { items?: unknown[] } }>(API.API_MESSAGE_PINS(conversationId));
  },



  updateConversationSettings(conversationId: string, body: UpdateSettingsRequest | UpdateGroupSettingsRequest) {
    return http.patch(API.API_CONVERSATIONS_SETTINGS(conversationId), body);
  },

  sendInvites(conversationId: string, body: SendInviteRequest | AddMembersRequest) {
    return http.post(API.API_CONVERSATIONS_INVITES_SEND(conversationId), body);
  },

  createPoll(conversationId: string, body: CreatePollRequest) {
    return http.post(API.API_CONVERSATIONS_POLLS_CREATE(conversationId), body);
  },

  votePoll(conversationId: string, pollId: string, body: VotePollRequest) {
    return http.post(API.API_CONVERSATIONS_POLLS_VOTE(conversationId, pollId), body);
  },

  withdrawVote(conversationId: string, pollId: string) {
    return http.delete(API.API_CONVERSATIONS_POLLS_WITHDRAW(conversationId, pollId));
  },

  closePoll(conversationId: string, pollId: string) {
    return http.post(API.API_CONVERSATIONS_POLLS_CLOSE(conversationId, pollId));
  },

  getIceServers() {
    return http.get(API.API_CONVERSATIONS_ICE_SERVERS);
  },

  getCallState(conversationId: string) {
    return http.get(API.API_CONVERSATIONS_CALLS_STATE(conversationId));
  },

deleteMessage(conversationId: string, createdAt: number, messageId: string) {
    return http.delete(`/api/messages/${conversationId}/${createdAt}/${messageId}`);
  },

  leaveConversation(conversationId: string) {
    return http.delete(API.API_CONVERSATIONS_MEMBERS(conversationId) + '/me');
  },

  disbandGroup(conversationId: string) {
    return http.delete(API.API_CONVERSATIONS_DETAIL(conversationId));
  },

  removeMember(conversationId: string, memberId: string) {
    return http.delete(API.API_CONVERSATIONS_MEMBERS(conversationId) + '/' + memberId);
  },
};
