import { IUploadedMedia, UploadMediaParams } from "../interface/media-interface";

export type MediaVisibility = "public" | "private";
export type AttachmentType = "image" | "video" | "audio" | "document";

const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "http://18.138.217.102:5000";

export const getAttachmentType = (mimeType: string): AttachmentType => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
};

const getAccessTokenFromLocal = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export async function uploadChatMedia({
  file,
  conversationId,
}: UploadMediaParams): Promise<IUploadedMedia> {
  // Disabled - use media-service.ts instead
  throw new Error("uploadChatMedia is disabled - use media-service.ts");
}

export async function uploadManyChatMedia(
  files: File[],
  conversationId?: string
): Promise<IUploadedMedia[]> {
  return Promise.all(
    files.map((file) =>
      uploadChatMedia({
        file,
        conversationId,
        userId: "", // giữ signature cũ nếu interface đang bắt buộc
      })
    )
  );
}