export interface ChatTypingUser {
  userId?: string;
  user_id?: string;
  fullName?: string;
  username?: string;
  name?: string;
}

export interface ChatTypingEmitPayload {
  conversation_id: string;
  username?: string;
}

export interface ChatTypingUpdatePayload {
  conversation_id: string;
  users?: ChatTypingUser[];
}

export interface TypingIndicatorState {
  users: ChatTypingUser[];
  text: string;
  visible: boolean;
}
