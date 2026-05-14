"use client";

import { Box, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { toast } from "react-toastify";

import { chatService } from "@/src/common/service/chat-service";
import { useChatStore } from "@/src/common/store/useChatStore";
import AppAvatar from "@/src/shared/component/Avatar";

const Card = styled(Box)({
  background: "#fff",
  marginBottom: 8,
});

const TopInfo = styled(Box)({
  padding: "28px 20px 20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const NameRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 14,
  marginBottom: 18,
});

const ConversationName = styled(Typography)({
  fontSize: 18,
  fontWeight: 700,
  color: "#0F132A",
  maxWidth: 240,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const EditCircleButton = styled(IconButton)({
  width: 28,
  height: 28,
  background: "#EEF2F7",
  color: "#334155",
  "&:hover": {
    background: "#E2E8F0",
  },
});

const ActionsRow = styled(Box)({
  width: "100%",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  marginTop: 4,
});

const ActionItem = styled(Box)({
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: 8,
});

const ActionIcon = styled(IconButton)({
  width: 36,
  height: 36,
  borderRadius: 8,
  background: "#EEF2F7",
  color: "#0F172A",
  "&:hover": {
    background: "#E5F1FF",
    color: "#005AE0",
  },
});

const ActionText = styled(Typography)({
  fontSize: 12,
  color: "#0F172A",
  lineHeight: 1.35,
});

export default function ProfileCard() {
  const listConversation = useChatStore((s) => s.listConversation);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);
  const currentConversation = listConversation.find(
    (item) => item.id === activeConversationId
  );
  const isMuted = Boolean(currentConversation?.isMuted);
  const isPinned = Boolean((currentConversation as any)?.isPinned);

  const refresh = () => fetchListConversation({ page: 1, limit: 20 });

  const handleToggleMute = async () => {
    if (!activeConversationId) return;
    try {
      await chatService.updateConversationSettings(activeConversationId, {
        isMuted: !isMuted,
      });
      await refresh();
      toast.success(isMuted ? "Đã bật thông báo" : "Đã tắt thông báo");
    } catch (error) {
      toast.error("Không thể cập nhật thông báo");
    }
  };

  const handleTogglePin = async () => {
    if (!activeConversationId) return;
    try {
      if (isPinned) {
        await chatService.unpinConversation(activeConversationId);
      } else {
        await chatService.pinConversation(activeConversationId);
      }
      await refresh();
      toast.success(isPinned ? "Đã bỏ ghim hội thoại" : "Đã ghim hội thoại");
    } catch (error) {
      toast.error("Không thể cập nhật ghim");
    }
  };

  return (
    <Card>
      <TopInfo>
        <AppAvatar
          src={currentConversation?.avatarUrl ?? ""}
          name={currentConversation?.name ?? ""}
          size={58}
          fontSize={22}
        />

        <NameRow>
          <ConversationName title={currentConversation?.name ?? ""}>
            {currentConversation?.name ?? "Cuộc trò chuyện"}
          </ConversationName>

          <EditCircleButton aria-label="Đổi tên hội thoại">
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </EditCircleButton>
        </NameRow>

        <ActionsRow>
          <ActionItem>
            <ActionIcon aria-label="Tắt thông báo" onClick={handleToggleMute}>
              {isMuted ? (
                <NotificationsOffOutlinedIcon sx={{ fontSize: 20 }} />
              ) : (
                <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
              )}
            </ActionIcon>
            <ActionText>{isMuted ? "Bật thông báo" : "Tắt thông báo"}</ActionText>
          </ActionItem>

          <ActionItem>
            <ActionIcon aria-label="Ghim hội thoại" onClick={handleTogglePin}>
              {isPinned ? (
                <PushPinRoundedIcon sx={{ fontSize: 20 }} />
              ) : (
                <PushPinOutlinedIcon sx={{ fontSize: 20 }} />
              )}
            </ActionIcon>
            <ActionText>{isPinned ? "Bỏ ghim" : "Ghim hội thoại"}</ActionText>
          </ActionItem>

          <ActionItem>
            <ActionIcon aria-label="Thêm thành viên">
              <GroupAddOutlinedIcon sx={{ fontSize: 20 }} />
            </ActionIcon>
            <ActionText>Thêm thành viên</ActionText>
          </ActionItem>
        </ActionsRow>
      </TopInfo>
    </Card>
  );
}
