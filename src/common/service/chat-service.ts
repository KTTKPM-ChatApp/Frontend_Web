import http from "../api/http";
import { API } from "../api/path";

export const chatService = {
  fetchListConversations(params: { limit?: number; offset?: number }) {
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    return http.get(`${API.API_CONVERSATIONS_LIST}?limit=${limit}&offset=${offset}`);
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

  sendMessage(conversationId: string, content: string, contentType = 'TEXT') {
    return http.post(API.API_CONVERSATIONS_SEND_MESSAGE(conversationId), {
      content,
      contentType
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

  forwardMessage(payload: any) {
    console.log('forwardMessage called with:', payload);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented yet' } });
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
    console.log('fetchPinnedMessages called with:', conversationId);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented yet' } });
  },

  searchMessages(conversationId: string, params: any) {
    console.log('searchMessages called with:', { conversationId, params });
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented yet' } });
  }
};
