"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMemo } from "react";
import { PaginationState, UiMessage } from "@/src/common/interface/chat-interface";
import { useChatStore } from "@/src/common/store/useChatStore";
import { pinMessage, unpinMessage } from "@/src/common/action/chat.action";
import MessageItem from "./MessageItem";

interface MessageListProps {
  listRef: React.RefObject<HTMLDivElement | null>;
  messages: UiMessage[];
  currentUserId: string;
  conversationId: string;
  onReplyMessage: (message: UiMessage) => void;
  pagination?: PaginationState;
  onLoadMore: (conversationId: string) => void;
  onDeleteMessage: (conversationId: string, messageId: string) => void;
  onScroll: () => void;
  showScrollbar: boolean;
  onForwardMessage?: (messageId: string, conversationId: string) => void;
  onEditMessage?: (conversationId: string, messageId: string, newBody: string, createdAt: number) => void;
  onImageClick?: (url: string) => void;
}

const MessagesWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== "showScrollbar",
})<{ showScrollbar: boolean }>(({ showScrollbar }) => ({
  flex: 1,
  overflowY: "auto",
  backgroundColor: "#FFFFFF",
  padding: "8px 0",
  display: "flex",
  flexDirection: "column",
  scrollbarGutter: "stable",
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: showScrollbar ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0)",
    borderRadius: 8,
    transition: "background-color 0.2s ease",
  },
  "&::-webkit-scrollbar-track": { background: "transparent" },
}));

const MessagesContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  marginTop: "auto",
});

const LoadMoreWrap = styled(Box)({
  display: "flex",
  justifyContent: "center",
  marginBottom: 8,
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

const EmptyTitle = styled(Typography)({ fontSize: 16, fontWeight: 600, color: "#111827" });
const EmptyDesc = styled(Typography)({ fontSize: 13, color: "#6B7280", textAlign: "center" });

const DateSeparator = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "16px 0",
});

const DateLabel = styled(Typography)({
  fontSize: 12,
  color: "#94A3B8",
  background: "#fff",
  padding: "2px 12px",
  borderRadius: 10,
  border: "1px solid #E5E7EB",
});

const formatDateLabel = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return "Hôm nay";
  if (msgDate.getTime() === yesterday.getTime()) return "Hôm qua";

  const dayNames = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dayName = dayNames[date.getDay()];
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  if (date.getFullYear() === now.getFullYear()) {
    return `${dayName}, ${dd}/${mm}`;
  }
  return `${dayName}, ${dd}/${mm}/${yyyy}`;
};

export default function MessageList({
  listRef,
  messages,
  currentUserId,
  conversationId,
  onReplyMessage,
  pagination,
  onDeleteMessage,
  onScroll,
  showScrollbar,
  onForwardMessage,
  onEditMessage,
  onImageClick,
}: MessageListProps) {
  const paginationByConversation = useChatStore((s) => s.paginationByConversation);
  const pinnedMessagesMap = useChatStore((s) => s.pinnedMessagesByConversation);
  const pinnedMessages = pinnedMessagesMap[conversationId] || [];
  
  const pinnedMessageIds = useMemo(() => {
    return new Set(pinnedMessages.map((p: any) => p.messageId));
  }, [pinnedMessages]);
  
  const isMessagePinned = (messageId: string): boolean => {
    return pinnedMessageIds.has(messageId);
  };

  const shouldShowDateSeparator = (msg: UiMessage, index: number): boolean => {
    if (index === 0) return true;
    const prev = messages[index - 1];
    const prevDate = new Date(prev.createdAt).toDateString();
    const currDate = new Date(msg.createdAt).toDateString();
    return prevDate !== currDate;
  };

  const shouldGroupWithPrev = (msg: UiMessage, index: number): boolean => {
    if (index === 0) return false;
    const prev = messages[index - 1];
    if (msg.senderId !== prev.senderId) return false;
    const diff = msg.createdAt - prev.createdAt;
    return diff < 300000;
  };

  return (
    <MessagesWrap ref={listRef} onScroll={onScroll} showScrollbar={showScrollbar}>
      {paginationByConversation[conversationId]?.loadingMore && (
        <LoadMoreWrap><CircularProgress size={18} /></LoadMoreWrap>
      )}

      {paginationByConversation[conversationId]?.loading ? (
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
          {messages.map((msg, index) => {
            const mine = msg.senderId === currentUserId;
            const grouped = shouldGroupWithPrev(msg, index);

            return (
              <Box key={msg.messageId} id={`msg-${msg.messageId}`}>
                {shouldShowDateSeparator(msg, index) && (
                  <DateSeparator>
                    <DateLabel>{formatDateLabel(msg.createdAt)}</DateLabel>
                  </DateSeparator>
                )}
                <MessageItem
                  id={msg.messageId}
                  content={msg.isDeleted ? "Tin nhắn đã được thu hồi" : msg.body}
                  sender={
                    mine ? undefined : {
                      id: msg.senderId,
                      name: msg.senderName || "User",
                      avatar: undefined,
                    }
                  }
                  timestamp={new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  isOwn={mine}
                  isDeleted={msg.isDeleted}
                  isPinned={isMessagePinned(msg.messageId)}
                  isEdited={Boolean(msg.editedAt)}
                  isGrouped={grouped}
                  deliveryStatus="read"
                  replyTo={msg.replyTo || null}
                  attachments={msg.attachments}
                  reactions={[]}
                  onReply={() => onReplyMessage(msg)}
                  onForward={() => onForwardMessage?.(msg.messageId, conversationId)}
                  onPin={() => pinMessage(conversationId, msg.messageId, msg.createdAt)}
                  onUnpin={() => unpinMessage(conversationId, msg.messageId, msg.createdAt)}
                  onEdit={(newContent) => onEditMessage?.(conversationId, msg.messageId, newContent, msg.createdAt)}
                  onReact={(reaction) => console.log("React to message:", msg.messageId, reaction)}
                  onImageClick={(url) => onImageClick?.(url)}
                  onDelete={() => onDeleteMessage(conversationId, msg.messageId)}
                />
              </Box>
            );
          })}
        </MessagesContent>
      )}
    </MessagesWrap>
  );
}
