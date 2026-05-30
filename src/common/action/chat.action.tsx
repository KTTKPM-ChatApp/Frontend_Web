import { buildDerivedDataFromMessages, dedupeByMessageId, extractFilesFromMessage, extractLinksFromMessage, extractMediaFromMessage, normalizeMessage, uniqAttachments, uniqStrings, upsertIncomingMessage } from "../helpers/chat.helpers";
import { buildChatAttachmentsPayload } from "../helpers/chatAttachment.helpers";
import { cleanMessageBody, HIDDEN_BODY } from "../helpers/cleanBodyMedia";
import { sortConversations } from "../helpers/sortConservation";
import { ConversationDto, ConversationLastMessageDto, ReactionDto, UiMessage } from "../interface/chat-interface";
import { ChatAttachmentPayload, IUploadedMedia } from "../interface/media-interface";
import { chatService } from "../service/chat-service";
import { connectSocket, disconnectSocket, getSocket, sendSocketMessage, subscribeToConversation, unsubscribeFromConversation } from "../socket/socket";
import { useChatStore } from "../store/useChatStore";
import { usePresenceStore } from "../store/usePresenceStore";
import http from "../api/http";
import { toast } from "react-toastify";

// Registry for window event listeners so cleanupChat can remove them
const _windowListeners: Array<{ event: string; handler: any }> = [];

const _registerWindowListener = (event: string, handler: any) => {
  _windowListeners.push({ event, handler });
  window.addEventListener(event, handler);
};

const _removeAllWindowListeners = () => {
  for (const { event, handler } of _windowListeners) {
    window.removeEventListener(event, handler);
  }
  _windowListeners.length = 0;
};

let _syncListTimer: ReturnType<typeof setTimeout> | null = null;
const _scheduleListSync = () => {
  if (_syncListTimer) clearTimeout(_syncListTimer);
  _syncListTimer = setTimeout(() => {
    _syncListTimer = null;
    fetchListConversation({ page: 1, limit: 20 });
  }, 500);
};

const MESSAGE_SEND_WINDOW_MS = 5 * 1000;
const MESSAGE_SEND_MAX = 3;
const messageSendTimestamps: number[] = [];

const canSendMessageNow = () => {
  const now = Date.now();
  while (messageSendTimestamps.length > 0 && now - messageSendTimestamps[0] > MESSAGE_SEND_WINDOW_MS) {
    messageSendTimestamps.shift();
  }

  if (messageSendTimestamps.length >= MESSAGE_SEND_MAX) {
    return false;
  }

  messageSendTimestamps.push(now);
  return true;
};

export const rebuildConversationDerivedData = (conversationId: string) => {
  const state = useChatStore.getState();
  const messages = state.messagesByConversation[conversationId] || [];
  const derived = buildDerivedDataFromMessages(messages);

  state.setMediaByConversation(conversationId, derived.media);
  state.setFilesByConversation(conversationId, derived.files);
  state.setLinksByConversation(conversationId, derived.links);
};

export const appendMessageDerivedData = (message: any) => {
  const state = useChatStore.getState();
  const msg = normalizeMessage(message);
  const conversationId = msg.conversationId;

  if (!conversationId || msg.isDeleted) return;

  const nextMedia = extractMediaFromMessage(msg);
  const nextFiles = extractFilesFromMessage(msg);
  const nextLinks = extractLinksFromMessage(msg);

  state.setMediaByConversation(
    conversationId,
    uniqAttachments([
      ...(state.mediaByConversation[conversationId] || []),
      ...nextMedia,
    ])
  );

  state.setFilesByConversation(
    conversationId,
    uniqAttachments([
      ...(state.filesByConversation[conversationId] || []),
      ...nextFiles,
    ])
  );

  state.setLinksByConversation(
    conversationId,
    uniqStrings([
      ...(state.linksByConversation[conversationId] || []),
      ...nextLinks,
    ])
  );
};
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
export const clearConversationDerivedData = (conversationId: string) => {
  const state = useChatStore.getState();
  state.setMediaByConversation(conversationId, []);
  state.setFilesByConversation(conversationId, []);
  state.setLinksByConversation(conversationId, []);
};

