import { IUploadedMedia, UploadMediaParams } from "../interface/media-interface";

export type MediaVisibility = "public" | "private";
export type AttachmentType = "image" | "video" | "audio" | "document";

const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4321";

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

export async function uploadMedia({
  file,
  userId,
}: UploadMediaParams): Promise<IUploadedMedia> {
  try {
    const token = getAccessTokenFromLocal();
    if (!token) {
      throw new Error("Không tìm thấy access token trong localStorage");
    }

    const authHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-user-id": String(userId),
    };

    // 1) presign - Call chat-service media upload
    const presignRes = await fetch(`${MEDIA_BASE_URL}/api/media/upload`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        contentType: file.type,
        fileName: file.name,
        userId: userId || "", // Ensure userId is not undefined
      }),
    });

    if (!presignRes.ok) {
      const text = await presignRes.text().catch(() => "");
      throw new Error(text || "Upload failed - backend not ready");
    }

    // Backend returns upload result directly
    const uploadData = await presignRes.json();
    return {
      key: uploadData.key || `temp-${Date.now()}`,
      url: uploadData.url || null,
      visibility: uploadData.visibility || "public",
      thumbnailKey: uploadData.thumbnailKey || null,
      contentType: file.type,
      fileName: file.name,
      size: file.size,
      type: getAttachmentType(file.type),
    };
  } catch (error) {
    console.error("uploadMedia error:", error);
    throw error;
  }
}

export async function uploadManyMedia(
  files: File[],
  userId: string,
  conversationId?: string
): Promise<IUploadedMedia[]> {
  return Promise.all(
    files.map((file) =>
      uploadMedia({
        file,
        userId,
        conversationId,
      })
    )
  );
}