import http from "../api/http";
import { API } from "../api/path";
import type {
  AddMembersRequest,
  CreatePollRequest,
  SendInviteRequest,
  UpdateConversationRequest,
  UpdateGroupSettingsRequest,
  UpdateSettingsRequest,
  VotePollRequest,
} from "../interface/conversation-interface";
import type { AttachmentDto, ConversationListResponse } from "../interface/chat-interface";

type SearchMessagesParams = { q?: string; query?: string; limit?: number; before?: string };
type ForwardMessagePayload = { messageId: string; conversationIds?: string[]; targetConversationIds?: string[] };

export const chatService = {
  fetchListConversations(params: { limit?: number; offset?: number }) {
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    return http.get<ConversationListResponse>(`${API.API_CONVERSATIONS_LIST}?limit=${limit}&offset=${offset}`);
  },

  createConversation(type: 'DIRECT' | 'GROUP', participantIds: string[], title?: string) {
    return http.post(API.API_CONVERSATIONS_CREATE, {
      type,
      participantIds,
      title
    });
  },

  fetchMessages(conversationId: string, params: { limit?: number; before?: string }) {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.before) queryParams.append('before', params.before);
    
    const url = `${API.API_CONVERSATIONS_MESSAGES(conversationId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return http.get(url);
  },

  sendMessage(conversationId: string, content: string, contentType = 'TEXT', attachments: AttachmentDto[] = []) {
    return http.post(API.API_CONVERSATIONS_SEND_MESSAGE(conversationId), {
      content,
      contentType,
      attachments
    });
  },

  fetchMessageDetail(conversationId: string, createdAt: number, messageId: string) {
    console.log('fetchMessageDetail called with:', { conversationId, createdAt, messageId });
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented yet' } });
  },

  fetchMessageReactions(messageId: string) {
    console.log('fetchMessageReactions called with:', messageId);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented yet' } });
  },

  forwardMessage(payload: ForwardMessagePayload) {
    return http.post(API.API_MESSAGES_FORWARD, payload);
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

  pinMessage(conversationId: string, createdAt: number, messageId: string) {
    console.log('pinMessage called with:', { conversationId, createdAt, messageId });
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented yet' } });
  },

  unpinMessage(conversationId: string, createdAt: number, messageId: string) {
    console.log('unpinMessage called with:', { conversationId, createdAt, messageId });
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented yet' } });
  },

  fetchPinnedMessages(conversationId: string) {
    return http.get<{ data?: { items?: unknown[] } }>(API.API_MESSAGE_PINS(conversationId));
  },

  searchMessages(conversationId: string, params: SearchMessagesParams) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    const suffix = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return http.get(`${API.API_MESSAGES_SEARCH(conversationId)}${suffix}`);
  },

  createGroupConversation(body: { name?: string; title?: string; memberIds: string[]; avatarUrl?: string }) {
    return http.post(API.API_CONVERSATIONS_CREATE_GROUP, body);
  },

  updateConversation(conversationId: string, body: UpdateConversationRequest) {
    return http.put(API.API_CONVERSATIONS_UPDATE(conversationId), body);
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
  }
};