export const fetchListConversation = async (params: { page?: number; limit?: number } = {}) => {
  const state = useChatStore.getState();

  state.setConversationLoading(true);
  state.setError(null);

  try {
    const res = await chatService.fetchListConversations({
      limit: params.limit ?? 10,
      offset: params.page ? (params.page - 1) * (params.limit ?? 10) : 0,
    } as any);

    const payload = res?.payload as any;
    // Backend returns { data: [], meta: {} }
    const items = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.conversations)
      ? payload.conversations
      : [];
    const meta = payload?.meta ?? null;

    state.setListConversation(sortConversations(items));
    state.setConversationMeta(meta);
    state.setConversationLoading(false);
    state.setConversationFetched(true);
  } catch (err: any) {
    state.setListConversation([]);
    state.setConversationMeta(null);
    state.setConversationLoading(false);
    state.setConversationFetched(true);
    state.setError(err?.message || "Không lấy được danh sách cuộc trò chuyện");
  }
};
const hydrateReplyMessages = (messages: UiMessage[]): UiMessage[] => {
  const messageMap = new Map(messages.map((msg) => [msg.messageId, msg]));

  return messages.map((msg) => {
    if (msg.replyTo || !msg.replyToMessageId) return msg;

    const repliedMessage = messageMap.get(msg.replyToMessageId);
    if (!repliedMessage) return msg;

    return {
      ...msg,
      replyTo: {
        messageId: repliedMessage.messageId,
        senderId: repliedMessage.senderId,
        senderName: repliedMessage.senderName || "Người dùng",
        body: repliedMessage.body ?? "",
        attachments: repliedMessage.attachments ?? [],
        isDeleted: Boolean(repliedMessage.isDeleted),
      },
    };
  });
};
export const initChat = (accessToken: string, currentUserId: string) => {
  if (!accessToken || !currentUserId) return;

  const state = useChatStore.getState();
  const socket = connectSocket(accessToken, currentUserId);

  // Event cleanup is handled by window.removeEventListener in cleanupChat

  const handleDeletedMessage = (raw: any) => {
    const messageId = raw?.message_id ?? raw?.messageId;
    const conversationId = raw?.conversation_id ?? raw?.conversationId;
    const deletedAt = raw?.deleted_at ?? raw?.deletedAt ?? Date.now();

    if (!messageId || !conversationId) return;

    const state = useChatStore.getState();

    useChatStore.setState((prev) => {
      const messages = prev.messagesByConversation[conversationId] || [];
      return {
        messagesByConversation: {
          ...prev.messagesByConversation,
          [conversationId]: applyDeletedMessage(messages, messageId, deletedAt),
        },
        listConversation: patchConversationPreviewWhenDeleted(
          prev.listConversation,
          conversationId,
          messageId,
        ),
      };
    });

    if (state.isMessagePinned(conversationId, messageId)) {
      state.removePinnedMessage(conversationId, messageId);
    }
  };

  const handleSystemMessage = (raw: any) => {
    console.log("[chat:system-message raw full]", raw);
    console.log("[chat:system-message raw json]", JSON.stringify(raw, null, 2));

    const conversationId = raw?.conversation_id ?? raw?.conversationId;
    const messageId = raw?.message_id ?? raw?.messageId;

    if (!conversationId || !messageId) {
      console.log("[chat:system-message] missing ids", raw);
      return;
    }

    const systemMessage: UiMessage = {
      messageId,
      conversationId,
      senderId: raw?.sender_id ?? raw?.senderId ?? "SYSTEM",
      body: raw?.body ?? "",
      createdAt:
        raw?.created_at ??
        raw?.createdAt ??
        raw?.sent_at ??
        Date.now(),
      attachments: [],
      type: "system",
      message_type: raw?.message_type ?? raw?.messageType ?? "system",
      system_event_type: raw?.system_event_type ?? raw?.systemEventType,
      metadata: raw?.metadata ?? undefined,
      replyTo: null,
      replyToMessageId: null,
      isDeleted: false,
      pending: false,
      failed: false,
    };

    console.log("[chat:system-message mapped]", systemMessage);

    useChatStore.setState((state) => {
      const currentMessages =
        state.messagesByConversation[conversationId] || [];

      const nextMessages = upsertIncomingMessage(currentMessages, systemMessage);
      console.log("[systemMessage before upsert]", systemMessage);
      console.log(
        "[systemMessage after upsert]",
        nextMessages.find((m) => m.messageId === systemMessage.messageId)
      );
      const nextConversations = state.listConversation.some(
        (cvs) => cvs.id === conversationId
      )
        ? moveConversationToTopWithLastMessage(
          state.listConversation,
          conversationId,
          systemMessage
        )
        : state.listConversation;

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: nextMessages,
        },
        listConversation: nextConversations,
      };
    });

    const st = useChatStore.getState();
    const currentUserId = st.currentUserId;
    const eventType = systemMessage.system_event_type;

    switch (eventType) {
      case 'MEMBER_ADDED':
      case 'ROLE_CHANGED':
      case 'OWNER_TRANSFERRED':
      case 'CONVERSATION_UPDATED':
        st.fetchConversationDetail(conversationId, true);
        break;
      case 'MEMBER_REMOVED': {
        const removedUserId = systemMessage.metadata?.removed_user_id as string | undefined;
        if (removedUserId && removedUserId === currentUserId) {
          st.removeConversationLocally(conversationId);
        } else {
          st.fetchConversationDetail(conversationId, true);
        }
        break;
      }
      case 'MEMBER_LEFT': {
        const leftUserId = systemMessage.metadata?.user_id as string | undefined;
        if (leftUserId && leftUserId === currentUserId) {
          st.removeConversationLocally(conversationId);
        } else {
          st.fetchConversationDetail(conversationId, true);
        }
        break;
      }
      case 'GROUP_DISBANDED':
        st.removeConversationLocally(conversationId);
        break;
    }

    fetchListConversation({ page: 1, limit: 20 });
  };

  const handlePinnedMessage = async (raw: any) => {
    const conversationId = raw?.conversation_id ?? raw?.conversationId;
    const messageId = raw?.message_id ?? raw?.messageId;
    const pinnedAt = raw?.pinned_at ?? raw?.pinnedAt ?? Date.now();

    if (!conversationId || !messageId) return;

    const state = useChatStore.getState();

    // Update message in local state if loaded
    const messages = state.messagesByConversation[conversationId] || [];
    const messageExists = messages.some((msg) => msg.messageId === messageId);
    
    if (messageExists) {
      state.addPinnedMessage(conversationId, messageId);
      state.updateMessage(conversationId, messageId, {
        isPinned: true,
        pinnedAt,
      });
    } else {
      // Message not in local cache — refresh pinned list from server
      await fetchPinnedMessages(conversationId);
    }
  };

  const handleUnpinnedMessage = async (raw: any) => {
    const conversationId = raw?.conversation_id ?? raw?.conversationId;
    const messageId = raw?.message_id ?? raw?.messageId;

    if (!conversationId || !messageId) return;

    const state = useChatStore.getState();
    const messages = state.messagesByConversation[conversationId] || [];
    const messageExists = messages.some((msg) => msg.messageId === messageId);

    state.removePinnedMessage(conversationId, messageId);
    
    if (messageExists) {
      state.updateMessage(conversationId, messageId, {
        isPinned: false,
        pinnedAt: undefined,
      });
    } else {
      await fetchPinnedMessages(conversationId);
    }
  };

  const handleWindowPinnedMessage = (event: any) => {
    handlePinnedMessage(event.detail);
  };

  const handleWindowUnpinnedMessage = (event: any) => {
    handleUnpinnedMessage(event.detail);
  };

  const handleWindowSystemMessage = (event: any) => {
    handleSystemMessage(event.detail);
  };

  const handleConversationCreated = (event: any) => {
    const data = event.detail;
    const conversationId = data?.conversation_id ?? data?.conversationId;
    const memberIds = data?.member_ids ?? data?.memberIds;
    const currentUserId = useChatStore.getState().currentUserId;
    console.log("[conversation:created CALLED]", { conversationId, memberIds, currentUserId, data });
    if (!conversationId) return;
    if (memberIds && Array.isArray(memberIds) && !memberIds.includes(currentUserId)) return;
    console.log("[conversation:created] New conversation notification:", conversationId);
    fetchListConversation({ page: 1, limit: 20 });
  };

  const handleConversationRemoved = (event: any) => {
    const data = event.detail;
    const conversationId = data?.conversation_id ?? data?.conversationId;
    if (!conversationId) return;
    console.log("[conversation:removed] Conversation removed notification:", conversationId, data);
    unsubscribeFromConversation(conversationId);
    useChatStore.getState().removeConversationLocally(conversationId);
  };

  // Removed legacy socket.on calls because stompClient does not support them.
  // Window event listeners below (chat:new, presence:update, etc.) should handle events now.

  // Remove existing listeners to prevent duplicates
  window.removeEventListener('chat:new', handleWindowIncomingMessage);
  window.removeEventListener('presence:update', handlePresenceUpdate);
  window.removeEventListener('socket:connect', handleSocketConnect);
  window.removeEventListener('socket:error', handleSocketError);
  window.removeEventListener('socket:disconnect', handleSocketDisconnect);
  window.removeEventListener('chat:deleted', handleWindowDeletedMessage);
  window.removeEventListener('chat:pinned', handleWindowPinnedMessage);
  window.removeEventListener('chat:unpinned', handleWindowUnpinnedMessage);
  window.removeEventListener('chat:system-message', handleWindowSystemMessage);
  window.removeEventListener('chat:reaction', handleWindowReactionEvent);
  window.removeEventListener('conversation:created', handleConversationCreated);
  window.removeEventListener('conversation:removed', handleConversationRemoved);

  // Add event listeners for STOMP events dispatched from socket.ts
  window.addEventListener('chat:new', handleWindowIncomingMessage);
  window.addEventListener('presence:update', handlePresenceUpdate);
  window.addEventListener('socket:connect', handleSocketConnect);
  window.addEventListener('socket:error', handleSocketError);
  window.addEventListener('socket:disconnect', handleSocketDisconnect);
  window.addEventListener('chat:deleted', handleWindowDeletedMessage);
  window.addEventListener('chat:pinned', handleWindowPinnedMessage);
  window.addEventListener('chat:unpinned', handleWindowUnpinnedMessage);
  window.addEventListener('chat:system-message', handleWindowSystemMessage);
  window.addEventListener('chat:reaction', handleWindowReactionEvent);
  window.addEventListener('conversation:created', handleConversationCreated);
  window.addEventListener('conversation:removed', handleConversationRemoved);

  // Load initial online users
  http.get<{ success: boolean; data: string[] }>("/api/presence/online").then((res) => {
    if (res?.ok && Array.isArray(res.payload?.data)) {
      state.setOnlineUserIds(res.payload.data);
    }
  }).catch(() => {});

  state.setInitialized(true);
  state.setCurrentUserId(currentUserId);
};

