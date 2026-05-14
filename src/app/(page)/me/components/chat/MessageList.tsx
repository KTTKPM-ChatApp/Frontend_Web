"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { PaginationState, UiMessage } from "@/src/common/interface/chat-interface";
import { useChatStore } from "@/src/common/store/useChatStore";
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
}

const MessagesWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== "showScrollbar",
})<{ showScrollbar: boolean }>(({ showScrollbar }) => ({
  flex: 1,
  overflowY: "auto",
  backgroundColor: "#F7F8FA",
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(100,116,139,0.10) 1px, transparent 0)",
  backgroundSize: "16px 16px",
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
  onDeleteMessage,
  onScroll,
  showScrollbar,
}: MessageListProps) {
  const paginationByConversation = useChatStore((s) => s.paginationByConversation);

  return (
    <MessagesWrap ref={listRef} onScroll={onScroll} showScrollbar={showScrollbar}>
      {paginationByConversation[conversationId]?.loadingMore && (
        <LoadMoreWrap>
          <CircularProgress size={18} />
        </LoadMoreWrap>
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
          {messages.map((msg) => {
            const mine = msg.senderId === currentUserId;
            const timestamp = new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <MessageItem
                key={msg.messageId}
                id={msg.messageId}
                content={msg.isDeleted ? "Tin nhắn đã được thu hồi" : msg.body}
                sender={
                  mine
                    ? undefined
                    : {
                        id: msg.senderId,
                        name: "User",
                        avatar: undefined,
                      }
                }
                timestamp={timestamp}
                isOwn={mine}
                isDeleted={msg.isDeleted}
                isPinned={false}
                deliveryStatus="read"
                isEdited={false}
                reactions={[]}
                onReply={() => onReplyMessage(msg)}
                onForward={() => console.log("Forward message:", msg.messageId)}
                onPin={() => console.log("Pin message:", msg.messageId)}
                onEdit={() => console.log("Edit message:", msg.messageId)}
                onReact={(reaction) => console.log("React to message:", msg.messageId, reaction)}
                onDelete={() => onDeleteMessage(conversationId, msg.messageId)}
              />
            );
          })}
        </MessagesContent>
      )}
    </MessagesWrap>
  );
}
