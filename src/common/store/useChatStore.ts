import { create } from "zustand";
import type {
  AttachmentDto,
  ConversationDto,
  ConversationListMeta,
  UiMessage,
} from "@/src/common/interface/chat-interface";
// import { patchConversationLastMessage, updateConversationLastMessage } from "../helpers/chat.helpers";
import { moveConversationToTopWithLastMessage } from "../action/chat.action";
import { chatService } from "../service/chat-service";

type PaginationState = {
  nextCursor: string | null;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
};

type MessageMap = Record<string, UiMessage[]>;
type PaginationMap = Record<string, PaginationState>;
type AttachmentMap = Record<string, AttachmentDto[]>;
type LinkMap = Record<string, string[]>;

export interface TypingUser {
  userId: string;
  displayName?: string;
}

export interface ChatState {
  initialized: boolean;
  socketConnected: boolean;
  activeConversationId: string | null;
  currentUserId: string | null;
  error: string | null;

  messagesByConversation: MessageMap;
  paginationByConversation: PaginationMap;

  listConversation: ConversationDto[];
  conversationMeta: ConversationListMeta | null;
  conversationDetailById: Record<string, ConversationDto>;
  conversationLoading: boolean;
  conversationFetched: boolean;
  pinnedMessagesByConversation: Record<string, UiMessage[]>;

  typingUsersByConversation: Record<string, TypingUser[]>;
  onlineUserIds: string[];

  heartbeatId: ReturnType<typeof setInterval> | null;
  mediaByConversation: AttachmentMap;
  filesByConversation: AttachmentMap;
  linksByConversation: LinkMap;
}

export interface ChatSetters {
  setInitialized: (value: boolean) => void;
  setSocketConnected: (value: boolean) => void;
  setActiveConversationId: (value: string | null) => void;
  setCurrentUserId: (value: string | null) => void;
  setError: (value: string | null) => void;

  setListConversation: (items: ConversationDto[]) => void;
  setConversationMeta: (meta: ConversationListMeta | null) => void;
  setConversationDetail: (conversationId: string, detail: ConversationDto) => void;
  setConversationLoading: (value: boolean) => void;
  setConversationFetched: (value: boolean) => void;
  setHeartbeatId: (value: ReturnType<typeof setInterval> | null) => void;

  setPinnedMessages: (conversationId: string, messages: any[]) => void;
  setMessages: (conversationId: string, messages: UiMessage[]) => void;
  appendMessages: (
    conversationId: string,
    messages: UiMessage[],
    moveToTop?: boolean
  ) => void;
  prependMessages: (conversationId: string, messages: UiMessage[]) => void;
  appendRealtimeMessage: (conversationId: string, message: UiMessage) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<UiMessage>) => void;
  upsertConversationToTop: (conversation: ConversationDto) => void;
  removeConversationLocally: (conversationId: string) => void;
  updateConversationPinStatus: (conversationId: string, isPinned: boolean, pinnedAt?: string | number | null) => void;
  addPinnedMessage: (conversationId: string, message: UiMessage | string) => void;
  removePinnedMessage: (conversationId: string, messageId: string) => void;
  isMessagePinned: (conversationId: string, messageId: string) => boolean;
  fetchConversationDetail: (conversationId: string, force?: boolean) => Promise<ConversationDto | null>;

  setPagination: (
    conversationId: string,
    value: Partial<PaginationState>
  ) => void;

  setMediaByConversation: (
    conversationId: string,
    items: AttachmentDto[]
  ) => void;
  setFilesByConversation: (
    conversationId: string,
    items: AttachmentDto[]
  ) => void;
  setLinksByConversation: (
    conversationId: string,
    items: string[]
  ) => void;

  setTypingUsers: (conversationId: string, users: TypingUser[]) => void;
  setOnlineUserIds: (ids: string[]) => void;

  fetchListConversation: (params?: { page?: number; limit?: number }) => Promise<void>;
  resetChatState: () => void;
}

export type ChatStore = ChatState & ChatSetters;

