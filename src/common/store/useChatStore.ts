import { create } from "zustand";
import type {
  AttachmentDto,
  ConversationDto,
  UiMessage,
} from "@/src/common/interface/chat-interface";
import { moveConversationToTopWithLastMessage } from "../helpers/conversationHelpers";
import { chatService } from "../service/chat-service";
import { sortConversations } from "../helpers/sortConservation";

type PaginationState = {
  nextCursor: string | null;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
};

type MessageMap = Record<string, UiMessage[]>;
type PaginationMap = Record<string, PaginationState>;
type AttachmentMap = Record<string, AttachmentDto[]>;
type ConversationDetailMap = Record<string, ConversationDto>;
type LinkMap = Record<string, string[]>;

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
  conversationDetailById: ConversationDetailMap;
  conversationDetailLoadingById: Record<string, boolean>;

  heartbeatId: ReturnType<typeof setInterval> | null;
  mediaByConversation: AttachmentMap;
  filesByConversation: AttachmentMap;
  linksByConversation: LinkMap;

  typingUsersByConversation: Record<string, any[]>;
  pinnedMessagesByConversation: Record<string, Set<string>>;
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
  setConversationDetail: (conversationId: string, conversation: ConversationDto) => void;
  fetchConversationDetail: (conversationId: string, force?: boolean) => Promise<void>;

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
  deleteMessage: (conversationId: string, messageId: string, createdAt: number) => void
  removeConversationLocally: (conversationId: string) => void;
  fetchListConversation: (params?: { page?: number; limit?: number }) => Promise<void>;
  upsertConversationToTop: (conversation: ConversationDto) => void;
  resetChatState: () => void;
  updateTypingUsers: (conversationId: string, users: any[]) => void;
  updateConversationPinStatus: (
    conversationId: string,
    isPinned: boolean
  ) => void;
  addPinnedMessage: (conversationId: string, messageId: string) => void;
  removePinnedMessage: (conversationId: string, messageId: string) => void;
  isMessagePinned: (conversationId: string, messageId: string) => boolean;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<UiMessage>) => void;
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

  conversationDetailById: {},
  conversationDetailLoadingById: {},

  heartbeatId: null,
  mediaByConversation: {},
  filesByConversation: {},
  linksByConversation: {},
  typingUsersByConversation: {},
  pinnedMessagesByConversation: {},
};

