"use client";

import { Box, Typography, IconButton, Tooltip, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import PushPinIcon from "@mui/icons-material/PushPin";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ImageIcon from "@mui/icons-material/Image";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import VideocamIcon from "@mui/icons-material/Videocam";
import { useMemo } from "react";
import { UiMessage } from "@/src/common/interface/chat-interface";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface PinnedMessagesSectionProps {
  pinnedMessages: UiMessage[];
  onPressMessage: (message: UiMessage) => void;
  onUnpinMessage?: (message: UiMessage) => void;
}

function getFirstImageAttachment(attachments: any[]): any | null {
  return attachments.find(a => a.type?.startsWith?.("image") || a.type === "image") || null;
}

function hasOnlyImages(attachments: any[]): boolean {
  return attachments.length > 0 && attachments.every(a => a.type?.startsWith?.("image") || a.type === "image");
}

function getTypeIcon(type?: string) {
  if (type?.startsWith?.("image")) return <ImageIcon sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }} />;
  if (type?.startsWith?.("video")) return <VideocamIcon sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }} />;
  if (type?.startsWith?.("audio")) return <AudiotrackIcon sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }} />;
  return <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }} />;
}

const Container = styled(Box)(({ theme }) => ({
  paddingBottom: 8,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const HeaderLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
});

const ScrollContent = styled(Box)({
  display: "flex",
  gap: 8,
  padding: "6px 12px",
  overflowX: "auto",
  overflowY: "hidden",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

const PinnedItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 8,
  border: `0.5px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  minWidth: 140,
  maxWidth: 180,
  cursor: "pointer",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PinnedItemLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  flex: 1,
  gap: 6,
  overflow: "hidden",
});

const UnpinButton = styled(IconButton)(({ theme }) => ({
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: theme.palette.action.hover,
  marginLeft: 6,
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

export default function PinnedMessagesSection({
  pinnedMessages,
  onPressMessage,
  onUnpinMessage,
}: PinnedMessagesSectionProps) {
  const t = useTrans();
  if (pinnedMessages.length === 0) {
    return null;
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <PushPinIcon
            sx={{
              fontSize: 14,
              color: "primary.main",
              fill: "primary.main",
            }}
          />
          <Typography variant="body2" fontWeight={600}>
            {t("CHAT.PINNED_MESSAGES")}
          </Typography>
        </HeaderLeft>
        <Typography variant="caption" color="text.secondary">
          {pinnedMessages.length}
        </Typography>
      </Header>
      <ScrollContent>
        {pinnedMessages.map((message, index) => {
          const messageText = message.body || "";
          const attachments = message.attachments || [];
          const hasAttachments = attachments.length > 0;

          return (
            <PinnedItem
              key={message.messageId || `pinned-${index}`}
              onClick={() => onPressMessage(message)}
            >
              <PinnedItemLeft>
                <PushPinIcon
                  sx={{
                    fontSize: 12,
                    color: "primary.main",
                    fill: "primary.main",
                    flexShrink: 0,
                  }}
                />
                {hasAttachments && hasOnlyImages(attachments) ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1, minWidth: 0 }}>
                    <Avatar
                      src={getFirstImageAttachment(attachments)?.thumbnailUrl || getFirstImageAttachment(attachments)?.url}
                      alt=""
                      sx={{ width: 24, height: 24, borderRadius: 0.5 }}
                      variant="rounded"
                    />
                    <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                      {attachments.length === 1 ? "Hình ảnh" : `${attachments.length} hình ảnh`}
                    </Typography>
                  </Box>
                ) : hasAttachments ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1, minWidth: 0 }}>
                    {getTypeIcon(attachments[0]?.type)}
                    <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                      {attachments[0]?.name || (messageText || "Tệp đính kèm")}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="caption" fontWeight={500} noWrap sx={{ flex: 1 }}>
                    {messageText.length > 25 ? messageText.substring(0, 25) + "..." : messageText}
                  </Typography>
                )}
              </PinnedItemLeft>
              {onUnpinMessage && (
                <Tooltip title={t("CHAT.ACTION_UNPIN")}>
                  <UnpinButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpinMessage(message);
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </UnpinButton>
                </Tooltip>
              )}
            </PinnedItem>
          );
        })}
      </ScrollContent>
    </Container>
  );
}
