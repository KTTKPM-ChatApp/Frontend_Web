export type AttachmentType = "image" | "document" | "audio" | "video";
export type ReactionType = "like" | "love" | "haha" | "sad" | "angry";

type MessageMap = Record<string, UiMessage[]>;
type PaginationMap = Record<string, PaginationState>;
export interface ConversationLastMessageDto {
    id: string;
    content: string;
    createdAt: string | number | null;
    senderId: string;
    senderName: string;
}
export interface ConversationDto {
  id: string;
  name: string;
  avatarUrl?: string | null;
  type:  string;
  memberCount?: number;
  unreadCount: number;
  isMuted?: boolean;
  lastMessage?: ConversationLastMessageDto | null ;
  lastMessageAt?: string | number | null;
  createdAt?: string | null;
}
export interface ConversationListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
export interface ConversationListResponse {
  success: boolean;
  data: ConversationDto[];
  meta: ConversationListMeta;
  timestamp?: string;
}
export interface AttachmentDto {
  key: string;
  type: AttachmentType;
  name: string;
  size: number;
  contentType: string;
  thumbnailKey?: string;
  url?: string;
  thumbnailUrl?: string;
}
export interface UiMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: number;
  attachments: AttachmentDto[];
  replyToMessageId?: string | null;
  editedAt?: number;
  deletedAt?: number;
  isDeleted: boolean;

  pending?: boolean;
  failed?: boolean;

  clientMessageId?: string;
  errorMessage?: string;
}

export interface MessagePageDto {
  items: UiMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PaginationState {
  nextCursor: string | null;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
}

export interface IChat {
  initialized: boolean;
  socketConnected: boolean;
  activeConversationId: string | null;
  currentUserId: string | null;
  error: string | null;

  messagesByConversation: MessageMap;
  paginationByConversation: PaginationMap;
  conversationFetched: boolean
  listConversation: ConversationDto[];
  conversationMeta: ConversationListMeta | null;
  conversationLoading: boolean;

  heartbeatId: ReturnType<typeof setInterval> | null;
  mediaByConversation: Record<string, AttachmentDto[]>;
  filesByConversation: Record<string, AttachmentDto[]>;
  linksByConversation: Record<string, string[]>;

  rebuildConversationDerivedData: (conversationId: string) => void;
  appendMessageDerivedData: (message: UiMessage) => void;
  clearConversationDerivedData: (conversationId: string) => void;
  setListConversation: (items: ConversationDto[]) => void;
  fetchListConversation: (params?: { page?: number; limit?: number }) => Promise<void>;

  openMockConversation: (conversationId: string) => void;
  initChat: (accessToken: string, currentUserId: string) => void;
  openConversation: (conversationId: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    body: string,
    attachments?: AttachmentDto[]
  ) => void;
  editMessage: (conversationId: string, messageId: string, newBody: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  cleanupChat: () => void;
}