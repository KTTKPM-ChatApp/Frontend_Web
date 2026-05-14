"use client";

import { useChatStore } from "@/src/common/store/useChatStore";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import PhoneIcon from "@mui/icons-material/Phone";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface ChatHeaderProps {
  socketConnected: boolean;
  error?: string | null;
  conversationId: string | null;
  onToggleSearch?: () => void;
  onToggleInfo?: () => void;
}

const ChatHeaderRoot = styled(Box)({
  height: 68,
  minHeight: 68,
  background: "#FFFFFF",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 14px",
  zIndex: 10,
});

const HeaderLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  flex: 1,
  minWidth: 0,
});

const ConversationInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: 1,
});

const ConversationTitle = styled(Typography)({
  fontSize: 16,
  fontWeight: 700,
  color: "#111827",
  lineHeight: 1.25,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const ConversationSubtitle = styled(Typography)({
  fontSize: 12,
  color: "#6B7280",
  lineHeight: 1.2,
  display: "flex",
  alignItems: "center",
  gap: 6,
}) as typeof Typography;

const StatusDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "connected",
})<{ connected?: boolean }>(({ connected }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: connected ? "#22C55E" : "#9CA3AF",
  flexShrink: 0,
}));

const HeaderActions = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
});

const ActionButton = styled(IconButton)({
  width: 36,
  height: 36,
  borderRadius: 8,
  color: "#4B5563",
  "&:hover": {
    backgroundColor: "#F3F4F6",
    color: "#111827",
  },
});

const StyledAvatar = styled(Avatar)({
  width: 40,
  height: 40,
  flexShrink: 0,
  background: "#E0ECFF",
  color: "#0A56CC",
  fontWeight: 700,
});

export default function ChatHeader({
  socketConnected,
  conversationId,
  onToggleSearch,
  onToggleInfo,
}: ChatHeaderProps) {
  const listConversation = useChatStore((s) => s.listConversation);
  const conversation = listConversation.find((item) => item.id === conversationId);
  const memberText =
    conversation?.type === "group"
      ? `${conversation.memberCount ?? 0} thành viên`
      : "Tin nhắn trực tiếp";

  return (
    <ChatHeaderRoot>
      <HeaderLeft>
        <StyledAvatar src={conversation?.avatarUrl ?? undefined}>
          {conversation?.name?.charAt(0)?.toUpperCase() || "C"}
        </StyledAvatar>

        <ConversationInfo>
          <ConversationTitle>{conversation?.name || "Cuộc trò chuyện"}</ConversationTitle>
          <ConversationSubtitle component="span">
            <StatusDot connected={socketConnected} />
            <span>{socketConnected ? "Đã kết nối" : "Mất kết nối"}</span>
            <span>•</span>
            <span>{memberText}</span>
          </ConversationSubtitle>
        </ConversationInfo>
      </HeaderLeft>

      <HeaderActions>
        <ActionButton aria-label="Gọi thoại">
          <PhoneIcon fontSize="small" />
        </ActionButton>
        <ActionButton aria-label="Gọi video">
          <VideoCallIcon fontSize="small" />
        </ActionButton>
        <ActionButton aria-label="Tìm trong hội thoại" onClick={onToggleSearch}>
          <SearchIcon fontSize="small" />
        </ActionButton>
        <ActionButton aria-label="Thông tin hội thoại" onClick={onToggleInfo}>
          <InfoIcon fontSize="small" />
        </ActionButton>
        <ActionButton aria-label="Tùy chọn hội thoại">
          <MoreVertIcon fontSize="small" />
        </ActionButton>
      </HeaderActions>
    </ChatHeaderRoot>
  );
}
