export const HIDDEN_BODY = "\u200B";

export const cleanMessageBody = (value?: string) => {
  const cleaned = (value ?? "").replace(/\u200B/g, "").trim();
  
  // Remove filename patterns that might be included by backend (e.g., "1000042359.mp4")
  // This regex matches standalone filenames with extensions like .mp4, .jpg, .png, etc.
  const filenamePattern = /^\s*\d+\.(mp4|mov|avi|mkv|webm|jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|zip|mp3|wav|ogg|m4a)\s*$/i;
  
  if (filenamePattern.test(cleaned)) {
    return "";
  }
  
  return cleaned;
};