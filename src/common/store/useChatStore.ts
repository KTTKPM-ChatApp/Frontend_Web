import { create } from "zustand";
import type {
  AttachmentDto,
  ConversationDto,
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
  conversationMeta: any;
  conversationLoading: boolean;
  conversationFetched: boolean;

  pinnedMessagesByConversation: Record<string, any[]>;

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
  setConversationMeta: (meta: any) => void;
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
    set((state : any) => {
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
            // ? updateConversationLastMessage(
            //     state.listConversation,
            //     conversationId,
            //     latestMessage
            //   )
            // : patchConversationLastMessage(
            //     state.listConversation,
            //     conversationId,
            //     latestMessage
            //   )
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