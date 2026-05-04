// TODO: Replace with your new backend chat service
// This service needs to be updated to match your new backend API structure

export const chatService = {
  fetchListConversations(params: { page?: number; limit?: number }) {
    console.log('fetchListConversations called with:', params);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  createConversation(participantId: string) {
    console.log('createConversation called with:', participantId);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  fetchMessages(conversationId: string, params: { limit?: number; cursor?: string }) {
    console.log('fetchMessages called with:', { conversationId, params });
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  fetchMessageDetail(conversationId: string, createdAt: number, messageId: string) {
    console.log('fetchMessageDetail called with:', { conversationId, createdAt, messageId });
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  fetchMessageReactions(messageId: string) {
    console.log('fetchMessageReactions called with:', messageId);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  forwardMessage(payload: any) {
    console.log('forwardMessage called with:', payload);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  fetchConversationById(conversationId: string) {
    console.log('fetchConversationById called with:', conversationId);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  pinConversation(conversationId: string) {
    console.log('pinConversation called with:', conversationId);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  unpinConversation(conversationId: string) {
    console.log('unpinConversation called with:', conversationId);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  pinMessage(conversationId: string, createdAt: number, messageId: string) {
    console.log('pinMessage called with:', { conversationId, createdAt, messageId });
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  unpinMessage(conversationId: string, createdAt: number, messageId: string) {
    console.log('unpinMessage called with:', { conversationId, createdAt, messageId });
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  fetchPinnedMessages(conversationId: string) {
    console.log('fetchPinnedMessages called with:', conversationId);
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  },
  searchMessages(conversationId: string, params: any) {
    console.log('searchMessages called with:', { conversationId, params });
    return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
  }
};
