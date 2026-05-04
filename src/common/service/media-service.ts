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

    // 1) presign
    const presignRes = await fetch(`${MEDIA_BASE_URL}/api/media/presign/upload`, {
      method: "POST",
      headers: authHeaders,
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

    // 2) upload lên S3
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    const uploadText = await uploadRes.text().catch(() => "");

    if (!uploadRes.ok) {
      throw new Error(uploadText || "Upload file lên S3 thất bại");
    }

    // 3) confirm
    const confirmRes = await fetch(`${MEDIA_BASE_URL}/api/media/upload/confirm`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        key,
        contentType: file.type,
      }),
    });

    if (!confirmRes.ok) {
      const text = await confirmRes.text().catch(() => "");
      throw new Error(text || "Xác nhận upload thất bại");
    }

    const confirmJson = await confirmRes.json();
    const confirmData = confirmJson?.data ?? confirmJson;

    const finalKey = confirmData?.key ?? key;
    return {
      key: confirmData?.key ?? key,
      url: null, // hoặc bỏ hẳn field này nếu interface cho phép
      visibility,
      thumbnailKey: confirmData?.thumbnailKey ?? null,
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