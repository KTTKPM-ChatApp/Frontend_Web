import { ChatAttachmentPayload, IUploadedMedia } from "../interface/media-interface";



export const buildChatAttachmentPayload = (
  uploaded: IUploadedMedia
): ChatAttachmentPayload => ({
  key: uploaded.key,
  type: uploaded.type,
  name: uploaded.fileName,
  size: uploaded.size,
  content_type: uploaded.contentType,
  thumbnail_key: uploaded.thumbnailKey,
  visibility: uploaded.visibility,
});

export const buildChatAttachmentsPayload = (
  uploadedFiles: IUploadedMedia[]
): ChatAttachmentPayload[] =>
  uploadedFiles.map(buildChatAttachmentPayload);