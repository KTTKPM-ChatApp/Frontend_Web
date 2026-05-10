"use client";
import { Box, Button, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { PaginationState, UiMessage } from "@/src/common/interface/chat-interface";
import { useChatStore } from "@/src/common/store/useChatStore";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
  background: "#F7F8FA",
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

const MessageRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine",
})<{ mine?: boolean }>(({ mine }) => ({
  display: "flex",
  justifyContent: mine ? "flex-end" : "flex-start",
  alignItems: "center",
  gap: 8,
  position: "relative",

  "&:hover .message-actions": {
    opacity: 1,
    visibility: "visible",
    transform: "translateY(0)",
  },
}));

const MessageActions = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine",
})<{ mine?: boolean }>(({ mine }) => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  opacity: 0,
  visibility: "hidden",
  transform: "translateY(4px)",
  transition: "all 0.2s ease",
  pointerEvents: "auto",
  order: mine ? -1 : 1,
}));

const Bubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine",
})<{ mine?: boolean }>(({ mine }) => ({
  maxWidth: "72%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: mine ? "1px solid #D7E8FF" : "1px solid #E5E7EB",
  background: mine ? "#E5F1FF" : "#FFFFFF",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
  display: "flex",
  flexDirection: "column",
  gap: 4,
}));

const MessageText = styled(Typography)({
  fontSize: 14,
  color: "#111827",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  lineHeight: 1.5,
});

const MetaRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

const MetaLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
});

const MetaText = styled(Typography)({
  fontSize: 11,
  color: "#6B7280",
  lineHeight: 1.2,
});

const AttachmentList = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

const AttachmentItem = styled(Typography)({
  fontSize: 12,
  color: "#005AE0",
  wordBreak: "break-word",
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
    <MessagesWrap
      ref={listRef}
      onScroll={onScroll}
      showScrollbar={showScrollbar}
    >
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
          <EmptyDesc>
            Hãy bắt đầu cuộc trò chuyện bằng một tin nhắn đầu tiên.
          </EmptyDesc>
        </EmptyState>
      ) : (
        <MessagesContent>
          {
            messages.map((msg) => {
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
                  sender={mine ? undefined : {
                    id: msg.senderId,
                    name: "User", // Default name since senderName is not available
                    avatar: undefined // Avatar not available in UiMessage
                  }}
                  timestamp={timestamp}
                  isOwn={mine}
                  isDeleted={msg.isDeleted}
                  isPinned={false} // Pinned status not available in UiMessage
                  deliveryStatus="read" // Default delivery status
                  isEdited={false} // Edit status not available in UiMessage
                  reactions={[]} // Reactions not available in UiMessage
                  onReply={() => onReplyMessage(msg)}
                  onForward={() => console.log("Forward message:", msg.messageId)}
                  onPin={() => console.log("Pin message:", msg.messageId)}
                  onEdit={() => console.log("Edit message:", msg.messageId)}
                  onReact={(reaction) => console.log("React to message:", msg.messageId, reaction)}
                  onDelete={() => onDeleteMessage(conversationId, msg.messageId)}
                />
              );
            })
          }
        </MessagesContent>
      )}
    </MessagesWrap>
  );
}