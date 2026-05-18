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
  url:
    uploaded.visibility === "public"
      ? `${process.env.NEXT_PUBLIC_S3_BASE_URL}/${uploaded.url}`
      : undefined,
  thumbnailUrl:
    uploaded.visibility === "public"
      ? `${process.env.NEXT_PUBLIC_S3_BASE_URL}/${uploaded.thumbnailKey}`
      : undefined,
});

export const sanitizeInputText = (value?: string | null) =>
  (value ?? "").replace(/\u200B/g, "").trim();