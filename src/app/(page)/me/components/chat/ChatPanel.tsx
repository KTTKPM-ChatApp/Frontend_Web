"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import ForwardModal from "./ForwardModal";
import PinnedBar from "./PinnedBar";
import PinnedList from "./PinnedList";
import { TypingIndicator } from "@/src/shared/component/TypingIndicator";
import MenuPopover, { PopoverMenuItem } from "@/src/shared/component/MenuPopover";
import { useChatStore } from "@/src/common/store/useChatStore";
import { usePresenceStore } from "@/src/common/store/usePresenceStore";
import { usePresenceHeartbeat } from "@/src/common/hooks/usePresenceHeartbeat";
import { chatService } from "@/src/common/service/chat-service";
import {
  loadMoreMessages,
  openConversation,
  sendMessage,
} from "@/src/common/action/chat.action";
import { UiMessage } from "@/src/common/interface/chat-interface";
import { formatTypingIndicator } from "@/src/common/service/typingIndicatorService";
import { usePinnedMessages } from "@/src/common/hooks/usePinnedMessages";
import { useMessagePin } from "@/src/common/hooks/useMessagePin";
import MediaPreviewModal, { MediaPreviewItem } from "@/src/common/components/MediaPreviewModal";

interface ChatPanelProps {
  accessToken: string;
  currentUserId: string;
  conversationId: string;
  title?: string;
  onToggleSearch?: () => void;
}

const Root = styled(Box)({
  width: "100%",
  height: "100%",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  minHeight: 0,
});

const HeaderWrap = styled(Box)({
  height: 70,
  minHeight: 70,
  maxHeight: 70,
  flexShrink: 0,
  borderBottom: "1px solid #E5E7EB",
});

