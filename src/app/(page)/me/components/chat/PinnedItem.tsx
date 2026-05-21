"use client";

import { Box, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import PushPinIcon from "@mui/icons-material/PushPin";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { UiMessage, ConversationMemberDto } from "@/src/common/interface/chat-interface";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface PinnedItemProps {
  message: UiMessage;
  members?: ConversationMemberDto[];
  currentUserId?: string;
  onPress: () => void;
  onUnpin: () => void;
  onMenu: (event?: React.MouseEvent<HTMLElement>) => void;
}

const Container = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  cursor: "pointer",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: "#F0F2F5",
  },
});

const LeftSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  flex: 1,
  overflow: "hidden",
});

const RightSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  flexShrink: 0,
});

const MessageIcon = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#005AE0",
});

const Label = styled(Typography)({
  fontSize: 13,
  fontWeight: 500,
  color: "#111827",
  whiteSpace: "nowrap",
});

const Content = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  flex: 1,
  overflow: "hidden",
});

const SenderName = styled(Typography)({
  fontSize: 13,
  fontWeight: 600,
  color: "#111827",
  whiteSpace: "nowrap",
});

const MessagePreview = styled(Typography)({
  fontSize: 13,
  color: "#6B7280",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  flex: 1,
});

const MenuButton = styled(IconButton)({
  padding: 4,
  color: "#6B7280",
  "&:hover": {
    color: "#111827",
    backgroundColor: "#E5E7EB",
  },
});

export default function PinnedItem({
  message,
  members,
  currentUserId,
  onPress,
  onUnpin,
  onMenu,
}: PinnedItemProps) {
  const t = useTrans();
  const messageText = message.body || "";
  const hasAttachments = message.attachments && message.attachments.length > 0;

  let previewText = messageText;
  if (!previewText) {
    if (hasAttachments) previewText = t("CHAT.FILE_ATTACHMENT");
    else previewText = t("CHAT.MESSAGE");
  }

  const truncatedText =
    previewText.length > 50 ? previewText.substring(0, 50) + "..." : previewText;

  // Get sender name from members
  const sender = members?.find((m) => m.userId === message.senderId);
  const senderName = message.senderId === currentUserId
    ? t("CHAT.YOU")
    : (sender?.nickname || sender?.displayName || sender?.username || t("CHAT.USER"));

  return (
    <Container onClick={onPress}>
      <LeftSection>
        <MessageIcon>
          <PushPinIcon sx={{ fontSize: 14 }} />
        </MessageIcon>
        <Label>{t("CHAT.MESSAGE")}</Label>
        <Content>
          <SenderName>{senderName}:</SenderName>
          <MessagePreview>{truncatedText}</MessagePreview>
        </Content>
      </LeftSection>
      <RightSection>
        <MenuButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMenu(e);
          }}
        >
          <MoreVertIcon sx={{ fontSize: 18 }} />
        </MenuButton>
      </RightSection>
    </Container>
  );
}
