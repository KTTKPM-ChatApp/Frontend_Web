import { UiMessage } from "../interface/chat-interface";

export const getReplyPreview = (replyTo?: UiMessage["replyTo"]) => {
  if (!replyTo) {
    return {
      text: "",
      imageAttachment: null,
      videoAttachment: null,
      imageAttachments: [],
      fileAttachments: [],
      audioAttachments: [],
      imageCount: 0,
      fileCount: 0,
      audioCount: 0,
      hasMultipleImages: false,
      hasMultipleFiles: false,
    };
  }

  const attachments = replyTo.attachments || [];

  const imageAttachments = attachments.filter((att) => att.type === "image");
  const videoAttachments = attachments.filter((att) => att.type === "video");
  const fileAttachments = attachments.filter(
    (att) => att.type === "file" || att.type === "document"
  );
  const audioAttachments = attachments.filter((att) => att.type === "audio");

  const imageAttachment = imageAttachments[0] ?? null;
  const videoAttachment = videoAttachments[0] ?? null;

  const text = (replyTo.body ?? "").replace(/\u200B/g, "").trim();

  if (replyTo.isDeleted) {
    return {
      text: "Tin nhắn đã được thu hồi",
      imageAttachment: null,
      videoAttachment: null,
      imageAttachments: [],
      fileAttachments: [],
      audioAttachments: [],
      imageCount: 0,
      fileCount: 0,
      audioCount: 0,
      hasMultipleImages: false,
      hasMultipleFiles: false,
      hasBodyText: false,
      attachmentType: "deleted" as const,
    };
  }

  if (text) {
    return {
      text,
      imageAttachment,
      videoAttachment,
      imageAttachments,
      fileAttachments,
      audioAttachments,
      imageCount: imageAttachments.length,
      fileCount: fileAttachments.length,
      audioCount: audioAttachments.length,
      hasMultipleImages: imageAttachments.length > 1,
      hasMultipleFiles: fileAttachments.length > 1 || audioAttachments.length > 1,
      hasBodyText: true,
      attachmentType: "mixed" as const,
    };
  }

  if (imageAttachments.length > 0) {
    return {
      text: "",
      imageAttachment,
      videoAttachment: null,
      imageAttachments,
      fileAttachments,
      audioAttachments,
      imageCount: imageAttachments.length,
      fileCount: fileAttachments.length,
      audioCount: audioAttachments.length,
      hasMultipleImages: imageAttachments.length > 1,
      hasMultipleFiles: fileAttachments.length > 1 || audioAttachments.length > 1,
      hasBodyText: false,
      attachmentType: "image" as const,
    };
  }

  if (videoAttachment) {
    return {
      text: "",
      imageAttachment: null,
      videoAttachment,
      imageAttachments: [],
      fileAttachments,
      audioAttachments,
      imageCount: 0,
      fileCount: fileAttachments.length,
      audioCount: audioAttachments.length,
      hasMultipleImages: false,
      hasMultipleFiles: fileAttachments.length > 1 || audioAttachments.length > 1,
      hasBodyText: false,
      attachmentType: "video" as const,
    };
  }

  if (fileAttachments.length > 0) {
    return {
      text: "",
      imageAttachment: null,
      videoAttachment: null,
      imageAttachments: [],
      fileAttachments,
      audioAttachments,
      imageCount: 0,
      fileCount: fileAttachments.length,
      audioCount: audioAttachments.length,
      hasMultipleImages: false,
      hasMultipleFiles: fileAttachments.length > 1,
      hasBodyText: false,
      attachmentType: "file" as const,
    };
  }

  if (audioAttachments.length > 0) {
    return {
      text: "",
      imageAttachment: null,
      videoAttachment: null,
      imageAttachments: [],
      fileAttachments: [],
      audioAttachments,
      imageCount: 0,
      fileCount: audioAttachments.length,
      audioCount: audioAttachments.length,
      hasMultipleImages: false,
      hasMultipleFiles: audioAttachments.length > 1,
      hasBodyText: false,
      attachmentType: "file" as const,
    };
  }

  return {
    text: "",
    imageAttachment: null,
    videoAttachment: null,
    imageAttachments: [],
    fileAttachments: [],
    audioAttachments: [],
    imageCount: 0,
    fileCount: 0,
    audioCount: 0,
    hasMultipleImages: false,
    hasMultipleFiles: false,
    hasBodyText: false,
    attachmentType: "unknown" as const,
  };
};
