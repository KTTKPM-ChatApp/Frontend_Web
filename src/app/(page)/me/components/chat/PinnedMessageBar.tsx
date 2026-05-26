"use client";

import React, { useState } from "react";
import { Box, Typography, IconButton, Paper, List, ListItem, ListItemText, ListItemIcon, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import PushPinIcon from "@mui/icons-material/PushPin";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ImageIcon from "@mui/icons-material/Image";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import VideocamIcon from "@mui/icons-material/Videocam";

const PinnedBar = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 12px",
  background: "linear-gradient(90deg, #E3F2FD 0%, #BBDEFB 100%)",
  minHeight: 36,
  flexShrink: 0,
  cursor: "pointer",
  position: "relative",
  "&:hover": {
    background: "linear-gradient(90deg, #BBDEFB 0%, #90CAF9 100%)",
  },
});

const PinIcon = styled(PushPinIcon)({
  fontSize: 14,
  color: "#1976D2",
  transform: "rotate(45deg)",
});

const PinnedContent = styled(Box)({
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  gap: 6,
});

const PinnedText = styled(Typography)({
  fontSize: 13,
  color: "#1565C0",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const PinnedCount = styled(Box)({
  fontSize: 12,
  color: "#1565C0",
  fontWeight: 500,
});

const ExpandIcon = styled(ExpandMoreIcon)({
  fontSize: 18,
  color: "#1976D2",
  transition: "transform 0.2s",
});

const DropdownContainer = styled(Paper)({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  maxHeight: 250,
  overflow: "auto",
  zIndex: 1000,
  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
  background: "#fff",
  borderRadius: "0 0 8px 8px",
});

const DropdownItem = styled(ListItem)({
  padding: "8px 12px",
  borderBottom: "1px solid #E3F2FD",
  cursor: "pointer",
  "&:hover": {
    background: "#F5F9FF",
  },
});

const FileIcon = styled(InsertDriveFileOutlinedIcon)({
  fontSize: 18,
  color: "#1565C0",
  flexShrink: 0,
});

const UnpinButton = styled(IconButton)({
  padding: 4,
  "&:hover": {
    backgroundColor: "rgba(25, 118, 210, 0.1)",
  },
});

interface Attachment {
  type?: string;
  name?: string;
  url?: string;
  thumbnailUrl?: string;
}

interface PinnedMessage {
  messageId: string;
  content?: string;
  body?: string;
  senderName?: string;
  senderId?: string;
  timestamp?: string;
  createdAt?: number;
  attachments?: Attachment[];
  pinnedBy?: string;
  pinnedAt?: number;
  message?: {
    body?: string;
    senderId?: string;
    createdAt?: number;
    attachments?: Attachment[];
  };
}

interface PinnedMessageBarProps {
  messages: PinnedMessage[];
  onUnpin?: (messageId: string, createdAt?: number) => void;
  onMessageClick?: (messageId: string) => void;
  currentUserId?: string;
}

function getAttachments(msg: PinnedMessage): Attachment[] {
  return msg.attachments || msg.message?.attachments || [];
}

function getFirstImageAttachment(attachments: Attachment[]): Attachment | null {
  return attachments.find(a => a.type?.startsWith?.("image") || a.type === "image") || null;
}

function hasOnlyImages(attachments: Attachment[]): boolean {
  return attachments.length > 0 && attachments.every(a => a.type?.startsWith?.("image") || a.type === "image");
}

function getAttachmentTypeIcon(type?: string) {
  if (type?.startsWith?.("image")) return <ImageIcon sx={{ fontSize: 18, color: "#1565C0", flexShrink: 0 }} />;
  if (type?.startsWith?.("video")) return <VideocamIcon sx={{ fontSize: 18, color: "#1565C0", flexShrink: 0 }} />;
  if (type?.startsWith?.("audio")) return <AudiotrackIcon sx={{ fontSize: 18, color: "#1565C0", flexShrink: 0 }} />;
  return <FileIcon />;
}

function renderAttachmentPreview(attachments: Attachment[]) {
  if (attachments.length === 0) return null;

  if (hasOnlyImages(attachments)) {
    const first = attachments[0];
    const imgUrl = first?.thumbnailUrl || first?.url;
    if (imgUrl) {
      return (
        <Avatar
          src={imgUrl}
          alt=""
          sx={{ width: 28, height: 28, borderRadius: 1 }}
          variant="rounded"
        />
      );
    }
    return getAttachmentTypeIcon("image");
  }

  const first = attachments[0];
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
      {getAttachmentTypeIcon(first?.type)}
      <Typography
        sx={{
          fontSize: 12,
          color: "#1565C0",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {first?.name || "Tệp"}
      </Typography>
    </Box>
  );
}

function getSinglePreviewLabel(attachments: Attachment[]): string {
  if (attachments.length === 0) return "Tin nhắn đã ghim";
  if (hasOnlyImages(attachments)) {
    return attachments.length === 1 ? "1 hình ảnh" : `${attachments.length} hình ảnh`;
  }
  return attachments.length === 1 ? "1 tệp đính kèm" : `${attachments.length} tệp`;
}

export default function PinnedMessageBar({
  messages,
  onUnpin,
  onMessageClick,
  currentUserId,
}: PinnedMessageBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (messages.length === 0) return null;

  const handleClick = () => {
    if (messages.length > 1) {
      setIsOpen(!isOpen);
    } else if (onMessageClick) {
      onMessageClick(messages[0].messageId);
    }
  };

  const handleUnpin = (e: React.MouseEvent, msg: PinnedMessage) => {
    e.stopPropagation();
    if (onUnpin) {
      onUnpin(msg.messageId, msg.createdAt);
    }
    if (messages.length === 2) {
      setIsOpen(false);
    }
  };

  const handleItemClick = (msgId: string) => {
    if (onMessageClick) {
      onMessageClick(msgId);
    }
    setIsOpen(false);
  };

  const renderSinglePreview = (msg: PinnedMessage) => {
    const text = msg.content || msg.body || msg.message?.body || "";
    const attachments = getAttachments(msg);

    if (text) {
      return <PinnedText>{text}</PinnedText>;
    }

    if (attachments.length > 0) {
      return renderAttachmentPreview(attachments);
    }

    return <PinnedText>Tin nhắn đã ghim</PinnedText>;
  };

  const firstMsg = messages[0];

  return (
    <Box sx={{ position: "relative" }}>
      <PinnedBar onClick={handleClick}>
        <PinIcon />
        <PinnedContent>
          {messages.length === 1 ? (
            renderSinglePreview(firstMsg)
          ) : (
            <PinnedCount>{getSinglePreviewLabel(getAttachments(firstMsg))}</PinnedCount>
          )}
        </PinnedContent>
        {messages.length > 1 && (
          <ExpandIcon sx={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
        )}
        {messages.length === 1 && (
          <UnpinButton 
            size="small" 
            onClick={(e) => handleUnpin(e, firstMsg)}
            sx={{ color: "#1976D2" }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </UnpinButton>
        )}
      </PinnedBar>

      {isOpen && messages.length > 1 && (
        <DropdownContainer>
          <Box sx={{ padding: "6px 12px", borderBottom: "1px solid #E3F2FD", background: "#F5F9FF" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1565C0" }}>
              Tin nhắn đã ghim ({messages.length})
            </Typography>
          </Box>
          <List dense disablePadding>
            {messages.map((msg, index) => (
              <DropdownItem
                key={msg.messageId || index}
                onClick={() => handleItemClick(msg.messageId)}
                secondaryAction={
                  <UnpinButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleUnpin(e, msg)}
                    sx={{ color: "#757575" }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </UnpinButton>
                }
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <PushPinIcon sx={{ fontSize: 12, color: "#1976D2", transform: "rotate(45deg)" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                      {renderAttachmentPreview(getAttachments(msg)) || (
                        <Typography sx={{ fontSize: 13, color: "#212121", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {msg.content || msg.body || msg.message?.body || "Tin nhắn đã ghim"}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </DropdownItem>
            ))}
          </List>
        </DropdownContainer>
      )}
    </Box>
  );
}