export const openConversation = async (conversationId: string) => {
  const state = useChatStore.getState();
  const socket = getSocket();

  state.setActiveConversationId(conversationId);
  state.setError(null);
  useChatStore.setState((prev) => ({
    listConversation: prev.listConversation.map((item) =>
      item.id === conversationId ? { ...item, unreadCount: 0 } : item
    ),
  }));

  chatService.markConversationAsRead(conversationId).catch(() => {});

  if (socket?.connected) {
    sendSocketMessage("/app/chat/join", { conversation_id: conversationId });
    subscribeToConversation(conversationId);
  }

  state.setPagination(conversationId, {
    loading: true,
    loadingMore: false,
  });

  try {
    const res = await chatService.fetchMessages(conversationId, { limit: 50 });
    const payloadData = (res?.payload as any)?.data;
    const messages = Array.isArray(payloadData?.items) ? payloadData.items : (Array.isArray(payloadData) ? payloadData : []);
    
    const normalizedItems = dedupeByMessageId(messages.map(normalizeMessage));
    const hydratedItems = hydrateReplyMessages(normalizedItems);

    const oldItems =
      useChatStore.getState().messagesByConversation[conversationId] || [];
    const merged = dedupeByMessageId([...oldItems, ...hydratedItems]);

    state.setMessages(conversationId, merged);
    useChatStore.setState((state) => ({
      reactionsByConversation: {
        ...state.reactionsByConversation,
        [conversationId]: {},
      },
    }));

    const hasNext = payloadData?.hasMore ?? false;
    const nextCursor = payloadData?.nextCursor ?? (messages.length > 0 ? messages[messages.length - 1].createdAt : null);

    state.setPagination(conversationId, {
      nextCursor: nextCursor,
      hasMore: hasNext,
      loading: false,
      loadingMore: false,
    });

    rebuildConversationDerivedData(conversationId);
    fetchPinnedMessages(conversationId);
    fetchConversationReactions(conversationId);
  } catch (err: any) {
    state.setError(err?.message || "Không lấy được tin nhắn");
    state.setMessages(conversationId, []);
    state.setPagination(conversationId, {
      nextCursor: null,
      hasMore: false,
      loading: false,
      loadingMore: false,
    });
    clearConversationDerivedData(conversationId);
  }
};
export const loadMoreMessages = async (conversationId: string) => {
  const state = useChatStore.getState();
  const pagination = state.paginationByConversation[conversationId];

  if (
    !pagination?.hasMore ||
    pagination.loadingMore ||
    !pagination.nextCursor
  ) {
    return;
  }

  state.setPagination(conversationId, {
    loadingMore: true,
  });

  try {
    const res = await chatService.fetchMessages(conversationId, {
      before: pagination.nextCursor,
      limit: 50,
    });

    const payloadData = (res?.payload as any)?.data;
    const messagesData = Array.isArray(payloadData?.items) ? payloadData.items : (Array.isArray(payloadData) ? payloadData : []);
    const fetchedMessages = messagesData.map(normalizeMessage);

    const oldMessages = hydrateReplyMessages(
      dedupeByMessageId(fetchedMessages)
    );

    const latestState = useChatStore.getState();
    const currentMessages =
      latestState.messagesByConversation[conversationId] || [];

    const mergedMessages = dedupeByMessageId([
      ...oldMessages,
      ...currentMessages,
    ]);

    const nextCursor = payloadData?.nextCursor ?? (messagesData.length > 0 ? messagesData[messagesData.length - 1].createdAt : null);

    useChatStore.setState((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: mergedMessages,
      },
      paginationByConversation: {
        ...state.paginationByConversation,
        [conversationId]: {
          ...state.paginationByConversation[conversationId],
          nextCursor: nextCursor,
          hasMore: payloadData?.hasMore ?? false,
          loading: false,
          loadingMore: false,
        },
      },
    }));

    rebuildConversationDerivedData(conversationId);
  } catch (err: any) {
    useChatStore.getState().setPagination(conversationId, {
      loadingMore: false,
    });
    useChatStore.getState().setError(
      err?.message || "Không lấy được tin nhắn"
    );
  }
};