export const initialChatState: ChatState = {
  initialized: false,
  socketConnected: false,
  activeConversationId: null,
  currentUserId: null,
  error: null,

  messagesByConversation: {},
  paginationByConversation: {},

  listConversation: [],
  conversationMeta: null,
  conversationDetailById: {},
  conversationLoading: false,
  conversationFetched: false,
  pinnedMessagesByConversation: {},

  typingUsersByConversation: {},
  onlineUserIds: [],

  heartbeatId: null,
  mediaByConversation: {},
  filesByConversation: {},
  linksByConversation: {},
};

export const useChatStore = create<ChatStore>((set, get) => ({
  ...initialChatState,

  setInitialized: (value) => set({ initialized: value }),
  setSocketConnected: (value) => set({ socketConnected: value }),
  setActiveConversationId: (value) => set({ activeConversationId: value }),
  setCurrentUserId: (value) => set({ currentUserId: value }),
  setError: (value) => set({ error: value }),

  setPinnedMessages: (conversationId, messages) =>
    set((state) => ({
      pinnedMessagesByConversation: {
        ...state.pinnedMessagesByConversation,
        [conversationId]: messages,
      },
    })),

  setListConversation: (items) =>
    set({
      listConversation: items,
      conversationFetched: true,
    }),

  setConversationMeta: (meta) => set({ conversationMeta: meta }),
  setConversationDetail: (conversationId, detail) =>
    set((state) => ({
      conversationDetailById: {
        ...state.conversationDetailById,
        [conversationId]: detail,
      },
    })),
  setConversationLoading: (value) => set({ conversationLoading: value }),
  setConversationFetched: (value) => set({ conversationFetched: value }),
  setHeartbeatId: (value) => set({ heartbeatId: value }),

  setMessages: (conversationId: string, messages: UiMessage[]) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    })),

  appendRealtimeMessage: (conversationId: string, message: UiMessage) =>
    set((state) => {
      const prevMessages = state.messagesByConversation[conversationId] || [];

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...prevMessages, message],
        },
        listConversation: moveConversationToTopWithLastMessage(
          state.listConversation,
          conversationId,
          message
        ),
      };
    }),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] || []).map((msg) =>
          msg.messageId === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  upsertConversationToTop: (conversation) =>
    set((state) => {
      const withoutCurrent = state.listConversation.filter((item) => item.id !== conversation.id);
      return { listConversation: [conversation, ...withoutCurrent] };
    }),

  removeConversationLocally: (conversationId) =>
    set((state) => {
      const { [conversationId]: _messages, ...messagesByConversation } = state.messagesByConversation;
      const { [conversationId]: _pagination, ...paginationByConversation } = state.paginationByConversation;
      const { [conversationId]: _detail, ...conversationDetailById } = state.conversationDetailById;
      return {
        listConversation: state.listConversation.filter((item) => item.id !== conversationId),
        messagesByConversation,
        paginationByConversation,
        conversationDetailById,
        activeConversationId:
          state.activeConversationId === conversationId ? null : state.activeConversationId,
      };
    }),

  updateConversationPinStatus: (conversationId, isPinned, pinnedAt = isPinned ? Date.now() : null) =>
    set((state) => ({
      listConversation: state.listConversation.map((item) =>
        item.id === conversationId ? { ...item, isPinned, pinnedAt } : item
      ),
    })),

  addPinnedMessage: (conversationId, message) =>
    set((state) => {
      const prev = state.pinnedMessagesByConversation[conversationId] || [];
      const nextMessage =
        typeof message === "string"
          ? state.messagesByConversation[conversationId]?.find((item) => item.messageId === message)
          : message;
      if (!nextMessage || prev.some((item) => item.messageId === nextMessage.messageId)) return state;
      return {
        pinnedMessagesByConversation: {
          ...state.pinnedMessagesByConversation,
          [conversationId]: [{ ...nextMessage, isPinned: true, pinnedAt: nextMessage.pinnedAt ?? Date.now() }, ...prev],
        },
      };
    }),

  removePinnedMessage: (conversationId, messageId) =>
    set((state) => ({
      pinnedMessagesByConversation: {
        ...state.pinnedMessagesByConversation,
        [conversationId]: (state.pinnedMessagesByConversation[conversationId] || []).filter(
          (item) => item.messageId !== messageId
        ),
      },
    })),

  clearAllPinnedMessages: () =>
    set((state) => ({
      pinnedMessagesByConversation: {},
    })),

  isMessagePinned: (conversationId, messageId) => {
    const state = get();
    return Boolean(
      state.pinnedMessagesByConversation[conversationId]?.some((item) => item.messageId === messageId) ||
      state.messagesByConversation[conversationId]?.some((item) => item.messageId === messageId && item.isPinned)
    );
  },

  fetchConversationDetail: async (conversationId, force = false) => {
    const current = get().conversationDetailById[conversationId];
    if (current && !force) return current;
    const res = await chatService.fetchConversationById(conversationId);
    const payload = res.payload as { data?: ConversationDto } | ConversationDto;
    const detail = "data" in payload && payload.data ? payload.data : (payload as ConversationDto);
    if (detail?.id) {
      get().setConversationDetail(conversationId, detail);
      return detail;
    }
    return null;
  },

  prependMessages: (conversationId: string, messages: UiMessage[]) =>
    set((state) => {
      const prevMessages = state.messagesByConversation[conversationId] || [];

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...messages, ...prevMessages],
        },
      };
    }),

  appendMessages: (
    conversationId: string,
    messages: UiMessage[],
    moveToTop: boolean = false
  ) =>
    set((state) => {
      const prevMessages = state.messagesByConversation[conversationId] || [];
      const mergedMessages = [...prevMessages, ...messages];
      const latestMessage = mergedMessages[mergedMessages.length - 1];

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: mergedMessages,
        },
        listConversation: latestMessage
          ? moveToTop
            ? moveConversationToTopWithLastMessage(
                state.listConversation,
                conversationId,
                latestMessage
              )
            : state.listConversation
          : state.listConversation,
      };
    }),

  setPagination: (conversationId, value) =>
    set((state) => ({
      paginationByConversation: {
        ...state.paginationByConversation,
        [conversationId]: {
          nextCursor:
            state.paginationByConversation[conversationId]?.nextCursor ?? null,
          hasMore:
            state.paginationByConversation[conversationId]?.hasMore ?? false,
          loading:
            state.paginationByConversation[conversationId]?.loading ?? false,
          loadingMore:
            state.paginationByConversation[conversationId]?.loadingMore ?? false,
          ...value,
        },
      },
    })),

  setMediaByConversation: (conversationId, items) =>
    set((state) => ({
      mediaByConversation: {
        ...state.mediaByConversation,
        [conversationId]: items,
      },
    })),

  setFilesByConversation: (conversationId, items) =>
    set((state) => ({
      filesByConversation: {
        ...state.filesByConversation,
        [conversationId]: items,
      },
    })),

  setLinksByConversation: (conversationId, items) =>
    set((state) => ({
      linksByConversation: {
        ...state.linksByConversation,
        [conversationId]: items,
      },
    })),

  setTypingUsers: (conversationId, users) =>
    set((state) => ({
      typingUsersByConversation: {
        ...state.typingUsersByConversation,
        [conversationId]: users,
      },
    })),

  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),

  fetchListConversation: async (params = { page: 1, limit: 10 }) => {
    const { conversationLoading } = get();
    if (conversationLoading) return;

    try {
      set({
        conversationLoading: true,
        error: null,
      });

      const res = await chatService.fetchListConversations(params);

      set({
        listConversation: res?.payload?.data ?? [],
        conversationMeta: res?.payload?.meta ?? null,
        conversationFetched: true,
      });
    } catch (error: any) {
      set({
        error: error?.message || "Không thể tải danh sách cuộc trò chuyện",
        conversationFetched: true,
      });
    } finally {
      set({
        conversationLoading: false,
      });
    }
  },

  resetChatState: () => set(initialChatState),
}));
