import { ConversationDto } from "./chat-interface";

export interface IUserSearchItem {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string;
  friendshipStatus?: "none" | "pending_sent" | "pending_received" | "friend";
  requestId?: string;
}

export interface IUserSearchResponse {
  data: IUserSearchItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type SearchResult =
  | {
    kind: "conversation";
    id: string;
    name: string;
    avatarUrl?: string | null;
    memberCount?: number;
    conversation: ConversationDto;
  }
  | {
    kind: "user";
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    phone: string;
    friendshipStatus: string;
    user: IUserSearchItem;
  };