export const sendMessageHttp = async (
  conversationId: string,
  body: string,
  attachments: any[] = [],
  replyMessage?: any
) => {
  const state = useChatStore.getState();
  const currentUserId = state.currentUserId;
  const displayBody = cleanMessageBody(body);

  if (!displayBody && attachments.length === 0) {
    state.setError("Nội dung tin nhắn không được để trống");
    return;
  }

  if (!canSendMessageNow()) {
    const message = "Bạn đang gửi tin nhắn quá nhanh. Vui lòng thử lại sau.";
    toast.warning(message, { toastId: "message-rate-limit" });
    state.setError(message);
    return;
  }

  const clientMessageId = crypto.randomUUID();
  const now = Date.now();

  // Optimistic UI - Add message immediately
  const optimisticMessage = normalizeMessage({
    messageId: clientMessageId,
    conversationId,
    senderId: currentUserId,
    body: displayBody,
    attachments,
    createdAt: now,
    pending: true,
    failed: false,
    replyTo: replyMessage
      ? {
          messageId: replyMessage.messageId,
          senderId: replyMessage.senderId,
          body: replyMessage.body ?? "",
          attachments: replyMessage.attachments ?? [],
          isDeleted: Boolean(replyMessage.isDeleted),
        }
      : null,
    replyToMessageId: replyMessage?.messageId ?? null,
  });

  state.appendRealtimeMessage(conversationId, optimisticMessage);
  appendMessageDerivedData(optimisticMessage);
  
  // Send via HTTP API
  try {
    const response = await chatService.sendMessage(conversationId, displayBody, 'TEXT', attachments, replyMessage?.messageId ?? null, clientMessageId);
    
    if (response.ok && response.payload) {
      // Success - Update optimistic message with server data
      const serverMessage = normalizeMessage(response.payload);
      const currentMessages = state.messagesByConversation[conversationId] || [];
      const alreadyDelivered = currentMessages.some(m => m.messageId === serverMessage.messageId);

      if (alreadyDelivered) {
        // STOMP already added the server message (without replyTo).
        // Preserve replyTo from the optimistic message before removing it.
        const optimisticMsg = currentMessages.find(m => m.messageId === clientMessageId);
        state.setMessages(
          conversationId,
          currentMessages.map(m => {
            if (m.messageId === serverMessage.messageId && optimisticMsg?.replyTo && !m.replyTo) {
              return { ...m, replyTo: optimisticMsg.replyTo };
            }
            return m;
          }).filter(m => m.messageId !== clientMessageId)
        );
      } else {
        state.updateMessage(conversationId, clientMessageId, {
          pending: false,
          failed: false,
          messageId: serverMessage.messageId,
          createdAt: serverMessage.createdAt,
        });
      }

      // Update conversation list with last message info
      const conversation = state.listConversation.find(c => c.id === conversationId);
      if (conversation) {
        state.upsertConversationToTop({
          ...conversation,
          lastMessage: {
            id: serverMessage.messageId,
            content: serverMessage.body,
            createdAt: serverMessage.createdAt,
            senderId: serverMessage.senderId,
            senderName: "You", // TODO: Get actual sender name
          },
        });
      }
      
      // Refresh conversation list to ensure UI updates when using HTTP API fallback
      await state.fetchListConversation({ page: 1, limit: 20 });
      
      return serverMessage;
    } else {
      const errorMessage =
        response.statusCode === 429
          ? "Bạn đang gửi tin nhắn quá nhanh. Vui lòng thử lại sau."
          : (response.payload as any)?.message || "Gửi tin nhắn thất bại";

      if (response.statusCode === 429) {
        toast.warning(errorMessage, { toastId: "message-rate-limit" });
      }

      // Mark as failed
      state.setMessages(
        conversationId,
        (state.messagesByConversation[conversationId] || []).map((msg) =>
          msg.messageId === clientMessageId ? { ...msg, pending: false, failed: true } : msg
        )
      );
      state.setError(errorMessage);
    }
  } catch (error) {
    toast.error("Không thể gửi tin nhắn. Vui lòng thử lại sau.", {
      toastId: "message-send-error",
    });

    // Mark as failed
    state.setMessages(
      conversationId,
      (state.messagesByConversation[conversationId] || []).map((msg) =>
        msg.messageId === clientMessageId ? { ...msg, pending: false, failed: true } : msg
      )
    );
    state.setError("Không thể gửi tin nhắn - Lỗi kết nối");
  }
};

