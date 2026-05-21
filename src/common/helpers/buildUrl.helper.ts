export const buildPublicFileUrl = (key?: string | null) => {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  return key;
};