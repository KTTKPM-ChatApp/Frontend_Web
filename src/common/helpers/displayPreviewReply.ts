import { UiMessage } from "../interface/chat-interface";

export const getReplyPreview = (replyTo?: UiMessage["replyTo"]) => {
  if (!replyTo) {
    return {
      text: "",
      imageAttachment: null,
      videoAttachment: null,
    };
  }

  const imageAttachment =
    replyTo.attachments?.find((att) => att.type === "image") ?? null;

  const videoAttachment =
    replyTo.attachments?.find((att) => att.type === "video") ?? null;

  const text = (replyTo.body ?? "").replace(/\u200B/g, "").trim();

  if (replyTo.isDeleted) {
    return {
      text: "Tin nhắn đã được thu hồi",
      imageAttachment: null,
      videoAttachment: null,
    };
  }

  if (text) {
    return {
      text,
      imageAttachment,
      videoAttachment,
    };
  }

  if (imageAttachment) {
    return {
      text: "Ảnh",
      imageAttachment,
      videoAttachment: null,
    };
  }

  if (videoAttachment) {
    return {
      text: "Video",
      imageAttachment: null,
      videoAttachment,
    };
  }

  return {
    text: replyTo.attachments?.length ? "Tệp đính kèm" : "Tin nhắn",
    imageAttachment: null,
    videoAttachment: null,
  };
};