export const sendMessage = async (
  conversationId: string,
  body: string,
  attachments: (ChatAttachmentPayload | IUploadedMedia | any)[] = [],
  replyMessage?: UiMessage | null
) => {
  return sendMessageHttp(conversationId, body, attachments, replyMessage);
};

export const deleteMessage = async (
  conversationId: string,
  messageId: string,
  createdAt: number
) => {
  const state = useChatStore.getState();

  try {
    const res = await chatService.deleteMessage(conversationId, createdAt, messageId);
    if (res?.ok) {
      const deletedAt = Date.now();

      useChatStore.setState((prev) => {
        const msgs = prev.messagesByConversation[conversationId] || [];
        const updatedMessages = msgs.map((msg) =>
          msg.messageId === messageId
            ? {
                ...msg,
                isDeleted: true,
                deletedAt,
                failed: false,
              }
            : msg
        );

        const pinned = prev.pinnedMessagesByConversation[conversationId] || [];
        const updatedPinned = pinned.filter(
          (p: any) => p.messageId !== messageId && (p as any).id !== messageId
        );

        return {
          messagesByConversation: {
            ...prev.messagesByConversation,
            [conversationId]: updatedMessages,
          },
          pinnedMessagesByConversation: {
            ...prev.pinnedMessagesByConversation,
            [conversationId]: updatedPinned,
          },
        };
      });

      const socket = getSocket();
      if (socket?.connected) {
        sendSocketMessage("/app/chat/delete", {
          conversation_id: conversationId,
          message_id: messageId,
          created_at: createdAt,
        });
      }
    } else {
      state.setError((res as any)?.payload?.message || "Xóa tin nhắn thất bại");
    }
  } catch (error: any) {
    console.error("[deleteMessage] error:", error);
    state.setError(error?.message || "Lỗi xóa tin nhắn");
  }
};

export const pinMessage = async (conversationId: string, messageId: string, createdAt: number) => {
  try {
    const state = useChatStore.getState();
    const pinned = state.pinnedMessagesByConversation[conversationId] || [];
    
    if (pinned.some((m: any) => m.messageId === messageId)) {
      console.warn("[pinMessage] Message already pinned");
      return { ok: true, payload: {} };
    }

    const res = await chatService.pinMessage(conversationId, createdAt, messageId);
    if (res?.ok) {
      const payload = res.payload as any;
      const data = payload?.data || payload;
      const pinnedMsg = {
        id: data?.id || data?.messageId || messageId,
        messageId: data?.messageId || messageId,
        body: data?.message?.content || data?.content || "",
        content: data?.message?.content || data?.content || "",
        senderId: data?.message?.senderId || data?.senderId || "",
        createdAt: data?.message?.createdAt || data?.createdAt || createdAt,
        attachments: data?.message?.attachments || data?.attachments || [],
        isPinned: true,
      };
      state.setPinnedMessages(conversationId, [...pinned, pinnedMsg]);

      const socket = getSocket();
      if (socket?.connected) {
        sendSocketMessage("/app/chat/pin", {
          conversation_id: conversationId,
          message_id: messageId,
        });
      }
    }
    return res;
  } catch (error: any) {
    console.error("[pinMessage] error:", error);
    return null;
  }
};

