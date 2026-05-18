import { buildDerivedDataFromMessages, dedupeByMessageId, extractFilesFromMessage, extractLinksFromMessage, extractMediaFromMessage, normalizeMessage, uniqAttachments, uniqStrings, upsertIncomingMessage } from "../helpers/chat.helpers";
import { buildChatAttachmentsPayload } from "../helpers/chatAttachment.helpers";
import { cleanMessageBody, HIDDEN_BODY } from "../helpers/cleanBodyMedia";
import { sortConversations } from "../helpers/sortConservation";
import { ConversationDto, ConversationLastMessageDto, UiMessage } from "../interface/chat-interface";
import { ChatAttachmentPayload, IUploadedMedia } from "../interface/media-interface";
import { chatService } from "../service/chat-service";
import { connectSocket, getSocket, sendSocketMessage } from "../socket/socket";
import { useChatStore } from "../store/useChatStore";
import http from "../api/http";

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
    });

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

  const oldHeartbeat = state.heartbeatId;
  if (oldHeartbeat) clearInterval(oldHeartbeat);

  // STOMP client doesn't have .off() method like Socket.IO
  // Event cleanup is handled by window.removeEventListener in cleanupChat

  const handleIncomingMessage = (raw: any) => {
    const normalized = normalizeMessage(raw);

    if (!normalized.conversationId || !normalized.messageId) return;

    let finalMessage = normalized;

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
              body: repliedMessage.body ?? "",
              attachments: repliedMessage.attachments ?? [],
              isDeleted: Boolean(repliedMessage.isDeleted),
            },
          };
        }
      }

      finalMessage = msg;

      const nextMessages = upsertIncomingMessage(currentMessages, msg);

      const nextConversations = state.listConversation.some(
        (cvs) => cvs.id === msg.conversationId
      )
        ? moveConversationToTopWithLastMessage(
          state.listConversation,
          msg.conversationId,
          msg
        )
        : state.listConversation;

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [msg.conversationId]: nextMessages,
        },
        listConversation: nextConversations,
      };
    });

    appendMessageDerivedData(finalMessage);
  };

  const handleDeletedMessage = (raw: any) => {
    const messageId = raw?.message_id ?? raw?.messageId;
    const conversationId = raw?.conversation_id ?? raw?.conversationId;
    const deletedAt = raw?.deleted_at ?? raw?.deletedAt ?? Date.now();

    if (!messageId || !conversationId) return;

    const state = useChatStore.getState();
    
    // Auto unpin when message is deleted/revoked
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
  };

  const handlePinnedMessage = (raw: any) => {
    const conversationId = raw?.conversation_id ?? raw?.conversationId;
    const messageId = raw?.message_id ?? raw?.messageId;
    const pinnedAt = raw?.pinned_at ?? raw?.pinnedAt ?? Date.now();

    if (!conversationId || !messageId) return;

    const state = useChatStore.getState();
    
    // Add to pinned set
    state.addPinnedMessage(conversationId, messageId);
    
    // Update message if it exists in local state
    const messages = state.messagesByConversation[conversationId] || [];
    const messageExists = messages.some((msg) => msg.messageId === messageId);
    
    if (messageExists) {
      state.updateMessage(conversationId, messageId, {
        isPinned: true,
        pinnedAt,
      });
    }
  };

  const handleUnpinnedMessage = (raw: any) => {
    const conversationId = raw?.conversation_id ?? raw?.conversationId;
    const messageId = raw?.message_id ?? raw?.messageId;

    if (!conversationId || !messageId) return;

    const state = useChatStore.getState();
    state.removePinnedMessage(conversationId, messageId);
    state.updateMessage(conversationId, messageId, {
      isPinned: false,
      pinnedAt: undefined,
    });
  };

  // Removed legacy socket.on calls because stompClient does not support them.
  // Window event listeners below (chat:new, presence:update, etc.) should handle events now.

  // Remove existing listeners to prevent duplicates
  window.removeEventListener('chat:new', handleWindowIncomingMessage);
  window.removeEventListener('presence:update', handlePresenceUpdate);
  window.removeEventListener('socket:error', handleSocketError);
  window.removeEventListener('socket:disconnect', handleSocketDisconnect);

  // Add event listeners for STOMP events dispatched from socket.ts
  window.addEventListener('chat:new', handleWindowIncomingMessage);
  window.addEventListener('presence:update', handlePresenceUpdate);
  window.addEventListener('socket:error', handleSocketError);
  window.addEventListener('socket:disconnect', handleSocketDisconnect);

  const heartbeatId = setInterval(() => {
    if (!socket?.connected) return;

    sendSocketMessage("/app/presence/heartbeat", {
      ts: Date.now(),
    });
  }, 30000);

  // Load initial online users
  http.get<{ success: boolean; data: string[] }>("/api/presence/online").then((res) => {
    if (res?.ok && Array.isArray(res.payload?.data)) {
      state.setOnlineUserIds(res.payload.data);
    }
  }).catch(() => {});

  state.setInitialized(true);
  state.setCurrentUserId(currentUserId);
  state.setHeartbeatId(heartbeatId);
};

