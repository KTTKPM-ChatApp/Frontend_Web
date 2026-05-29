export interface ChatbotConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  metadata?: string | null;
}

export interface ChatbotSendMessageResponse {
  userMessage: ChatbotMessage;
  assistantMessage: ChatbotMessage;
}
