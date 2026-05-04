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
  try {
    const token = getAccessTokenFromLocal();
    if (!token) {
      throw new Error("Không tìm thấy access token trong localStorage");
    }

    // STEP 1: presign upload
    // không truyền userId
    const presignRes = await fetch(`${MEDIA_BASE_URL}/api/media/presign/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contentType: file.type,
        fileName: file.name,
      }),
    });

    if (!presignRes.ok) {
      const text = await presignRes.text().catch(() => "");
      throw new Error(text || "Không lấy được presigned upload URL");
    }

    const presignJson = await presignRes.json();
    const presignData = presignJson?.data ?? presignJson;

    const key = presignData?.key;
    const uploadUrl = presignData?.uploadUrl;
    const visibility: MediaVisibility =
      presignData?.visibility === "private" ? "private" : "public";

    if (!key || !uploadUrl) {
      throw new Error("Presign response thiếu key hoặc uploadUrl");
    }

    // STEP 2: upload binary lên S3
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => "");
      throw new Error(text || `S3 upload failed (${uploadRes.status})`);
    }

    // STEP 3: confirm upload
    const confirmBody: Record<string, string> = {
      key,
      contentType: file.type,
    };

    if (conversationId) {
      confirmBody.conversationId = conversationId;
    }

    const confirmRes = await fetch(`${MEDIA_BASE_URL}/api/media/upload/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(confirmBody),
    });

    if (!confirmRes.ok) {
      const text = await confirmRes.text().catch(() => "");
      throw new Error(text || "Xác nhận upload thất bại");
    }

    const confirmJson = await confirmRes.json();
    const confirmData = confirmJson?.data ?? confirmJson;

    return {
      key: confirmData?.key ?? key,
      url: confirmData?.url ?? null,
      visibility,
      thumbnailKey: confirmData?.thumbnailKey ?? undefined,
      contentType: file.type,
      fileName: file.name,
      size: file.size,
      type: getAttachmentType(file.type),
    };
  } catch (error) {
    console.error("uploadChatMedia error:", error);
    throw error;
  }
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