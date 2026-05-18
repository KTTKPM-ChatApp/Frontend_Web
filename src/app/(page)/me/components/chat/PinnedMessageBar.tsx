"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import PushPinIcon from "@mui/icons-material/PushPin";
import CloseIcon from "@mui/icons-material/Close";

const PinnedBar = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 16px",
  background: "#FFF8E7",
  borderBottom: "1px solid #FDE68A",
  minHeight: 40,
  flexShrink: 0,
});

const PinIcon = styled(PushPinIcon)({
  fontSize: 16,
  color: "#F59E0B",
  transform: "rotate(45deg)",
});

const PinnedContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const PinnedText = styled(Typography)({
  fontSize: 13,
  fontWeight: 500,
  color: "#92400E",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const PinnedMeta = styled(Typography)({
  fontSize: 11,
  color: "#B45309",
  marginTop: 1,
});

interface PinnedMessage {
  messageId: string;
  content: string;
  senderName: string;
  timestamp: string;
}

interface PinnedMessageBarProps {
  messages: PinnedMessage[];
  onUnpin?: (messageId: string) => void;
  onMessageClick?: (messageId: string) => void;
}

const PinnedMessageBarComponent: React.FC<PinnedMessageBarProps> = ({
  messages,
  onUnpin,
  onMessageClick,
}) => {
  if (messages.length === 0) return null;

  return (
    <PinnedBar>
      <PinIcon />
      <PinnedContent>
        {messages.length === 1 ? (
          <>
            <PinnedText>{messages[0].content}</PinnedText>
            <PinnedMeta>{messages[0].senderName} • {messages[0].timestamp}</PinnedMeta>
          </>
        ) : (
          <>
            <PinnedText>{messages.length} tin nhắn đã ghim</PinnedText>
            <PinnedMeta>Nhấn để xem tất cả</PinnedMeta>
          </>
        )}
      </PinnedContent>
      {messages.length === 1 && onUnpin && (
        <IconButton size="small" onClick={() => onUnpin(messages[0].messageId)} sx={{ color: "#F59E0B" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </PinnedBar>
  );
};

export default PinnedMessageBarComponent;