const MessageListWrap = styled(Box)({
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

const InputWrap = styled(Box)({
  minHeight: 50,
  flexShrink: 0,
  backgroundColor: "red",
});

export default function ChatPanel({
  accessToken,
  currentUserId,
  conversationId,
  title,
  onToggleSearch,
}: ChatPanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  const isAutoScrollingRef = useRef(false);
  const scrollHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchConversationDetail = useChatStore((s) => s.fetchConversationDetail);
  const prevConversationIdRef = useRef<string | null>(null);
  const prevFirstMessageIdRef = useRef<UiMessage["messageId"] | null>(null);
  const prevLastMessageIdRef = useRef<UiMessage["messageId"] | null>(null);
  const pendingMediaScrollMessageIdRef = useRef<UiMessage["messageId"] | null>(null);
  const isLoadingMoreRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  const scrollIntentRef = useRef<"none" | "open" | "load-more">("none");

  const [showScrollbar, setShowScrollbar] = useState(false);
  const [editMessage, setEditMessage] = useState<UiMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState<UiMessage | null>(null);
  const [isForwardModalVisible, setIsForwardModalVisible] = useState(false);
  const [selectedMessageForForward, setSelectedMessageForForward] = useState<UiMessage | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaPreviewItem | null>(null);
  const [previewMediaList, setPreviewMediaList] = useState<MediaPreviewItem[]>([]);
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0);
  const [pinnedMenuAnchor, setPinnedMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedPinnedMessage, setSelectedPinnedMessage] = useState<UiMessage | null>(null);

  const {
    socketConnected,
    messagesByConversation,
    paginationByConversation,
    error,
    typingUsersByConversation,
  } = useChatStore();

  const updatePresence = usePresenceStore((s) => s.updatePresence)
  usePresenceHeartbeat({
    onPresenceUpdate: (payload) => {
      updatePresence(payload.user_id, payload)
    }
  })

  const messages = useMemo(
    () => messagesByConversation[conversationId] || [],
    [messagesByConversation, conversationId]
  );

  const pagination = paginationByConversation[conversationId];
  const loadingMore = pagination?.loadingMore;
  const loading = pagination?.loading;

  const firstMessageId = messages[0]?.messageId ?? null;
  const lastMessageId = messages[messages.length - 1]?.messageId ?? null;

  const typingUsers = typingUsersByConversation[conversationId] || [];
  const typingState = useMemo(
    () => formatTypingIndicator(typingUsers, currentUserId),
    [typingUsers, currentUserId]
  );

  const { pinnedMessages, refetch: refetchPinnedMessages } = usePinnedMessages(conversationId);
  const { togglePin } = useMessagePin();

  const pinnedMessagesByConversation = useChatStore((s) => s.pinnedMessagesByConversation[conversationId]);
  const realtimePinnedMessages = useMemo(() => {
    if (!pinnedMessagesByConversation) return [];
    const pinnedSet = pinnedMessagesByConversation;
    return messages.filter((msg) => pinnedSet.has(msg.messageId));
  }, [messages, pinnedMessagesByConversation]);

  const handlePressPinnedMessage = (message: UiMessage) => {
    const wrap = listRef.current;
    if (!wrap) return;

    // Set highlight
    setHighlightedMessageId(message.messageId);

    // Clear highlight after 2 seconds
    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 2000);

    const messageElement = document.getElementById(`message-${message.messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleUnpinMessage = async (message: UiMessage) => {
    try {
      await togglePin(message.conversationId, message.createdAt, message.messageId);
      refetchPinnedMessages();
    } catch (error) {
      console.error("Failed to unpin message:", error);
    }
  };

  const handlePinMessage = async (message: UiMessage) => {
    try {
      await togglePin(message.conversationId, message.createdAt, message.messageId);
      refetchPinnedMessages();
    } catch (error) {
      console.error("Failed to pin message:", error);
    }
  };

  const handlePinnedMenuClick = (message: UiMessage, event?: React.MouseEvent<HTMLElement>) => {
    if (event) {
      setPinnedMenuAnchor(event.currentTarget);
    }
    setSelectedPinnedMessage(message);
  };

  const handleClosePinnedMenu = () => {
    setPinnedMenuAnchor(null);
    setSelectedPinnedMessage(null);
  };

  const handleUnpinFromMenu = async () => {
    if (!selectedPinnedMessage) return;
    await handleUnpinMessage(selectedPinnedMessage);
    handleClosePinnedMenu();
  };

  const handleCopyMessageContent = () => {
    if (!selectedPinnedMessage) return;
    const textToCopy = selectedPinnedMessage.body || "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).catch(() => {
        // Silently fail if copy doesn't work
      });
    }
    handleClosePinnedMenu();
  };

  const conversationDetail = useChatStore((s) => s.conversationDetailById?.[conversationId || ""] ?? null);
  const myRole = conversationDetail?.mySettings?.role ?? 'member';
  const isGroup = conversationDetail?.type === "group";
  const canUnpin = !isGroup || myRole === 'owner' || myRole === 'admin';

  const pinnedMenuItems: PopoverMenuItem[] = [
    { key: "copy", label: "Sao chép nội dung", onClick: handleCopyMessageContent },
    ...(canUnpin ? [{ key: "unpin", label: "Bỏ ghim", danger: true, onClick: handleUnpinFromMenu }] : []),
  ];

  const isNearBottom = () => {
    const wrap = listRef.current;
    if (!wrap) return false;

    const threshold = 120;
    return wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight <= threshold;
  };

  const scrollToBottomStable = () => {
    const wrap = listRef.current;
    if (!wrap) return;
    isAutoScrollingRef.current = true;

    requestAnimationFrame(() => {
      const node1 = listRef.current;
      if (!node1) {
        isAutoScrollingRef.current = false;
        return;
      }

      node1.scrollTop = node1.scrollHeight;

      requestAnimationFrame(() => {
        const node2 = listRef.current;
        if (!node2) {
          isAutoScrollingRef.current = false;
          return;
        }

        node2.scrollTop = node2.scrollHeight;

        requestAnimationFrame(() => {
          isAutoScrollingRef.current = false;
        });
      });
    });
  };

  const handleOpenMediaPreview = (media: MediaPreviewItem, allMedia?: MediaPreviewItem[], initialIndex?: number) => {
    setPreviewMedia(media);
    setPreviewMediaList(allMedia || []);
    setPreviewInitialIndex(initialIndex || 0);
  };

  const handleCloseMediaPreview = () => {
    setPreviewMedia(null);
    setPreviewMediaList([]);
    setPreviewInitialIndex(0);
  };

  const handleMediaLoad = (messageId: UiMessage["messageId"]) => {
    const wrap = listRef.current;
    if (!wrap) return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

const isLastMessage = lastMessage.messageId === messageId;
if (!isLastMessage) return;

const shouldScroll =
lastMessage.senderId === currentUserId ||
isNearBottom() ||
pendingMediaScrollMessageIdRef.current === messageId;

if (!shouldScroll) return;

requestAnimationFrame(() => {
scrollToBottomStable();

if (pendingMediaScrollMessageIdRef.current === messageId) {
pendingMediaScrollMessageIdRef.current = null;
}
});
};

const tryLoadMore = async () => {
const wrap = listRef.current;
if (!wrap || !conversationId || loading || loadingMore || !pagination?.hasMore) {
return;
}

prevScrollHeightRef.current = wrap.scrollHeight;
isLoadingMoreRef.current = true;
scrollIntentRef.current = "load-more";
await loadMoreMessages(conversationId);
};

const handleScroll = () => {
if (isAutoScrollingRef.current) return;

const wrap = listRef.current;
if (!wrap) return;

setShowScrollbar(true);

if (scrollHideTimeoutRef.current) {
clearTimeout(scrollHideTimeoutRef.current);
}

scrollHideTimeoutRef.current = setTimeout(() => setShowScrollbar(false), 800);

if (scrollIntentRef.current === "none" && wrap.scrollTop <= 80) {
void tryLoadMore();
}
};

const handleReplyMessage = (msg: UiMessage) => {
setEditMessage(null);
setReplyMessage(msg);
};

const handleCancelReply = () => {
setReplyMessage(null);
};

const handleCancelEdit = () => {
setEditMessage(null);
};

const handleForwardMessage = (msg: UiMessage) => {
setSelectedMessageForForward(msg);
setIsForwardModalVisible(true);
};

const handleForward = async (message: UiMessage, targetConversationIds: string[], optionalMessage?: string) => {
if (!message || !targetConversationIds || targetConversationIds.length === 0) {
return;
}
try {
const forwardId = crypto.randomUUID();
const sourceMessageId = message.messageId;
const targets = targetConversationIds.map((conversationId) => ({
message_id: crypto.randomUUID(),
conversation_id: conversationId,
}));

const payload = {
forward_id: forwardId,
source_message_id: sourceMessageId,
targets: targets,
};

const response = await chatService.forwardMessage(payload);

// Send optional message to accepted conversations if provided
if (optionalMessage && optionalMessage.trim()) {
const acceptedConversationIds = response?.payload?.data?.results
?.filter((r: any) => r.status === 'accepted')
.map((r: any) => r.conversation_id) || targetConversationIds;

// Wait a bit to ensure forwarded message arrives first
await new Promise(resolve => setTimeout(resolve, 500));

for (const conversationId of acceptedConversationIds) {
try {
await sendMessage(conversationId, optionalMessage.trim());
} catch (error) {
console.error('Failed to send optional message to:', conversationId, error);
}
}
}

const acceptedCount = response?.payload?.data?.results
?.filter((r: any) => r.status === 'accepted').length || targetConversationIds.length;
alert(`Đã chuyển tiếp tin nhắn đến ${acceptedCount}/${targetConversationIds.length} cuộc trò chuyện`);
} catch (error) {
console.error("Forward failed:", error);
alert("Chuyển tiếp tin nhắn thất bại");
}
};

useEffect(() => {
if (!conversationId) return;

prevConversationIdRef.current = conversationId;
scrollIntentRef.current = "open";
isLoadingMoreRef.current = false;
prevScrollHeightRef.current = 0;
prevFirstMessageIdRef.current = null;
prevLastMessageIdRef.current = null;
fetchConversationDetail(conversationId);
openConversation(conversationId);
}, [conversationId, fetchConversationDetail]);

useLayoutEffect(() => {
const wrap = listRef.current;
if (!wrap) return;

const intent = scrollIntentRef.current;

if (intent === "open" && !loading && !loadingMore && messages.length > 0) {
scrollToBottomStable();
scrollIntentRef.current = "none";
prevFirstMessageIdRef.current = firstMessageId;
prevLastMessageIdRef.current = lastMessageId;
return;
}

if (intent === "load-more" && !loadingMore) {
isLoadingMoreRef.current = false;
scrollIntentRef.current = "none";
prevFirstMessageIdRef.current = firstMessageId;
prevLastMessageIdRef.current = lastMessageId;
return;
}

if (intent === "none" && !isLoadingMoreRef.current) {
const prevLastMessageId = prevLastMessageIdRef.current;
const isAppendedNewMessage =
prevLastMessageId !== null &&
lastMessageId !== null &&
prevLastMessageId !== lastMessageId;

if (isAppendedNewMessage && !loading && !loadingMore) {
const lastMessage = messages[messages.length - 1];
const isOwnMessage = lastMessage?.senderId === currentUserId;

const hasMedia =
lastMessage?.attachments?.some(
(att) => att.type === "image" || att.type === "video"
) ?? false;

if (isOwnMessage || isNearBottom()) {
requestAnimationFrame(() => scrollToBottomStable());

if (hasMedia && lastMessage?.messageId !== null && lastMessage?.messageId !== undefined) {
pendingMediaScrollMessageIdRef.current = lastMessage.messageId;
} else {
pendingMediaScrollMessageIdRef.current = null;
}
}
}

prevFirstMessageIdRef.current = firstMessageId;
prevLastMessageIdRef.current = lastMessageId;
}
}, [conversationId, messages, firstMessageId, lastMessageId, loading, loadingMore, currentUserId]);

useEffect(() => {
return () => {
if (scrollHideTimeoutRef.current) {
clearTimeout(scrollHideTimeoutRef.current);
}
};
}, []);

return (
<Root>
<HeaderWrap>
<ChatHeader
conversationId={conversationId}
title={title}
socketConnected={socketConnected}
error={error}
onToggleSearch={onToggleSearch}
/>
</HeaderWrap>

<MessageListWrap>
{realtimePinnedMessages.length > 0 && (
<>
{isPinnedExpanded ? (
<PinnedList
pinnedMessages={realtimePinnedMessages}
members={conversationDetail?.members}
currentUserId={currentUserId}
onPressMessage={handlePressPinnedMessage}
onUnpinMessage={handleUnpinMessage}
onCollapse={() => setIsPinnedExpanded(false)}
onMenuClick={handlePinnedMenuClick}
/>
) : (
<PinnedBar
message={realtimePinnedMessages[0]}
totalCount={realtimePinnedMessages.length}
onExpand={() => setIsPinnedExpanded(true)}
onMenuClick={handlePinnedMenuClick}
/>
)}
</>
)}
<MessageList
listRef={listRef}
messages={messages}
onReplyMessage={handleReplyMessage}
currentUserId={currentUserId}
conversationId={conversationId}
onScroll={handleScroll}
showScrollbar={showScrollbar}
onMediaLoad={handleMediaLoad}
onForwardMessage={handleForwardMessage}
highlightedMessageId={highlightedMessageId}
onOpenMedia={handleOpenMediaPreview}
/>
{typingState.visible && <TypingIndicator text={typingState.text} />}
</MessageListWrap>

<InputWrap>
<ChatInput
disabled={false}
replyMessage={replyMessage}
editMessage={editMessage}
onCancelReply={handleCancelReply}
onCancelEdit={handleCancelEdit}
onSend={(text, attachments = []) =>
sendMessage(conversationId, text, attachments, replyMessage)
}
/>
</InputWrap>

<ForwardModal
visible={isForwardModalVisible}
message={selectedMessageForForward}
onClose={() => setIsForwardModalVisible(false)}
onForward={handleForward}
/>
<MediaPreviewModal
open={Boolean(previewMedia)}
media={previewMedia}
mediaList={previewMediaList}
initialIndex={previewInitialIndex}
onClose={handleCloseMediaPreview}
/>
<MenuPopover
anchorEl={pinnedMenuAnchor}
open={Boolean(pinnedMenuAnchor)}
onClose={handleClosePinnedMenu}
items={pinnedMenuItems}
/>
</Root>
);
}