export const useChatStore = create<ChatStore>((set, get) => ({
  ...initialChatState,

  setInitialized: (value) => set({ initialized: value }),
  setSocketConnected: (value) => set({ socketConnected: value }),
  setActiveConversationId: (value) => set({ activeConversationId: value }),
  setCurrentUserId: (value) => set({ currentUserId: value }),
  setError: (value) => set({ error: value }),

  setListConversation: (items) =>
    set({
      listConversation: sortConversations(items),
      conversationFetched: true,
    }),
  setConversationDetail: (conversationId, conversation) =>
    set((state) => ({
      conversationDetailById: {
        ...state.conversationDetailById,
        [conversationId]: conversation,
      },
      conversationDetailLoadingById: {
        ...state.conversationDetailLoadingById,
        [conversationId]: false,
      },
    })),

  fetchConversationDetail: async (conversationId: string, force = false) => {
    if (!conversationId) return;

    const cached = get().conversationDetailById[conversationId];
    const loading = get().conversationDetailLoadingById[conversationId];

    if (!force && cached) return;
    if (loading) return;

    try {
      set((state) => ({
        conversationDetailLoadingById: {
          ...state.conversationDetailLoadingById,
          [conversationId]: true,
        },
      }));

      const res = await chatService.fetchConversationById(conversationId);
      const conversation = res?.payload?.data;

      if (!conversation) return;

      set((state) => ({
        conversationDetailById: {
          ...state.conversationDetailById,
          [conversationId]: conversation,
        },
        conversationDetailLoadingById: {
          ...state.conversationDetailLoadingById,
          [conversationId]: false,
        },
      }));
    } catch (error: any) {
      set((state) => ({
        conversationDetailLoadingById: {
          ...state.conversationDetailLoadingById,
          [conversationId]: false,
        },
        error: error?.message || "Không thể tải chi tiết cuộc trò chuyện",
      }));
    }
  },

  upsertConversationToTop: (conversation) =>
    set((state) => {
      const filtered = state.listConversation.filter(
        (item) => item.id !== conversation.id
      );

      return {
        listConversation: sortConversations([conversation, ...filtered]),
        conversationFetched: true,
      };
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
    set((state) => {
      const prevMessages = state.messagesByConversation[conversationId] || [];
      const mergedMessages = [...prevMessages, ...messages];
      const latestMessage = mergedMessages[mergedMessages.length - 1];

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: mergedMessages,
        },
        listConversation:
          moveToTop && latestMessage
            ? moveConversationToTopWithLastMessage(
              state.listConversation,
              conversationId,
              latestMessage
            )
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
        listConversation: sortConversations(res?.payload?.data ?? []),
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

  deleteMessage: (conversationId: string, messageId: string, createdAt: number) => {
    const state = get();
    const messages = state.messagesByConversation[conversationId] || [];
    
    const applyDeletedMessage = (
      messages: UiMessage[],
      messageId: string,
      deletedAt: number
    ): UiMessage[] => {
      return messages.map((msg): UiMessage => {
        const isTargetMessage = msg.messageId === messageId;
        const replyTo = msg.replyTo;
        const isReplyToTarget = replyTo?.messageId === messageId;

        if (!isTargetMessage && !isReplyToTarget) return msg;

        return {
          ...msg,
          ...(isTargetMessage
            ? {
                body: "",
                isDeleted: true,
                deletedAt,
                attachments: [],
                pending: false,
                failed: false,
              }
            : {}),
          ...(replyTo && isReplyToTarget
            ? {
                replyTo: {
                  ...replyTo,
                  messageId: replyTo.messageId,
                  senderId: replyTo.senderId,
                  body: "",
                  attachments: [],
                  isDeleted: true,
                },
              }
            : {}),
        };
      });
    };

    const patchConversationPreviewWhenDeleted = (
      conversations: ConversationDto[],
      conversationId: string,
      messageId: string
    ): ConversationDto[] => {
      return conversations.map((cvs) => {
        if (cvs.id !== conversationId) return cvs;

        const lastMessage = cvs.lastMessage;
        if (!lastMessage || lastMessage.id !== messageId) return cvs;

        return {
          ...cvs,
          lastMessage: {
            ...lastMessage,
            content: "Tin nhắn đã được thu hồi",
          },
          lastMessageAt: Date.now(),
        };
      });
    };

    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: applyDeletedMessage(
          state.messagesByConversation[conversationId] || [],
          messageId,
          Date.now()
        ),
      },
      listConversation: patchConversationPreviewWhenDeleted(
        state.listConversation,
        conversationId,
        messageId
      ),
    }));
  },
  removeConversationLocally: (conversationId: string) =>
    set((state) => {
      const nextMessages = { ...state.messagesByConversation };
      delete nextMessages[conversationId];

      const nextPagination = { ...state.paginationByConversation };
      delete nextPagination[conversationId];

      const nextMedia = { ...state.mediaByConversation };
      delete nextMedia[conversationId];

      const nextFiles = { ...state.filesByConversation };
      delete nextFiles[conversationId];

      const nextLinks = { ...state.linksByConversation };
      delete nextLinks[conversationId];

      const nextConversationDetail = { ...state.conversationDetailById };
      delete nextConversationDetail[conversationId];

      const nextConversationDetailLoading = { ...state.conversationDetailLoadingById };
      delete nextConversationDetailLoading[conversationId];

      return {
        listConversation: state.listConversation.filter(
          (item) => item.id !== conversationId
        ),
        messagesByConversation: nextMessages,
        paginationByConversation: nextPagination,
        mediaByConversation: nextMedia,
        filesByConversation: nextFiles,
        linksByConversation: nextLinks,
        conversationDetailById: nextConversationDetail,
        conversationDetailLoadingById: nextConversationDetailLoading,
        activeConversationId:
          state.activeConversationId === conversationId
            ? null
            : state.activeConversationId,
      };
    }),
  resetChatState: () => set(initialChatState),
  updateConversationPinStatus: (conversationId, isPinned) =>
    set((state) => {
      const nextList = state.listConversation.map((item) =>
        item.id === conversationId
          ? {
            ...item,
            isPinned,
            pinnedAt: isPinned ? Date.now() : null,
          }
          : item
      );

      return {
        listConversation: sortConversations(nextList),
      };
    }),
  updateTypingUsers: (conversationId: string, users: any[]) =>
    set((state) => ({
      typingUsersByConversation: {
        ...state.typingUsersByConversation,
        [conversationId]: users,
      },
    })),

  addPinnedMessage: (conversationId: string, messageId: string) =>
    set((state) => {
      const pinnedSet = state.pinnedMessagesByConversation[conversationId] || new Set();
      const newPinnedSet = new Set(pinnedSet);
      newPinnedSet.add(messageId);
      
      return {
        pinnedMessagesByConversation: {
          ...state.pinnedMessagesByConversation,
          [conversationId]: newPinnedSet,
        },
      };
    }),

  removePinnedMessage: (conversationId: string, messageId: string) =>
    set((state) => {
      const pinnedSet = state.pinnedMessagesByConversation[conversationId] || new Set();
      const newPinnedSet = new Set(pinnedSet);
      newPinnedSet.delete(messageId);
      
      return {
        pinnedMessagesByConversation: {
          ...state.pinnedMessagesByConversation,
          [conversationId]: newPinnedSet,
        },
      };
    }),

  isMessagePinned: (conversationId: string, messageId: string) => {
    const pinnedSet = get().pinnedMessagesByConversation[conversationId];
    return pinnedSet ? pinnedSet.has(messageId) : false;
  },

  updateMessage: (conversationId: string, messageId: string, updates: Partial<UiMessage>) =>
    set((state) => {
      const messages = state.messagesByConversation[conversationId] || [];
      const updatedMessages = messages.map((msg) =>
        msg.messageId === messageId ? { ...msg, ...updates } : msg
      );
      
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: updatedMessages,
        },
      };
    }),
}));