export const unpinMessage = async (conversationId: string, messageId: string, createdAt: number) => {
  try {
    console.log("[unpinMessage] Called:", { conversationId, messageId, createdAt });
    
    const ts = typeof createdAt === 'number' ? createdAt : Date.now();
    const res = await chatService.unpinMessage(conversationId, ts, messageId);
    console.log("[unpinMessage] Response:", res);
    
    if (res?.ok) {
      const state = useChatStore.getState();
      const pinned = state.pinnedMessagesByConversation[conversationId] || [];
      const filtered = pinned.filter((m: any) => {
        const mId = m.messageId || m.id;
        return mId !== messageId;
      });
      console.log("[unpinMessage] Filtered pinned:", filtered.length);
      state.setPinnedMessages(conversationId, filtered);

      const socket = getSocket();
      if (socket?.connected) {
        sendSocketMessage("/app/chat/unpin", {
          conversation_id: conversationId,
          message_id: messageId,
        });
      }
    } else {
      console.warn("[unpinMessage] Failed:", res?.payload);
    }
    return res;
  } catch (error: any) {
    console.error("[unpinMessage] Error:", error);
    return null;
  }
};

export const fetchPinnedMessages = async (conversationId: string) => {
  try {
    const res = await chatService.getPinnedMessages(conversationId);
    if (res?.ok) {
      const data = (res?.payload as any)?.data ?? res?.payload ?? [];
      const items = Array.isArray(data) ? data : [];
      useChatStore.getState().setPinnedMessages(conversationId, items);
    }
  } catch (error: any) {
    console.error("[fetchPinnedMessages] error:", error);
  }
};

export const fetchConversationReactions = async (conversationId: string) => {
  try {
    const res = await chatService.getConversationReactions(conversationId);
    if (res?.ok) {
      const data = (res?.payload as any)?.data ?? res?.payload ?? {};
      const state = useChatStore.getState();
      Object.entries(data).forEach(([messageId, reactions]: [string, any]) => {
        state.setMessageReactions(conversationId, messageId, reactions as ReactionDto[]);
      });
    }
  } catch (error: any) {
    console.error("[fetchConversationReactions] error:", error);
  }
};

export const editMessage = async (conversationId: string, messageId: string, newBody: string, createdAt: number) => {
  const trimmed = newBody.trim();
  if (!trimmed) return;
  try {
    const res = await chatService.editMessageContent(conversationId, createdAt, messageId, trimmed);
    if (res?.ok) {
      const state = useChatStore.getState();
      const messages = state.messagesByConversation[conversationId] || [];
      state.setMessages(
        conversationId,
        messages.map((msg: UiMessage) =>
          msg.messageId === messageId
            ? { ...msg, body: trimmed, editedAt: Date.now() }
            : msg
        )
      );
    }
  } catch (error: any) {
    console.error("[editMessage] error:", error);
  }
};

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export const sendTyping = (conversationId: string) => {
  const socket = getSocket();
  if (!socket?.connected) return;
  sendSocketMessage("/app/chat/typing", { conversation_id: conversationId });
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    sendSocketMessage("/app/chat/stop_typing", { conversation_id: conversationId });
  }, 3000);
};

export const sendStopTyping = (conversationId: string) => {
  const socket = getSocket();
  if (!socket?.connected) return;
  sendSocketMessage("/app/chat/stop_typing", { conversation_id: conversationId });
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
};

export const toggleReaction = async (
  conversationId: string,
  messageId: string,
  createdAt: number,
  emoji: string
) => {
  const state = useChatStore.getState();
  const reactions = state.reactionsByConversation[conversationId]?.[messageId] || [];
  const existing = reactions.find((r) => r.emoji === emoji);
  const currentUserId = state.currentUserId;
  const alreadyReacted = existing?.userIds.includes(currentUserId || '') ?? false;

  if (alreadyReacted) {
    await removeReaction(conversationId, messageId, createdAt, emoji);
  } else {
    await addReaction(conversationId, messageId, createdAt, emoji);
  }
};

export const addReaction = async (
  conversationId: string,
  messageId: string,
  createdAt: number,
  emoji: string
) => {
  try {
    const res = await chatService.addReaction(conversationId, createdAt, messageId, emoji);
    if (res?.ok) {
      const state = useChatStore.getState();
      const uid = state.currentUserId;
      // Skip local update if currentUserId not ready — STOMP broadcast will handle it
      if (!uid) return res;

      const current = state.reactionsByConversation[conversationId]?.[messageId] || [];
      const existing = current.find((r) => r.emoji === emoji);
      if (existing) {
        if (existing.userIds.includes(uid)) return res;
        const updated = current.map((r) =>
          r.emoji === emoji
            ? { ...r, count: r.count + 1, userIds: [...r.userIds, uid] }
            : r
        );
        state.setMessageReactions(conversationId, messageId, updated);
      } else {
        state.setMessageReactions(conversationId, messageId, [
          ...current,
          { emoji, count: 1, userIds: [uid] },
        ]);
      }

    }
    return res;
  } catch (error: any) {
    console.error("[addReaction] error:", error);
    return null;
  }
};

