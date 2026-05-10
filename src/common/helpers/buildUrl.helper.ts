export const buildPublicFileUrl = (key?: string | null) => {
  if (!key) return null;

  const baseUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ?? ""
    // "https://zalo-bucket.s3.ca-central-1.amazonaws.com";

  return `${baseUrl.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
};