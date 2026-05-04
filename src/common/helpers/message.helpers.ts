import { UiMessage } from "@/src/common/interface/chat-interface";

export const getMessageTextContent = (body?: string | null) =>
  (body ?? "").replace(/\u200B/g, "").trim();

export const formatMessageTime = (createdAt: UiMessage["createdAt"]) => {
  return new Date(createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const splitMessageAttachments = (attachments?: UiMessage["attachments"]) => {
  const safeAttachments = Array.isArray(attachments) ? attachments : [];

  return {
    imageAttachments: safeAttachments.filter((file) => file.type === "image"),
    videoAttachments: safeAttachments.filter((file) => file.type === "video"),
    otherAttachments: safeAttachments.filter(
      (file) => file.type !== "image" && file.type !== "video"
    ),
  };
};

export const shouldShowMessageBubble = ({
  isDeleted,
  hasText,
  otherAttachmentCount,
  hasReply,
}: {
  isDeleted?: boolean;
  hasText: boolean;
  otherAttachmentCount: number;
  hasReply: boolean;
}) => {
  return !!isDeleted || hasText || otherAttachmentCount > 0 || hasReply;
};