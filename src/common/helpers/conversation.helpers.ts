import type { ConversationDto } from "@/src/common/interface/chat-interface";

export const getConversationLastMessageText = (
  conversation: ConversationDto,
  currentUserId?: string | null
) => {
  const lastMessage = conversation?.lastMessage;

  if (!lastMessage) return "Chưa có tin nhắn";

  const isMine = lastMessage.senderId === currentUserId;
  const content = lastMessage.content ?? "";

  if (content === "") {
    return isMine
      ? "Bạn đã thu hồi 1 tin nhắn"
      : "Tin nhắn đã bị thu hồi";
  }

  return `${isMine ? "Bạn: " : ""}${content}`;
};