export const openConversation = async (conversationId: string) => {
  const state = useChatStore.getState();
  const socket = getSocket();

  state.setActiveConversationId(conversationId);
  state.setError(null);

  if (socket?.connected) {
    sendSocketMessage("/app/chat/join", { conversation_id: conversationId });
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
    const response = await chatService.sendMessage(conversationId, displayBody, 'TEXT', attachments);
    
    if (response.ok && response.payload) {
      // Success - Update optimistic message with server data
      const serverMessage = normalizeMessage(response.payload);
      
      // Update only the specific message, preserve all others
      const updates = {
        pending: false, 
        failed: false,
        messageId: serverMessage.messageId, // Update with server ID
        createdAt: serverMessage.createdAt,
      };
      
      state.updateMessage(conversationId, clientMessageId, updates);
      
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
            // Mark as failed
      state.setMessages(
        conversationId,
        (state.messagesByConversation[conversationId] || []).map((msg) =>
          msg.messageId === clientMessageId ? { ...msg, pending: false, failed: true } : msg
        )
      );
      state.setError((response.payload as any)?.message || "Gửi tin nhắn thất bại");
    }
  } catch (error) {
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
      const pinnedMsg = {
        id: payload?.id || payload?.messageId || messageId,
        messageId: payload?.messageId || messageId,
        body: payload?.message?.content || payload?.content || "",
        content: payload?.message?.content || payload?.content || "",
        senderId: payload?.message?.senderId || payload?.senderId || "",
        createdAt: payload?.message?.createdAt || payload?.createdAt || createdAt,
        isPinned: true,
      };
      state.setPinnedMessages(conversationId, [...pinned, pinnedMsg]);
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

async function handleConversationMemberAdded(payload: any) {
  console.log("[conversation:member:added]", payload);

  const conversationId =
    payload?.conversation_id ?? payload?.conversationId;

  const members = Array.isArray(payload?.members) ? payload.members : [];
  const current = useChatStore.getState();
  const currentUserId = current.currentUserId;

  if (!conversationId || !currentUserId) return;

  const isCurrentUserAdded = members.some(
    (member: any) => member?.user_id === currentUserId || member?.userId === currentUserId
  );

  if (!isCurrentUserAdded) return;

  await fetchListConversation({ page: 1, limit: 10 });
  await current.fetchConversationDetail(conversationId, true);
};

function handleConversationMemberRemoved(payload: any) {
  const conversationId =
    payload?.conversation_id ?? payload?.conversationId;

  const current = useChatStore.getState();
  const currentUserId = current.currentUserId;

  if (!conversationId || !currentUserId) return;

  const removedUserId =
    payload?.removed_user_id ??
    payload?.removedUserId ??
    payload?.user_id ??
    payload?.userId;

  const members = Array.isArray(payload?.members) ? payload.members : [];

  const isCurrentUserRemoved =
    removedUserId === currentUserId ||
    (members.length > 0 &&
      !members.some(
        (member: any) =>
          member?.user_id === currentUserId || member?.userId === currentUserId
      ));

  if (!isCurrentUserRemoved) return;

  current.removeConversationLocally(conversationId);
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

export const cleanupChat = () => {
  const state = useChatStore.getState();
  const socket = getSocket();
  const heartbeatId = state.heartbeatId;

  if (heartbeatId) clearInterval(heartbeatId);

  if (socket?.connected) (socket as any).disconnect();

  state.resetChatState();
};

// Event handlers for window events
const handleWindowIncomingMessage = (event: any) => {
  console.log('Window event - chat:new:', event.detail);
  const normalized = normalizeMessage(event.detail);
  
  // Handle incoming message logic (copied from original handleIncomingMessage)
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
      nextMessages.push(msg);
    }

    const conversationExists = state.listConversation.some((cvs) => cvs.id === normalized.conversationId);
    
    if (!conversationExists) {
      // If conversation is new, fetch the updated list
      setTimeout(() => fetchListConversation({ page: 1, limit: 20 }), 0);
    }

    const nextConversations = conversationExists
      ? moveConversationToTopWithLastMessage(
          state.listConversation,
          normalized.conversationId,
          msg
        )
      : state.listConversation;

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
  console.log('Window event - presence:update:', event.detail);
  // Handle presence updates
};

const handleSocketError = (event: any) => {
  console.log('Window event - socket:error:', event.detail);
  const state = useChatStore.getState();
  state.setSocketConnected(false);
  state.setError(event.detail?.message || "Socket connection failed");
};

const handleSocketDisconnect = (event: any) => {
  console.log('Window event - socket:disconnect:', event.detail);
  useChatStore.getState().setSocketConnected(false);
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
