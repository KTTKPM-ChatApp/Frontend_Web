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
export interface ConversationMemberDto {
  userId: string;
  username?: string;
  displayName?: string;
  fullName?: string;
  nickname?: string;
  avatarUrl?: string | null;
  role: string;
}

export interface ConversationDto {
  id: string;
  name: string;
  title?: string;
  avatarUrl?: string | null;
  type:  string;
  memberCount?: number;
  unreadCount: number;
  isMuted?: boolean;
  isPinned?: boolean;
  pinnedAt?: string | number | null;
  lastMessage?: ConversationLastMessageDto | null ;
  lastMessageAt?: string | number | null;
  createdAt?: string | null;
  members?: ConversationMemberDto[];
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
  id?: string;
  key: string;
  type: "image" | "video" | "document" | "file" | "audio";
  name: string;
  size: number;
  contentType: string;
  thumbnailKey?: string;
  url?: string;
  thumbnailUrl?: string;
  publicId?: string;
  resourceType?: "image" | "video" | "raw";
  width?: number;
  height?: number;
  duration?: number;
}

export interface MessageReplyPreview {
  messageId: string;
  senderId: string;
  senderName?: string;
  body: string;
  attachments: AttachmentDto[];
  isDeleted?: boolean;
}

export interface IMessageReplyPreview extends MessageReplyPreview {}

export enum SystemEventType {
  MEMBER_ADDED = "MEMBER_ADDED",
  MEMBER_REMOVED = "MEMBER_REMOVED",
  MEMBER_LEFT = "MEMBER_LEFT",
  ROLE_CHANGED = "ROLE_CHANGED",
  OWNER_TRANSFERRED = "OWNER_TRANSFERRED",
  GROUP_DISBANDED = "GROUP_DISBANDED",
}

export interface SystemMemberMetadata {
  userId?: string;
  username?: string;
  displayName?: string;
  fullName?: string;
  members?: SystemMemberMetadata[];
  actorName?: string;
  targetName?: string;
  role?: string;
  full_name?: string;
  user_name?: string;
  added_by_name?: string;
  added_members?: SystemMemberMetadata[];
  removed_by_name?: string;
  removed_user_name?: string;
  previous_owner_name?: string;
  new_owner_name?: string;
  updated_by_name?: string;
  target_user_name?: string;
  new_role?: string;
  disbanded_by_name?: string;
}

export type MemberAddedMetadata = SystemMemberMetadata;
export type MemberRemovedMetadata = SystemMemberMetadata;
export type MemberLeftMetadata = SystemMemberMetadata;
export type RoleChangedMetadata = SystemMemberMetadata;
export type OwnerTransferredMetadata = SystemMemberMetadata;
export type GroupDisbandedMetadata = SystemMemberMetadata;
export interface UiMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  body: string;
  createdAt: number;
  attachments: AttachmentDto[];
  type?: string;
  message_type?: string;
  system_event_type?: SystemEventType | string;
  metadata?: Record<string, unknown>;
  replyTo?: MessageReplyPreview | null;
  replyToMessageId?: string | null;
  editedAt?: number;
  deletedAt?: number;
  isDeleted: boolean;
  isPinned?: boolean;
  pinnedAt?: string | number | null;

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
