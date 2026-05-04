"use client";

import type { RefObject } from "react";
import { CircularProgress, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { UiMessage } from "@/src/common/interface/chat-interface";
import { useChatStore } from "@/src/common/store/useChatStore";
import MessageItem from "./MessageItem";
import SystemMessageBanner from "./message-system/SystemMessageBanner";
import { MediaPreviewItem } from "@/src/shared/component/MediaPreviewModal";

interface MessageListProps {
  listRef: RefObject<HTMLDivElement | null>;
  messages: UiMessage[];
  currentUserId: string;
  conversationId: string;
  onReplyMessage: (message: UiMessage) => void;
  onScroll: () => void;
  showScrollbar: boolean;
  onMediaLoad?: (messageId: UiMessage["messageId"]) => void;
  onForwardMessage: (message: UiMessage) => void;
  highlightedMessageId?: string | null;
  onOpenMedia?: (media: MediaPreviewItem, allMedia?: MediaPreviewItem[], initialIndex?: number) => void;
}

const MessagesWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== "showScrollbar",
})<{ showScrollbar: boolean }>(({ showScrollbar }) => ({
  flex: 1,
  overflowY: "auto",
  background: "#EBECF0",
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  scrollbarGutter: "stable",
  "&::-webkit-scrollbar": {
    width: 8,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: showScrollbar ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0)",
    borderRadius: 8,
    transition: "background-color 0.2s ease",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-corner": {
    background: "transparent",
  },
}));

const MessagesContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: "auto",
});

const LoadMoreWrap = styled(Box)({
  display: "flex",
  justifyContent: "center",
  marginBottom: 4,
});

const EmptyState = styled(Box)({
  flex: 1,
  minHeight: 240,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: 8,
});

const EmptyTitle = styled(Typography)({
  fontSize: 16,
  fontWeight: 600,
  color: "#111827",
});

const EmptyDesc = styled(Typography)({
  fontSize: 13,
  color: "#6B7280",
  textAlign: "center",
});

export default function MessageList({
  listRef,
  messages,
  currentUserId,
  conversationId,
  onReplyMessage,
  onScroll,
  showScrollbar,
  onMediaLoad,
  onForwardMessage,
  highlightedMessageId,
  onOpenMedia,
}: MessageListProps) {
  const paginationByConversation = useChatStore((s) => s.paginationByConversation);
  const deleteMessage = useChatStore((s) => s.deleteMessage);

  const scrollToRepliedMessage = (
    targetMessageId?: UiMessage["messageId"] | null
  ) => {
    if (targetMessageId === null || targetMessageId === undefined) return;

    const wrap = listRef.current;
    if (!wrap) return;

    const target = wrap.querySelector(
      `[data-message-id="${String(targetMessageId)}"]`
    ) as HTMLDivElement | null;

    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    target.classList.add("reply-target-highlight");

    window.setTimeout(() => {
      target.classList.remove("reply-target-highlight");
    }, 1600);
  };

  const loadingMore = paginationByConversation[conversationId]?.loadingMore;
  const loading = paginationByConversation[conversationId]?.loading;

  return (
    <MessagesWrap ref={listRef} onScroll={onScroll} showScrollbar={showScrollbar}>
      {loadingMore && (
        <LoadMoreWrap>
          <CircularProgress size={18} />
        </LoadMoreWrap>
      )}

      {loading ? (
        <EmptyState>
          <CircularProgress size={28} />
          <EmptyDesc>Đang tải tin nhắn...</EmptyDesc>
        </EmptyState>
      ) : messages.length === 0 ? (
        <EmptyState>
          <EmptyTitle>Chưa có tin nhắn</EmptyTitle>
          <EmptyDesc>Hãy bắt đầu cuộc trò chuyện bằng một tin nhắn đầu tiên.</EmptyDesc>
        </EmptyState>
      ) : (
        <MessagesContent>
          {messages.map((message) => {
            const isSystemMessage = message.type === 'system' || message.senderId === 'SYSTEM';

            if (isSystemMessage) {
              return <SystemMessageBanner key={message.messageId} message={message} />;
            }

            return (
              <MessageItem
                key={message.messageId}
                message={message}
                currentUserId={currentUserId}
                onReplyMessage={onReplyMessage}
                onDeleteMessage={deleteMessage}
                onScrollToMessage={scrollToRepliedMessage}
                onMediaLoad={onMediaLoad}
                onForwardMessage={onForwardMessage}
                isHighlighted={message.messageId === highlightedMessageId}
                onOpenMedia={onOpenMedia}
              />
            );
          })}
        </MessagesContent>
      )}
    </MessagesWrap>
  );
}