import { buildDerivedDataFromMessages, dedupeByMessageId, extractFilesFromMessage, extractLinksFromMessage, extractMediaFromMessage, normalizeMessage, uniqAttachments, uniqStrings, upsertIncomingMessage } from "../helpers/chat.helpers";
import { ConversationDto, ConversationLastMessageDto, UiMessage } from "../interface/chat-interface";
import { chatService } from "../service/chat-service";
import { connectSocket, getSocket } from "../socket/socket";
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
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    });

    const payload = res?.payload;
    const items = Array.isArray(payload?.data) ? payload.data : [];
    const meta = payload?.meta ?? null;

    state.setListConversation(items);
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

export const initChat = (accessToken: string, currentUserId: string) => {
  if (!accessToken || !currentUserId) return;

  const state = useChatStore.getState();
  const socket = connectSocket(accessToken);

  const oldHeartbeat = state.heartbeatId;
  if (oldHeartbeat) clearInterval(oldHeartbeat);

  socket.off("connect");
  socket.off("disconnect");
  socket.off("connect_error");
  socket.off("chat:new");
  socket.off("chat:message");
  socket.offAny();

  const handleIncomingMessage = (raw: any) => {
    const msg = normalizeMessage(raw);
    if (!msg.conversationId) return;

    const current = useChatStore.getState();
    const oldMessages = current.messagesByConversation[msg.conversationId] || [];

    const tempIndex = oldMessages.findIndex((m) =>
      m.messageId === msg.messageId
      // m.clientMessageId === msg.clientMessageId
    );

    if (tempIndex !== -1) {
      const nextMessages = [...oldMessages];
      nextMessages[tempIndex] = {
        ...nextMessages[tempIndex],
        ...msg,
        pending: false,
        failed: false,
      };

      current.setMessages(msg.conversationId, dedupeByMessageId(nextMessages));
      appendMessageDerivedData(nextMessages[tempIndex]);
      return;
    }

    const existed = oldMessages.some((m) => m.messageId === msg.messageId);

    if (!existed) {
      current.appendRealtimeMessage(msg.conversationId, {
        ...msg,
        pending: false,
        failed: false,
      });
    } else {
      const nextMessages = upsertIncomingMessage(oldMessages, {
        ...msg,
        pending: false,
        failed: false,
      });
      current.setMessages(msg.conversationId, nextMessages);
    }

    appendMessageDerivedData(msg);

    if (msg.senderId && msg.senderId !== currentUserId && document.hidden) {
      import("../utilities/sound").then(({ playNotificationSound }) => playNotificationSound());
    }
  };

  socket.on("connect", () => {
    const current = useChatStore.getState();
    const activeConversationId = current.activeConversationId;

    if (activeConversationId) {
      socket.emit("chat:join", {
        conversation_id: activeConversationId,
      });
    }

    current.setSocketConnected(true);
    current.setInitialized(true);
    current.setCurrentUserId(currentUserId);
    current.setError(null);
  });

  socket.on("disconnect", () => {
    useChatStore.getState().setSocketConnected(false);
  });

  socket.on("connect_error", (err) => {
    const current = useChatStore.getState();
    current.setSocketConnected(false);
    current.setError(err?.message || "Socket connect failed");
  });

  socket.on("chat:new", handleIncomingMessage);

  socket.on("chat:typing", (data: { userId: string; conversationId: string }) => {
    const current = useChatStore.getState();
    if (!data.conversationId || data.userId === currentUserId) return;
    const prev = current.typingUsersByConversation[data.conversationId] || [];
    if (prev.some((u) => u.userId === data.userId)) return;
    current.setTypingUsers(data.conversationId, [
      ...prev,
      { userId: data.userId },
    ]);
  });

  socket.on("chat:stop_typing", (data: { userId: string; conversationId: string }) => {
    const current = useChatStore.getState();
    if (!data.conversationId) return;
    const prev = current.typingUsersByConversation[data.conversationId] || [];
    current.setTypingUsers(
      data.conversationId,
      prev.filter((u) => u.userId !== data.userId)
    );
  });

  socket.on("presence:online", (data: { userId: string }) => {
    const current = useChatStore.getState();
    if (!current.onlineUserIds.includes(data.userId)) {
      current.setOnlineUserIds([...current.onlineUserIds, data.userId]);
    }
  });

  socket.on("presence:offline", (data: { userId: string }) => {
    const current = useChatStore.getState();
    current.setOnlineUserIds(current.onlineUserIds.filter((id) => id !== data.userId));
  });

  socket.onAny((event, ...args) => {
    console.log("[socket event]", event, args);
  });

  const heartbeatId = setInterval(() => {
    if (!socket.connected) return;

    socket.emit("presence:heartbeat", {
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
    socket.emit("chat:join", { conversation_id: conversationId });
  }

  state.setPagination(conversationId, {
    loading: true,
    loadingMore: false,
  });

  try {
    const res = await chatService.fetchMessages(conversationId, { limit: 50 });
    const page = res?.payload?.data;
    const items = Array.isArray(page?.items) ? dedupeByMessageId(page.items) : [];

    const oldItems =
      useChatStore.getState().messagesByConversation[conversationId] || [];
    const merged = dedupeByMessageId([...oldItems, ...items]);

    state.setMessages(conversationId, merged);

    state.setPagination(conversationId, {
      nextCursor: page?.nextCursor ?? null,
      hasMore: page?.hasMore ?? false,
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
    console.log("[action:loadMore:skip]", {
      conversationId,
      pagination,
    });
    return;
  }

  state.setPagination(conversationId, {
    loadingMore: true,
  });

  try {
    console.log("[action:loadMore:fetch]", {
      conversationId,
      cursor: pagination.nextCursor,
    });

    const res = await chatService.fetchMessages(conversationId, {
      cursor: pagination.nextCursor,
      limit: 50,
    });

    const payload = res?.payload?.data;
    const oldMessages = Array.isArray(payload?.items)
      ? dedupeByMessageId(payload.items)
      : [];

    const latestState = useChatStore.getState();
    const currentMessages =
      latestState.messagesByConversation[conversationId] || [];

    console.log("[action:loadMore:result]", {
      fetchedCount: oldMessages.length,
      currentCount: currentMessages.length,
      fetchedFirstId: oldMessages[0]?.messageId,
      fetchedLastId: oldMessages[oldMessages.length - 1]?.messageId,
      currentFirstId: currentMessages[0]?.messageId,
      currentLastId: currentMessages[currentMessages.length - 1]?.messageId,
      nextCursor: payload?.nextCursor,
      hasMore: payload?.hasMore,
    });

    const mergedMessages = dedupeByMessageId([
      ...oldMessages,
      ...currentMessages,
    ]);

    console.log("[action:loadMore:merged]", {
      mergedCount: mergedMessages.length,
      mergedFirstId: mergedMessages[0]?.messageId,
      mergedLastId: mergedMessages[mergedMessages.length - 1]?.messageId,
    });

    useChatStore.setState((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: mergedMessages,
      },
      paginationByConversation: {
        ...state.paginationByConversation,
        [conversationId]: {
          ...state.paginationByConversation[conversationId],
          nextCursor: payload?.nextCursor ?? null,
          hasMore: payload?.hasMore ?? false,
          loading: false,
          loadingMore: false,
        },
      },
    }));

    rebuildConversationDerivedData(conversationId);
  } catch (err: any) {
    console.error("[action:loadMore:error]", err);
    useChatStore.getState().setPagination(conversationId, {
      loadingMore: false,
    });
    useChatStore.getState().setError(
      err?.message || "Không lấy được tin nhắn"
    );
  }
};

export const sendMessage = async (
  conversationId: string,
  body: string,
  attachments: any[] = []
) => {
  const state = useChatStore.getState();
  const currentUserId = state.currentUserId;
  const trimmedBody = body?.trim?.() || "";
  const socket = getSocket();

  if (!currentUserId || (!trimmedBody && attachments.length === 0) || !socket?.connected) {
    console.warn("[sendMessage] socket chưa sẵn sàng");
    return;
  }

  const clientMessageId = crypto.randomUUID();
  const now = Date.now();

  const optimisticMessage = normalizeMessage({
    messageId: clientMessageId,
    conversationId,
    senderId: currentUserId,
    body: trimmedBody,
    attachments,
    createdAt: now,
    pending: true,
    failed: false,
  });

  state.appendRealtimeMessage(conversationId, optimisticMessage);
  appendMessageDerivedData(optimisticMessage);

  socket.emit("chat:join", { conversation_id: conversationId });

  socket.emit(
    "chat:send",
    {
      message_id: clientMessageId,
      conversation_id: conversationId,
      body: trimmedBody,
      attachments,
      sent_at: now,
    },
    (ack: any) => {
      console.log("[chat:send ack]", ack);

      const current = useChatStore.getState();
      const messages = current.messagesByConversation[conversationId] || [];
      const isSuccess = ack?.success === true;

      current.setMessages(
        conversationId,
        messages.map((msg: any) => {
          if (msg.messageId !== clientMessageId) return msg;

          if (!isSuccess) {
            return {
              ...msg,
              pending: false,
              failed: true,
            };
          }

          return {
            ...msg,
            pending: false,
            failed: false,
            messageId: ack?.data?.messageId ?? ack?.messageId ?? msg.messageId,
            createdAt: ack?.data?.createdAt ?? ack?.createdAt ?? msg.createdAt,
          };
        })
      );
    }
  );
};

export const pinMessage = async (conversationId: string, messageId: string, createdAt: number) => {
  try {
    const res = await chatService.pinMessage(conversationId, createdAt, messageId);
    if (res?.ok) {
      const state = useChatStore.getState();
      const pinned = state.pinnedMessagesByConversation[conversationId] || [];
      state.setPinnedMessages(conversationId, [...pinned, res.payload as any]);
    }
    return res;
  } catch (error: any) {
    console.error("[pinMessage] error:", error);
    return null;
  }
};

export const unpinMessage = async (conversationId: string, messageId: string, createdAt: number) => {
  try {
    const res = await chatService.unpinMessage(conversationId, createdAt, messageId);
    if (res?.ok) {
      const state = useChatStore.getState();
      const pinned = state.pinnedMessagesByConversation[conversationId] || [];
      state.setPinnedMessages(conversationId, pinned.filter((m: any) => m.messageId !== messageId));
    }
    return res;
  } catch (error: any) {
    console.error("[unpinMessage] error:", error);
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

export const deleteMessage = (conversationId: string, messageId: string) => {
  // em làm tiếp nếu cần
};

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export const sendTyping = (conversationId: string) => {
  const socket = getSocket();
  if (!socket?.connected) return;
  socket.emit("chat:typing", { conversation_id: conversationId });
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("chat:stop_typing", { conversation_id: conversationId });
  }, 3000);
};

export const sendStopTyping = (conversationId: string) => {
  const socket = getSocket();
  if (!socket?.connected) return;
  socket.emit("chat:stop_typing", { conversation_id: conversationId });
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

  socket?.off("connect");
  socket?.off("disconnect");
  socket?.off("connect_error");
  socket?.off("chat:new");
  socket?.off("chat:message");
  socket?.off("chat:typing");
  socket?.off("chat:stop_typing");
  socket?.off("presence:online");
  socket?.off("presence:offline");
  socket?.offAny();

  if (socket?.connected) socket.disconnect();

  state.resetChatState();
};
export const moveConversationToTopWithLastMessage = (
  conversations: ConversationDto[],
  conversationId: string,
  message: UiMessage
): ConversationDto[] => {
  const tempData: ConversationLastMessageDto = {
    id: message.messageId,
    content: message.body ?? "",
    createdAt: message.createdAt,
    senderId: message.senderId,
    senderName: "",
  }
  const updatedList = conversations.map((cvs) =>
    cvs.id === conversationId
      ? {
        ...cvs,
        lastMessage: tempData,
        lastMessageAt: message.createdAt,
      }
      : cvs
  );

  const current = updatedList.find((cvs) => cvs.id === conversationId);
  const rest = updatedList.filter((cvs) => cvs.id !== conversationId);

  return current ? [current, ...rest] : updatedList;
}