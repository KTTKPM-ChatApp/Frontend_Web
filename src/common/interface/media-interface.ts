export type MediaVisibility = "public" | "private";
export type AttachmentType = "image" | "video" | "audio" | "document";
export interface UploadMediaParams {
    file: File;
    userId: string;
    conversationId?: string;
}

export interface IUploadedMedia {
    key: string;
    url?: string | null;
    visibility: MediaVisibility;
    thumbnailKey?: string;
    contentType: string;
    fileName: string;
    size: number;
    type: AttachmentType;
}

export interface ChatAttachmentPayload {
    key: string;
    url?: string | null;
    type: "image" | "video" | "audio" | "document";
    name: string;
    size: number;
    content_type: string;
    thumbnail_key?: string;
    thumbnailUrl?: string | null;
    visibility: "public" | "private";
}
