export const MEDIA_FILE_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_FILE_BASE_URL || "http://54.179.206.215:5000";

export const resolveMediaUrl = (key?: string | null): string => {
  if (!key) return "";

  if (/^https?:\/\//i.test(key)) return key;

  const cleanBase = MEDIA_FILE_BASE_URL.replace(/\/+$/, "");
  const cleanKey = key.replace(/^\/+/, "");

  return `${cleanBase}/${cleanKey}`;
};