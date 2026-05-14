import { buildDerivedDataFromMessages, dedupeByMessageId, extractFilesFromMessage, extractLinksFromMessage, extractMediaFromMessage, normalizeMessage, uniqAttachments, uniqStrings, upsertIncomingMessage } from "../helpers/chat.helpers";
import { buildChatAttachmentsPayload } from "../helpers/chatAttachment.helpers";
import { cleanMessageBody, HIDDEN_BODY } from "../helpers/cleanBodyMedia";
import { sortConversations } from "../helpers/sortConservation";
import { ConversationDto, ConversationLastMessageDto, UiMessage } from "../interface/chat-interface";
import { ChatAttachmentPayload, IUploadedMedia } from "../interface/media-interface";
import { chatService } from "../service/chat-service";
import { connectSocket, getSocket, sendSocketMessage } from "../socket/socket";
import { useChatStore } from "../store/useChatStore";

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

export const openMockConversation = (conversationId: string) => {
  useChatStore.getState().setActiveConversationId(conversationId);
};

export const fetchListConversation = async (
  params: { page?: number; limit?: number } = {}
) => {
  const state = useChatStore.getState();

  state.setConversationLoading(true);
  state.setError(null);

  try {
    const res = await chatService.fetchListConversations({
      limit: params.limit ?? 10,
      offset: params.page ? (params.page - 1) * (params.limit ?? 10) : 0,
    });

    const payload = res?.payload as any;
    const items = Array.isArray(payload?.conversations) ? payload.conversations : [];

    state.setListConversation(sortConversations(items));
    state.setConversationMeta(null);
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

    useChatStore.setState((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: applyDeletedMessage(
          state.messagesByConversation[conversationId] || [],
          messageId,
          deletedAt
        ),
      },
      listConversation: patchConversationPreviewWhenDeleted(
        state.listConversation,
        conversationId,
        messageId
      ),
    }));
  };

  const handleUpdatedMessage = (raw: any) => {
    const messageId = raw?.message_id ?? raw?.messageId;
    const conversationId = raw?.conversation_id ?? raw?.conversationId;
    const body = cleanMessageBody(raw?.body ?? "");
    const editedAt = raw?.edited_at ?? raw?.editedAt ?? Date.now();

    if (!messageId || !conversationId) return;

    useChatStore.setState((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] || []).map((msg) =>
          msg.messageId === messageId
            ? {
              ...msg,
              body,
              editedAt,
            }
            : msg
        ),
      },
      listConversation: state.listConversation.map((cvs) => {
        if (cvs.id !== conversationId) return cvs;

        const lastMessage = cvs.lastMessage;
        if (!lastMessage || lastMessage.id !== messageId) return cvs;

        return {
          ...cvs,
          lastMessage: {
            ...lastMessage,
            content: body,
          },
          lastMessageAt: editedAt,
        };
      }),
    }));
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

  // Socket.IO event handlers disabled for STOMP compatibility
  // Events will be handled through STOMP subscriptions in socket.ts
  console.log('Socket initialized for user:', currentUserId);

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
    const messages = (res?.payload as any)?.data || [];
    const normalizedItems = dedupeByMessageId(messages.map(normalizeMessage));
    const hydratedItems = hydrateReplyMessages(normalizedItems);

    const oldItems =
      useChatStore.getState().messagesByConversation[conversationId] || [];
    const merged = dedupeByMessageId([...oldItems, ...hydratedItems]);

    state.setMessages(conversationId, merged);

    const payloadMeta = (res?.payload as any)?.meta;
    const hasNext = payloadMeta?.hasNext ?? false;
    const oldestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    state.setPagination(conversationId, {
      nextCursor: oldestMessage ? oldestMessage.id : null,
      hasMore: hasNext,
      loading: false,
      loadingMore: false,
    });

    rebuildConversationDerivedData(conversationId);
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

    const payload = res?.payload as any;
    const messagesData = Array.isArray(payload?.data) ? payload.data : [];
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

    const oldestMessage = messagesData.length > 0 ? messagesData[messagesData.length - 1] : null;

    useChatStore.setState((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: mergedMessages,
      },
      paginationByConversation: {
        ...state.paginationByConversation,
        [conversationId]: {
          ...state.paginationByConversation[conversationId],
          nextCursor: oldestMessage ? oldestMessage.id : null,
          hasMore: payload?.meta?.hasNext ?? false,
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

export const editMessage = async (
  conversationId: string,
  messageId: string,
  newBody: string
) => {
  const state = useChatStore.getState();
  const socket = getSocket();
  const cleanBody = cleanMessageBody(newBody);

  if (!socket?.connected) {
    state.setError("Socket chưa kết nối");
    return;
  }

  if (!cleanBody) {
    state.setError("Nội dung chỉnh sửa không được để trống");
    return;
  }

  const editedAt = Date.now();

  useChatStore.setState((prev) => ({
    messagesByConversation: {
      ...prev.messagesByConversation,
      [conversationId]: (prev.messagesByConversation[conversationId] || []).map((msg) =>
        msg.messageId === messageId
          ? {
            ...msg,
            body: cleanBody,
            editedAt,
            failed: false,
          }
          : msg
      ),
    },
    listConversation: prev.listConversation.map((cvs) => {
      if (cvs.id !== conversationId) return cvs;

      const lastMessage = cvs.lastMessage;
      if (!lastMessage || lastMessage.id !== messageId) return cvs;

      return {
        ...cvs,
        lastMessage: {
          ...lastMessage,
          content: cleanBody,
        },
        lastMessageAt: editedAt,
      };
    }),
  }));

  sendSocketMessage("/app/chat/update", {
    conversation_id: conversationId,
    message_id: messageId,
    body: cleanBody,
    edited_at: editedAt,
  });
};

export const deleteMessage = (
  conversationId: string,
  messageId: string,
  createdAt: number
) => {
  const state = useChatStore.getState();
  const socket = getSocket();

  if (!socket?.connected) {
    state.setError("Socket chưa kết nối");
    return;
  }

  useChatStore.setState((prev) => ({
    messagesByConversation: {
      ...prev.messagesByConversation,
      [conversationId]: applyDeletedMessage(
        prev.messagesByConversation[conversationId] || [],
        messageId,
        Date.now()
      ),
    },
    listConversation: patchConversationPreviewWhenDeleted(
      prev.listConversation,
      conversationId,
      messageId
    ),
  }));

  sendSocketMessage("/app/chat/delete", {
    message_id: messageId,
    conversation_id: conversationId,
    created_at: Number(createdAt),
  });
};
function handleConversationDisbanded(payload: any) {
  console.log("[conversation:disbanded]", payload);

  const conversationId =
    payload?.conversation_id ?? payload?.conversationId;

  if (!conversationId) return;

  const current = useChatStore.getState();
  current.removeConversationLocally(conversationId);
};
async function handleConversationCreated(payload: any) {
  console.log("[conversation:created]", payload);

  const conversationId =
    payload?.conversation_id ?? payload?.conversationId;

  const type = payload?.type;
  const current = useChatStore.getState();
  const currentUserId = current.currentUserId;

  if (!conversationId || !currentUserId) return;

  await fetchListConversation({ page: 1, limit: 10 });

  await current.fetchConversationDetail(conversationId, true);
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

export const cleanupChat = () => {
  const state = useChatStore.getState();
  const socket = getSocket();
  const heartbeatId = state.heartbeatId;

  if (heartbeatId) clearInterval(heartbeatId);

  // Remove window event listeners
  window.removeEventListener('chat:new', handleWindowIncomingMessage);
  window.removeEventListener('presence:update', handlePresenceUpdate);
  window.removeEventListener('socket:error', handleSocketError);
  window.removeEventListener('socket:disconnect', handleSocketDisconnect);

  if (socket?.connected) socket.deactivate();

  state.resetChatState();
};

// Event handlers for window events
const handleWindowIncomingMessage = (event: any) => {
  console.log('Window event - chat:new:', event.detail);
  const normalized = normalizeMessage(event.detail);
  
  // Handle incoming message logic (copied from original handleIncomingMessage)
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