export const removeReaction = async (
  conversationId: string,
  messageId: string,
  createdAt: number,
  emoji: string
) => {
  try {
    const res = await chatService.removeReaction(conversationId, createdAt, messageId, emoji);
    if (res?.ok) {
      const state = useChatStore.getState();
      const uid = state.currentUserId;
      if (!uid) return res;

      const current = state.reactionsByConversation[conversationId]?.[messageId] || [];
      const updated = current
        .map((r) =>
          r.emoji === emoji
            ? { ...r, count: r.count - 1, userIds: r.userIds.filter((id) => id !== uid) }
            : r
        )
        .filter((r) => r.count > 0);
      state.setMessageReactions(conversationId, messageId, updated);
    }
    return res;
  } catch (error: any) {
    console.error("[removeReaction] error:", error);
    return null;
  }
};

const handleReactionEvent = (raw: any) => {
  const conversationId = raw?.conversation_id ?? raw?.conversationId;
  const messageId = raw?.message_id ?? raw?.messageId;
  const userId = raw?.user_id ?? raw?.userId;
  const emoji = raw?.emoji;
  const action = raw?.action;

  if (!conversationId || !messageId || !userId || !emoji || !action) return;

  const state = useChatStore.getState();
  // Skip own events — already handled by HTTP response callback
  if (userId === state.currentUserId) return;
  const current = state.reactionsByConversation[conversationId]?.[messageId] || [];

  if (action === "added") {
    const existing = current.find((r) => r.emoji === emoji);
    if (existing) {
      if (!existing.userIds.includes(userId)) {
        const updated = current.map((r) =>
          r.emoji === emoji
            ? { ...r, count: r.count + 1, userIds: [...r.userIds, userId] }
            : r
        );
        state.setMessageReactions(conversationId, messageId, updated);
      }
    } else {
      state.setMessageReactions(conversationId, messageId, [
        ...current,
        { emoji, count: 1, userIds: [userId] },
      ]);
    }
  } else if (action === "removed") {
    const updated = current
      .map((r) =>
        r.emoji === emoji
          ? { ...r, count: r.count - 1, userIds: r.userIds.filter((id) => id !== userId) }
          : r
      )
      .filter((r) => r.count > 0);
    state.setMessageReactions(conversationId, messageId, updated);
  }
};

export const cleanupChat = () => {
  const state = useChatStore.getState();
  const socket = getSocket();

  if (_syncListTimer) clearTimeout(_syncListTimer);

  disconnectSocket();

  _removeAllWindowListeners();
  state.resetChatState();
};

// Event handlers for window events
  const handleWindowReactionEvent = (event: any) => {
    handleReactionEvent(event.detail);
  };

  const handleWindowIncomingMessage = (event: any) => {
  console.log('Window event - chat:new:', event.detail);
  const normalized = normalizeMessage(event.detail);
  
  if (!normalized.conversationId || !normalized.messageId) return;

  useChatStore.setState((state) => {
    const currentMessages =
      state.messagesByConversation[normalized.conversationId] || [];

    let msg = normalized;

    if (!msg.replyTo && msg.replyToMessageId) {
      const repliedMessage = currentMessages.find(
        (item) => item.messageId === msg.replyToMessageId
      );

      if (repliedMessage) {
        msg = {
          ...msg,
          replyTo: {
            messageId: repliedMessage.messageId,
            senderId: repliedMessage.senderId,
            senderName: repliedMessage.senderName || "Người dùng",
            body: repliedMessage.body ?? "",
            attachments: repliedMessage.attachments ?? [],
            isDeleted: Boolean(repliedMessage.isDeleted),
          },
          replyToMessageId: null,
        };
      }
    }

    const nextMessages = [...currentMessages];
    const existingIndex = nextMessages.findIndex(
      (item) => item.messageId === msg.messageId
    );

    if (existingIndex >= 0) {
      nextMessages[existingIndex] = msg;
    } else {
      // STOMP broadcast may arrive before HTTP response — replace pending
      const pendingIndex = nextMessages.findIndex(
        (item) => item.pending &&
          item.senderId === msg.senderId &&
          item.body === (msg.body ?? "") &&
          Math.abs(item.createdAt - msg.createdAt) < 10000
      );
      if (pendingIndex >= 0) {
        nextMessages[pendingIndex] = msg;
      } else {
        nextMessages.push(msg);
      }
    }

    const conversationExists = state.listConversation.some((cvs) => cvs.id === normalized.conversationId);
    const isActiveConversation = state.activeConversationId === normalized.conversationId;
    const isOwnMessage = normalized.senderId === state.currentUserId;
    
    if (!conversationExists) {
      setTimeout(() => fetchListConversation({ page: 1, limit: 20 }), 0);
    }

    let nextConversations = conversationExists
      ? moveConversationToTopWithLastMessage(
          state.listConversation,
          normalized.conversationId,
          msg
        )
      : state.listConversation;

    if (conversationExists && !isOwnMessage) {
      nextConversations = nextConversations.map((conversation) => {
        if (conversation.id !== normalized.conversationId) return conversation;
        return {
          ...conversation,
          unreadCount: isActiveConversation ? 0 : (conversation.unreadCount ?? 0) + 1,
        };
      });
    }

    if (isActiveConversation && !isOwnMessage) {
      chatService.markConversationAsRead(normalized.conversationId).catch(() => {});
    }
    if (!isActiveConversation && !isOwnMessage) {
      _scheduleListSync();
    }

    return {
      messagesByConversation: {
        ...state.messagesByConversation,
        [msg.conversationId]: nextMessages,
      },
      listConversation: nextConversations,
    };
  });
};

