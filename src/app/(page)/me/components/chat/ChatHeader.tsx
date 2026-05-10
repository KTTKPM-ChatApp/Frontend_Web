"use client";

import { useChatStore } from "@/src/common/store/useChatStore";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PhoneIcon from "@mui/icons-material/Phone";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface ChatHeaderProps {
  title?: string;
  socketConnected: boolean;
  error?: string | null;
  conversationId: string | null
}

// ==================== STYLED COMPONENTS ====================

const ChatHeaderRoot = styled(Box)(({ theme }) => ({
  height: 70,
  minHeight: 70,
  background: "#fff",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
  zIndex: 10,
}));

const HeaderLeft = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  flex: 1,
  minWidth: 0,
}));

const ConversationInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: 1,
}));

const ConversationTitle = styled(Typography)(({ theme }) => ({
  fontSize: 18,
  fontWeight: 600,
  color: "#0F172A",
  lineHeight: 1.2,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

const ConversationSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: "#64748B",
  lineHeight: 1.2,
  display: "flex",
  alignItems: "center",
  gap: 6,
}));

const OnlineIndicator = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "#10B981",
  border: "2px solid #FFFFFF",
  position: "absolute",
  bottom: 0,
  right: 0,
}));

const OfflineIndicator = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "#94A3B8",
  border: "2px solid #FFFFFF",
  position: "absolute",
  bottom: 0,
  right: 0,
}));

const HeaderActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 10,
  color: "#64748B",
  "&:hover": {
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  flexShrink: 0,
}));

export default function ChatHeader({
  socketConnected,
  conversationId
}: ChatHeaderProps) {
  const listConversation = useChatStore((s) => s.listConversation)
  const conversation = listConversation.find((n) => n.id === conversationId);
  
  return (
    <ChatHeaderRoot>
      <HeaderLeft>
        <Box sx={{ position: "relative" }}>
          <StyledAvatar>
            {conversation?.name?.charAt(0) || "C"}
          </StyledAvatar>
          <OnlineIndicator />
        </Box>
        
        <ConversationInfo>
          <ConversationTitle>
            {conversation?.name || "Cuộc trò chuyện"}
          </ConversationTitle>
          <ConversationSubtitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: socketConnected ? "#10B981" : "#94A3B8" }} />
              {socketConnected ? "Đã kết nối" : "Mất kết nối"}
              {conversation?.memberCount && (
                <span>• {conversation.memberCount} thành viên</span>
              )}
            </Box>
          </ConversationSubtitle>
        </ConversationInfo>
      </HeaderLeft>

      <HeaderActions>
        <ActionButton>
          <PhoneIcon />
        </ActionButton>
        <ActionButton>
          <VideoCallIcon />
        </ActionButton>
        <ActionButton>
          <SearchIcon />
        </ActionButton>
        <ActionButton>
          <InfoIcon />
        </ActionButton>
        <ActionButton>
          <MoreVertIcon />
        </ActionButton>
      </HeaderActions>
    </ChatHeaderRoot>
  );
}