"use client";

import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PushPinIcon from "@mui/icons-material/PushPin";
import CloseIcon from "@mui/icons-material/Close";

// ==================== STYLED COMPONENTS ====================

const PinnedMessageBar = styled(Box)(({ theme }) => ({
  background: "#FEF3C7",
  border: "1px solid #F59E0B",
  borderRadius: 8,
  padding: "12px 16px",
  margin: "8px 16px",
  display: "flex",
  alignItems: "center",
  gap: 12,
}));

const PinnedMessageContent = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
}));

const PinnedMessageText = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: "#92400E",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

const PinnedMessageMeta = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: "#B45309",
  marginTop: 2,
}));

// ==================== TYPES ====================

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

// ==================== COMPONENT ====================

const PinnedMessageBarComponent: React.FC<PinnedMessageBarProps> = ({
  messages,
  onUnpin,
  onMessageClick,
}) => {
  if (messages.length === 0) return null;

  return (
    <PinnedMessageBar>
      <PushPinIcon sx={{ fontSize: 20, color: "#F59E0B" }} />
      
      <PinnedMessageContent>
        {messages.length === 1 ? (
          <>
            <PinnedMessageText>
              {messages[0].content}
            </PinnedMessageText>
            <PinnedMessageMeta>
              {messages[0].senderName} • {messages[0].timestamp}
            </PinnedMessageMeta>
          </>
        ) : (
          <>
            <PinnedMessageText>
              {messages.length} tin nhắn đã ghim
            </PinnedMessageText>
            <PinnedMessageMeta>
              Nhấn để xem tất cả
            </PinnedMessageMeta>
          </>
        )}
      </PinnedMessageContent>

      {messages.length === 1 && onUnpin && (
        <IconButton
          size="small"
          onClick={() => onUnpin(messages[0].messageId)}
          sx={{ color: "#F59E0B" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      {messages.length > 1 && (
        <Chip
          label={messages.length}
          size="small"
          sx={{
            backgroundColor: "#F59E0B",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 12,
          }}
        />
      )}
    </PinnedMessageBar>
  );
};

export default PinnedMessageBarComponent;