const handlePresenceUpdate = (event: any) => {
  const detail = event.detail;
  console.log('[presence:update] raw event detail:', JSON.stringify(detail));
  const userId = detail?.user_id ?? detail?.userId;
  const rawEvent = detail?.event ?? detail?.status;
  if (!userId || !rawEvent) {
    console.warn('[presence:update] missing userId or event', { userId, rawEvent, detail });
    return;
  }

  const isOnline = rawEvent === 'USER_ONLINE' || rawEvent === 'online';
  console.log('[presence:update]', userId, isOnline ? 'ONLINE' : 'OFFLINE', 'current onlineUserIds:', useChatStore.getState().onlineUserIds);

  usePresenceStore.getState().updatePresence(userId, {
    user_id: userId,
    status: isOnline ? 'online' : 'offline',
    last_seen_at: Date.now(),
  });

  useChatStore.setState((state) => {
    if (isOnline && !state.onlineUserIds.includes(userId)) {
      console.log('[presence:update] adding to onlineUserIds:', userId);
      return { onlineUserIds: [...state.onlineUserIds, userId] };
    } else if (!isOnline && state.onlineUserIds.includes(userId)) {
      console.log('[presence:update] removing from onlineUserIds:', userId);
      return { onlineUserIds: state.onlineUserIds.filter(id => id !== userId) };
    }
    return state;
  });
};

const handleSocketError = (event: any) => {
  console.log('Window event - socket:error:', event.detail);
  const state = useChatStore.getState();
  state.setSocketConnected(false);
  state.setError(event.detail?.message || "Socket connection failed");
};

const handleSocketConnect = () => {
  useChatStore.getState().setSocketConnected(true);
};

const handleSocketDisconnect = (event: any) => {
  console.log('Window event - socket:disconnect:', event.detail);
  useChatStore.getState().setSocketConnected(false);
};

const handleWindowDeletedMessage = (event: any) => {
  console.log('Window event - chat:deleted:', event.detail);
  const raw = event.detail;
  const messageId = raw?.message_id ?? raw?.messageId;
  const conversationId = raw?.conversation_id ?? raw?.conversationId;
  const deletedAt = raw?.deleted_at ?? raw?.deletedAt ?? Date.now();

  if (!messageId || !conversationId) return;

  useChatStore.setState((prev) => {
    const messages = prev.messagesByConversation[conversationId] || [];
    return {
      messagesByConversation: {
        ...prev.messagesByConversation,
        [conversationId]: applyDeletedMessage(messages, messageId, deletedAt),
      },
      listConversation: patchConversationPreviewWhenDeleted(
        prev.listConversation,
        conversationId,
        messageId,
      ),
    };
  });

  const state = useChatStore.getState();
  if (state.isMessagePinned(conversationId, messageId)) {
    state.removePinnedMessage(conversationId, messageId);
  }
};

const detectPreviewTypeFromMessage = (message: UiMessage) => {
  const cleanBody = (message.body ?? "").replace(/\u200B/g, "").trim();
  const lowerContent = cleanBody.toLowerCase();

  if (lowerContent.match(/\.(mp4|mov|avi|mkv|webm)$/)) return "video";
  if (lowerContent.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "image";
  if (lowerContent.match(/\.(pdf|doc|docx|xls|xlsx|txt|zip)$/)) return "file";
  if (lowerContent.match(/\.(mp3|wav|ogg|m4a)$/)) return "voice";

  if (message.attachments?.some((att) => att.type === "image")) return "image";
  if (message.attachments?.some((att) => att.type === "video")) return "video";
  if (message.attachments?.some((att) => att.type === "audio")) return "voice";
  if (message.attachments?.some((att) => att.type === "document")) return "file";

  if (cleanBody) return "text";
  return "deleted";
};

export const moveConversationToTopWithLastMessage = (
  conversations: ConversationDto[],
  conversationId: string,
  message: UiMessage
): ConversationDto[] => {
  const cleanBody = (message.body ?? "").replace(/\u200B/g, "").trim();
  const previewType = detectPreviewTypeFromMessage(message);

  let previewContent = cleanBody;

  switch (previewType) {
    case "image":
      previewContent = "Đã gửi 1 ảnh";
      break;
    case "video":
      previewContent = "Đã gửi 1 video";
      break;
    case "file":
      previewContent = "Đã gửi 1 tệp đính kèm";
      break;
    case "voice":
      previewContent = "__VOICE__";
      break;
    case "deleted":
      previewContent = "";
      break;
    default:
      previewContent = cleanBody;
      break;
  }

  const tempData: ConversationLastMessageDto = {
    id: message.messageId,
    content: previewContent,
    createdAt: message.createdAt,
    senderId: message.senderId,
    senderName: "",
  };

  const updatedList = conversations.map((cvs) =>
    cvs.id === conversationId
      ? {
        ...cvs,
        lastMessage: tempData,
        lastMessageAt: message.createdAt,
      }
      : cvs
  );
  return sortConversations(updatedList);
};
