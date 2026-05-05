export type AttachmentType = "image" | "document" | "audio" | "video";
export type ReactionType = "like" | "love" | "haha" | "sad" | "angry";

export enum SystemEventType {
  MEMBER_ADDED = "member_added",
  MEMBER_REMOVED = "member_removed",
  MEMBER_LEFT = "member_left",
  ROLE_CHANGED = "role_changed",
  OWNER_TRANSFERRED = "owner_transferred",
  GROUP_DISBANDED = "group_disbanded",
  MESSAGE_PINNED = "message_pinned",
  MESSAGE_UNPINNED = "message_unpinned",
}
export interface MessagePinnedMetadata {
  pinned_by: string;
  pinned_by_name: string;
  message_id: string;
  preview_text?: string;
}

export interface MessageUnpinnedMetadata {
  unpinned_by: string;
  unpinned_by_name: string;
  message_id?: string;
  preview_text?: string;
}
export interface MemberAddedMetadata {
  added_by: string;
  added_by_name: string;
  added_members: Array<{
    user_id: string;
    full_name: string;
  }>;
}

export interface MemberRemovedMetadata {
  removed_by: string;
  removed_by_name: string;
  removed_user_id: string;
  removed_user_name: string;
}

export interface MemberLeftMetadata {
  user_id: string;
  user_name: string;
}

export interface RoleChangedMetadata {
  updated_by: string;
  updated_by_name: string;
  target_user_id: string;
  target_user_name: string;
  previous_role: string;
  new_role: string;
}

export interface OwnerTransferredMetadata {
  previous_owner_id: string;
  previous_owner_name: string;
  new_owner_id: string;
  new_owner_name: string;
}

export interface GroupDisbandedMetadata {
  disbanded_by: string;
  disbanded_by_name: string;
}

export type SystemMessageMetadata =
  | MemberAddedMetadata
  | MemberRemovedMetadata
  | MemberLeftMetadata
  | RoleChangedMetadata
  | OwnerTransferredMetadata
  | GroupDisbandedMetadata
  | MessagePinnedMetadata
  | MessageUnpinnedMetadata;

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
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  role: "owner" | "admin" | "member";
  nickname: string | null;
  joinedAt: string;
}

export interface ConversationDto {
  id: string;
  type: "direct" | "group";
  title: string | null;
  avatarUrl: string | null;
  createdById: string;
  lastMessage?: ConversationLastMessageDto | null;
  members?: ConversationMemberDto[];
  memberCount: number;
  isPinned?: boolean;
  pinnedAt?: number | null;
  unreadCount?: number;
  mySettings?: {
    role: "owner" | "admin" | "member";
    nickname: string | null;
    isMuted: boolean;
    isPinned: boolean;
    pinnedAt: string | null;
    lastReadAt: string | null;
  };
  createdAt: string;
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
export interface IMessageReplyPreview {
  messageId: string;
  senderId: string;
  body: string;
  attachments?: any[];
  isDeleted?: boolean;
}
export interface UiMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: number;
  attachments: any[];
  type?: "text" | "system";
  message_type?: "user" | "system";
  systemAction?: SystemEventType;
  system_event_type?: SystemEventType;
  metadata?: SystemMessageMetadata;
  replyTo?: IMessageReplyPreview | null;
  replyToMessageId?: string | null;

  editedAt?: number | null;
  deletedAt?: number | null;
  isDeleted?: boolean;
  pending?: boolean;
  failed?: boolean;

  isPinned?: boolean;
  pinnedAt?: number | null;
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

  typingUsersByConversation: Record<string, any[]>;

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
  updateTypingUsers: (conversationId: string, users: any[]) => void;
}