import http from "../api/http";
import { API } from "../api/path";
import { IApiResponse } from "../interface/auth-interface";
import type {
  ConversationListResponse,
  MessagePageDto,
  UiMessage,
} from "../interface/chat-interface";

export const chatService = {
  fetchListConversations(params: { page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    return http.get<ConversationListResponse>(
      `${API.API_CONVERSATIONS_LIST}?page=${page}&limit=${limit}`
    );
  },

  fetchMessages(
    conversationId: string,
    params: { limit?: number; cursor?: string }
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", String(params.limit ?? 50));
    if (params.cursor) {
      searchParams.set("cursor", params.cursor);
    }

    const url = `${API.API_MESSAGES(conversationId)}?${searchParams.toString()}`;
    return http.get<IApiResponse<MessagePageDto>>(url);
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
};