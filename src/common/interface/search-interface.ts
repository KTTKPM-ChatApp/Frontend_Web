import { ConversationDto } from "./chat-interface";

export interface IUserSearchItem {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  friendshipStatus: "none" | "pending" | "friend" | string;
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
        displayName: string;
        avatarUrl?: string | null;
        phone: string | null;
        friendshipStatus: string;
        user: IUserSearchItem;
    };