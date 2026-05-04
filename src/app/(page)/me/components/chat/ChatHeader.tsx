"use client";

import { useChatStore } from "@/src/common/store/useChatStore";
import { usePresenceStore } from "@/src/common/store/usePresenceStore";
import { Box, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import AppAvatar, { buildS3Url } from "@/src/shared/component/Avatar";
import SearchIcon from "@mui/icons-material/Search";
import PhoneIcon from "@mui/icons-material/Phone";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { startCall } from "@/src/common/service/call-service";

interface ChatHeaderProps {
  title?: string;
  socketConnected: boolean;
  error?: string | null;
  conversationId: string | null;
  onToggleSearch?: () => void;
}

const HeaderRoot = styled(Box)({
  width: "100%",
  background: "#FFFFFF",
  minHeight: 70,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "0 16px",
  borderBottom: "1px solid #E5E7EB",
});

const HeaderTop = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "98%",
  gap: 12,
});

const HeaderInfo = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
});

const HeaderLeft = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 0,
});

const HeaderTitle = styled(Typography)({
  fontSize: 18,
  fontWeight: 600,
  color: "#111827",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const HeaderSubtitle = styled(Typography)({
  fontSize: 13,
  color: "#6B7280",
  lineHeight: 1.2,
  display: "flex",
  alignItems: "center",
});

const StatusDot = styled("span")<{ online?: boolean }>(({ online }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: online ? "#00C853" : "#D1D5DB",
  display: "inline-block",
  marginRight: 8,
  boxShadow: online ? "0 0 0 2px rgba(0, 200, 83, 0.1)" : "none",
}));

export default function ChatHeader({
  socketConnected,
  conversationId,
  onToggleSearch,
}: ChatHeaderProps) {
  const t = useTrans();
  const listConversation = useChatStore((s) => s.listConversation);
  const conversationDetail = useChatStore(
    (s) => s.conversationDetailById?.[conversationId || ""] ?? null
  );
  const currentUserId = useChatStore((s) => s.currentUserId);
  const presenceMap = usePresenceStore((s) => s.presenceMap);

  const currentConversation =
    conversationDetail ?? listConversation.find((n) => n.id === conversationId);

  const isGroup = currentConversation?.type === "group";
  const members = currentConversation?.members ?? [];

  const otherMember = !isGroup
    ? members.find((m) => m.userId !== currentUserId)
    : null;

  const displayName = isGroup
    ? currentConversation?.name ?? ""
    : otherMember?.nickname || otherMember?.fullName || currentConversation?.name || "";

  const otherUserId = !isGroup ? otherMember?.userId : null;
  const otherUserPresence = otherUserId ? presenceMap[otherUserId] : null;

  const getStatusText = () => {
    if (isGroup) {
      return t("CHAT.MEMBER_COUNT").replace("{count}", String(members.length));
    }

    if (!otherUserPresence) return "";

    if (otherUserPresence.status === "online") return t("CHAT.STATUS_ONLINE");
    if (!otherUserPresence.last_seen_at) return t("CHAT.STATUS_OFFLINE");

    const now = Date.now();
    const diff = now - otherUserPresence.last_seen_at;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t("CHAT.STATUS_JUST_VIEWED");
    if (minutes < 60) return t("CHAT.STATUS_MINUTES_AGO").replace("{count}", String(minutes));
    if (hours < 24) return t("CHAT.STATUS_HOURS_AGO").replace("{count}", String(hours));
    if (days < 7) return t("CHAT.STATUS_DAYS_AGO").replace("{count}", String(days));
    return new Date(otherUserPresence.last_seen_at).toLocaleDateString("vi-VN");
  };

  const isOnline = !isGroup && otherUserPresence?.status === "online";

  const handleStartAudioCall = () => {
    if (!conversationId || !currentUserId) return;
    
    const participantIds = isGroup
      ? members.filter((m) => m.userId !== currentUserId).map((m) => m.userId)
      : otherUserId ? [otherUserId] : [];
    
    startCall(conversationId, isGroup ? "group" : "direct", "audio", participantIds);
  };

  const handleStartVideoCall = () => {
    if (!conversationId || !currentUserId) return;
    
    const participantIds = isGroup
      ? members.filter((m) => m.userId !== currentUserId).map((m) => m.userId)
      : otherUserId ? [otherUserId] : [];
    
    startCall(conversationId, isGroup ? "group" : "direct", "video", participantIds);
  };

  return (
    <HeaderRoot>
      <HeaderTop>
        <HeaderInfo>
          <AppAvatar
            src={buildS3Url(currentConversation?.avatarUrl)}
            name={displayName}
            size={40}
            fontSize={16}
          />

          <HeaderLeft>
            <HeaderTitle>{displayName}</HeaderTitle>
            <HeaderSubtitle>
              {!isGroup && otherUserId ? (
                <>
                  <StatusDot online={isOnline} />
                  {getStatusText()}
                </>
              ) : (
                getStatusText()
              )}
            </HeaderSubtitle>
          </HeaderLeft>
        </HeaderInfo>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton onClick={handleStartAudioCall} sx={{ color: "#6B7280" }}>
            <PhoneIcon />
          </IconButton>
          <IconButton onClick={handleStartVideoCall} sx={{ color: "#6B7280" }}>
            <VideoCallIcon />
          </IconButton>
          {onToggleSearch && (
            <IconButton onClick={onToggleSearch} sx={{ color: "#6B7280" }}>
              <SearchIcon />
            </IconButton>
          )}
        </Box>
      </HeaderTop>
    </HeaderRoot>
  );
}