import { IUploadedMedia, UploadMediaParams } from "../interface/media-interface";

export type MediaVisibility = "public" | "private";
export type AttachmentType = "image" | "video" | "audio" | "document";

const getAccessTokenFromLocal = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

function getCloudinaryResourceType(mimeType: string): 'image' | 'video' | 'raw' {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "raw";
}

function getAttachmentType(mimeType: string): AttachmentType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

export async function uploadMedia({
  file,
  userId,
}: UploadMediaParams): Promise<IUploadedMedia> {
  const token = getAccessTokenFromLocal();
  if (!token) {
    throw new Error("Không tìm thấy access token");
  }

  const resourceType = getCloudinaryResourceType(file.type);

  // 1) Lấy signature từ backend
  const signRes = await fetch("/api/media/cloudinary-sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resourceType }),
  });

  if (!signRes.ok) {
    const text = await signRes.text().catch(() => "");
    throw new Error(text || "Không thể lấy chữ ký upload");
  }

  const signJson = await signRes.json();
  const signData = signJson?.data ?? signJson;

  if (!signData.signature || !signData.uploadUrl) {
    throw new Error("Phản hồi chữ ký không hợp lệ");
  }

  // 2) Upload lên Cloudinary qua FormData
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signData.signature);
  formData.append("timestamp", String(signData.timestamp));
  formData.append("api_key", signData.apiKey);
  if (signData.folder) {
    formData.append("folder", signData.folder);
  }

  const uploadRes = await fetch(signData.uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    throw new Error(text || "Upload lên Cloudinary thất bại");
  }

  const result = await uploadRes.json();
  console.log("[uploadMedia] Cloudinary result:", JSON.stringify(result, null, 2));

  if (result.error) {
    throw new Error(result.error.message || "Cloudinary upload error");
  }

  const uploadedUrl = result.secure_url || result.url;
  console.log("[uploadMedia] Uploaded URL:", uploadedUrl);
  console.log("[uploadMedia] Resource type:", resourceType, "Public ID:", result.public_id);

  const finalUrl = resourceType === "raw"
    ? uploadedUrl.replace("/upload/", "/upload/fl_attachment/")
    : uploadedUrl;

  return {
    key: result.public_id,
    url: finalUrl,
    visibility: "public",
    thumbnailKey: resourceType === "video" ? result.secure_url : null,
    contentType: file.type,
    fileName: file.name,
    size: result.bytes || file.size,
    type: getAttachmentType(file.type),
  };
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
