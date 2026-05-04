"use client";

import { Box, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import PushPinIcon from "@mui/icons-material/PushPin";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { UiMessage } from "@/src/common/interface/chat-interface";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface PinnedBarProps {
  message: UiMessage;
  totalCount: number;
  onExpand: () => void;
  onMenuClick: (message: UiMessage, event?: React.MouseEvent<HTMLElement>) => void;
}

const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  backgroundColor: "#F7F8FA",
  borderBottom: "1px solid #E5E7EB",
  cursor: "pointer",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: "#F0F2F5",
  },
}));

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
  gap: 8,
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

const CountBadge = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "2px 8px",
  backgroundColor: "#E5E7EB",
  borderRadius: 4,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#D1D5DB",
  },
});

const CountText = styled(Typography)({
  fontSize: 12,
  fontWeight: 500,
  color: "#111827",
});

const MenuButton = styled(IconButton)({
  padding: 4,
  color: "#6B7280",
  "&:hover": {
    color: "#111827",
    backgroundColor: "#E5E7EB",
  },
});

export default function PinnedBar({
  message,
  totalCount,
  onExpand,
  onMenuClick,
}: PinnedBarProps) {
  const t = useTrans();
  const messageText = message.body || "";
  const hasAttachments = message.attachments && message.attachments.length > 0;

  let previewText = messageText;
  if (!previewText) {
    if (hasAttachments) previewText = t("CHAT.FILE_ATTACHMENT");
    else previewText = t("CHAT.MESSAGE");
  }

  const truncatedText =
    previewText.length > 40 ? previewText.substring(0, 40) + "..." : previewText;

  const senderName = t("CHAT.YOU"); // TODO: Get actual sender name from conversation members

  return (
    <Container onClick={onExpand}>
      <LeftSection>
        <MessageIcon>
          <PushPinIcon sx={{ fontSize: 16 }} />
        </MessageIcon>
        <Label>{t("CHAT.MESSAGE")}</Label>
        <Content>
          <SenderName>{senderName}:</SenderName>
          <MessagePreview>{truncatedText}</MessagePreview>
        </Content>
      </LeftSection>
      <RightSection>
        {totalCount > 1 && (
          <CountBadge onClick={(e) => { e.stopPropagation(); onExpand(); }}>
            <CountText>{t("CHAT.PIN_COUNT").replace("{count}", String(totalCount))}</CountText>
            <ExpandMoreIcon sx={{ fontSize: 16, color: "#fff" }} />
          </CountBadge>
        )}
        <MenuButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick(message, e);
          }}
        >
          <MoreVertIcon sx={{ fontSize: 18 }} />
        </MenuButton>
      </RightSection>
    </Container>
  );
}
