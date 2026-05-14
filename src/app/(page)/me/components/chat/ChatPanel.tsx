"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useChatStore } from "@/src/common/store/useChatStore";
import {
  deleteMessage,
  initChat,
  loadMoreMessages,
  openConversation,
  sendMessage,
} from "@/src/common/action/chat.action";
import { UiMessage } from "@/src/common/interface/chat-interface";

interface ChatPanelProps {
  accessToken: string;
  currentUserId: string;
  conversationId: string;
  title?: string;
  onToggleSearch?: () => void;
  onToggleInfo?: () => void;
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
});

export default function ChatPanel({
  accessToken,
  currentUserId,
  conversationId,
  title,
  onToggleSearch,
  onToggleInfo,
}: ChatPanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  const isAutoScrollingRef = useRef(false);
  const scrollHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prevConversationIdRef = useRef<string | null>(null);
  const prevFirstMessageIdRef = useRef<string | null>(null);
  const prevLastMessageIdRef = useRef<string | null>(null);

  const isLoadingMoreRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  const scrollIntentRef = useRef<"none" | "open" | "load-more">("none");

  const [showScrollbar, setShowScrollbar] = useState(false);
  const [replyMessageId,setReplyMessageId] = useState<string | null>(null)
  const {
    socketConnected,
    messagesByConversation,
    paginationByConversation,
    error,
  } = useChatStore();

  const messages = useMemo(
    () => messagesByConversation[conversationId] || [],
    [messagesByConversation, conversationId]
  );

  const pagination = paginationByConversation[conversationId];
  const loadingMore = pagination?.loadingMore;
  const loading = pagination?.loading;

  const firstMessageId = messages[0]?.messageId ?? null;
  const lastMessageId = messages[messages.length - 1]?.messageId ?? null;

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

  const isNearBottom = () => {
    const wrap = listRef.current;
    if (!wrap) return false;

    const threshold = 120;
    return wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight <= threshold;
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
    if (scrollHideTimeoutRef.current) clearTimeout(scrollHideTimeoutRef.current);
    scrollHideTimeoutRef.current = setTimeout(() => setShowScrollbar(false), 800);

    if (scrollIntentRef.current === "none" && wrap.scrollTop <= 80) {
      void tryLoadMore();
    }
  };
  const handleReplyMessage = (msgId: UiMessage) => {
    setReplyMessageId(msgId.messageId);
  };
  useEffect(() => {
    if (!accessToken || !currentUserId) return;
    initChat(accessToken, currentUserId);
  }, [accessToken, currentUserId]);

  useEffect(() => {
    if (!conversationId) return;
    prevConversationIdRef.current = conversationId;
    scrollIntentRef.current = "open";
    isLoadingMoreRef.current = false;
    prevScrollHeightRef.current = 0;
    prevFirstMessageIdRef.current = null;
    prevLastMessageIdRef.current = null;

    openConversation(conversationId);
  }, [conversationId]);

  useLayoutEffect(() => {
    const wrap = listRef.current;
    if (!wrap) return;

    const intent = scrollIntentRef.current;
    // Case 1: Vào conversation / đổi conversation
    if (intent === "open" && !loading && !loadingMore && messages.length > 0) {
      console.log("[layoutEffect:open -> scroll bottom]");
      scrollToBottomStable();
      scrollIntentRef.current = "none";
      prevFirstMessageIdRef.current = firstMessageId;
      prevLastMessageIdRef.current = lastMessageId;
      return;
    }

    // Case 2: Load more xong -> giữ vị trí đọc
    if (intent === "load-more" && !loadingMore) {
      console.log("[layoutEffect:load-more -> keep current position]", {
        scrollTopCurrent: wrap.scrollTop,
        scrollHeightCurrent: wrap.scrollHeight,
      });

      isLoadingMoreRef.current = false;
      scrollIntentRef.current = "none";

      prevFirstMessageIdRef.current = firstMessageId;
      prevLastMessageIdRef.current = lastMessageId;
      return;
    }
    // Case 3: Tin nhắn mới append (intent = "none", lastMessageId thay đổi)
    if (intent === "none" && !isLoadingMoreRef.current) {
      const prevLastMessageId = prevLastMessageIdRef.current;
      const isAppendedNewMessage =
        !!prevLastMessageId &&
        !!lastMessageId &&
        prevLastMessageId !== lastMessageId;

      if (isAppendedNewMessage && !loading && !loadingMore) {
        const lastMessage = messages[messages.length - 1];
        const isOwnMessage = lastMessage?.senderId === currentUserId;

        if (isOwnMessage || isNearBottom()) {
          requestAnimationFrame(() => scrollToBottomStable());
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
          socketConnected={socketConnected}
          error={error}
          onToggleSearch={onToggleSearch}
          onToggleInfo={onToggleInfo}
        />
      </HeaderWrap>

      <MessageListWrap>
        <MessageList
          listRef={listRef}
          messages={messages}
          onReplyMessage={handleReplyMessage}
          currentUserId={currentUserId}
          conversationId={conversationId}
          pagination={pagination}
          onLoadMore={loadMoreMessages}
          onDeleteMessage={deleteMessage}
          onScroll={handleScroll}
          showScrollbar={showScrollbar}
        />
      </MessageListWrap>

      <InputWrap>
        <ChatInput
          disabled={false}
          onSend={(text) => sendMessage(conversationId, text)}
        />
      </InputWrap>
    </Root>
  );
}
