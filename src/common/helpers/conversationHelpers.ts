import { ConversationDto, ConversationLastMessageDto, UiMessage } from "../interface/chat-interface";
import { sortConversations } from "./sortConservation";

const detectPreviewTypeFromMessage = (message: UiMessage) => {
  const cleanBody = (message.body ?? "").replace(/\u200B/g, "").trim();
  const lowerContent = cleanBody.toLowerCase();

  if (lowerContent.match(/\.(mp4|mov|avi|mkv|webm)$/)) return "video";
  if (lowerContent.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "image";
  if (lowerContent.match(/\.(pdf|doc|docx|xls|xlsx|txt|zip)$/)) return "file";
  if (lowerContent.match(/\.(mp3|wav|ogg|m4a)$/)) return "voice";

  if (message.attachments?.some((att) => att.type === "image")) return "image";
  if (message.attachments?.some((att) => att.type === "video")) return "video";
  if (message.attachments?.some((att) => att.type === "audio")) return "voice";
  if (message.attachments?.some((att) => att.type === "document")) return "file";

  if (cleanBody) return "text";
  return "deleted";
};

export const moveConversationToTopWithLastMessage = (
  conversations: ConversationDto[],
  conversationId: string,
  message: UiMessage
): ConversationDto[] => {
  const cleanBody = (message.body ?? "").replace(/\u200B/g, "").trim();
  const previewType = detectPreviewTypeFromMessage(message);

  let previewContent = cleanBody;

  switch (previewType) {
    case "image":
      previewContent = "Đã gửi 1 ảnh";
      break;
    case "video":
      previewContent = "Đã gửi 1 video";
      break;
    case "file":
      previewContent = "Đã gửi 1 tệp đính kèm";
      break;
    case "voice":
      previewContent = "__VOICE__";
      break;
    case "deleted":
      previewContent = "";
      break;
    default:
      previewContent = cleanBody;
      break;
  }

  const tempData: ConversationLastMessageDto = {
    id: message.messageId,
    content: previewContent,
    createdAt: message.createdAt,
    senderId: message.senderId,
    senderName: "",
  };

  const updatedList = conversations.map((cvs) =>
    cvs.id === conversationId
      ? {
          ...cvs,
          lastMessage: tempData,
          lastMessageAt: message.createdAt,
        }
      : cvs
  );
  return sortConversations(updatedList);
};
