import {
  ChatAttachmentPayload,
  IUploadedMedia,
} from "@/src/common/interface/media-interface";

export const buildChatAttachmentPayload = (
  uploaded: IUploadedMedia,
  file: File
): ChatAttachmentPayload => ({
  key: uploaded.key,
  type: uploaded.type,
  name: uploaded.fileName || file.name,
  size: uploaded.size ?? file.size,
  content_type: uploaded.contentType || file.type,
  thumbnail_key: uploaded.thumbnailKey ?? undefined,
  visibility: uploaded.visibility,
  url: uploaded.url || undefined,
  thumbnailUrl: uploaded.type === "video" ? (uploaded.url || uploaded.thumbnailKey) : (uploaded.thumbnailKey || undefined),
});

export const sanitizeInputText = (value?: string | null) =>
  (value ?? "").replace(/\u200B/g, "").trim();