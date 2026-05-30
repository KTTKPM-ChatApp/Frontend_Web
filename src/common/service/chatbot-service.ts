import http from "../api/http";
import { API } from "../api/path";
import type { IApiResponse } from "../interface/auth-interface";
import type {
  ChatbotConversation,
  ChatbotMessage,
  ChatbotSendMessageResponse,
} from "../interface/chatbot-interface";

export const chatbotService = {
  listConversations() {
    return http.get<IApiResponse<ChatbotConversation[]>>(
      API.API_CHATBOT_CONVERSATIONS
    );
  },

  createConversation(title?: string) {
    return http.post<IApiResponse<ChatbotConversation>>(
      API.API_CHATBOT_CONVERSATIONS,
      { title }
    );
  },

  getConversation(conversationId: string) {
    return http.get<IApiResponse<ChatbotConversation>>(
      API.API_CHATBOT_CONVERSATION(conversationId)
    );
  },

  deleteConversation(conversationId: string) {
    return http.delete<IApiResponse<{ deleted: boolean }>>(
      API.API_CHATBOT_CONVERSATION(conversationId)
    );
  },

  listMessages(conversationId: string) {
    return http.get<IApiResponse<ChatbotMessage[]>>(
      API.API_CHATBOT_MESSAGES(conversationId)
    );
  },

  sendMessage(conversationId: string, content: string) {
    return http.post<IApiResponse<ChatbotSendMessageResponse>>(
      API.API_CHATBOT_MESSAGES(conversationId),
      { content }
    );
  },
};
