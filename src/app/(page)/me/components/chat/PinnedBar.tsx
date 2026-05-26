"use client";

import {
  Box,
  IconButton,
  Typography,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PushPinIcon from "@mui/icons-material/PushPin";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ImageIcon from "@mui/icons-material/Image";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import VideocamIcon from "@mui/icons-material/Videocam";

const PinnedContainer = styled(Box)({
  height: 48,
  minHeight: 48,
  maxHeight: 48,
  background: "#FEF3C7",
  borderBottom: "1px solid #FDE68A",
  display: "flex",
  alignItems: "center",
  padding: "0 16px",
  gap: 12,
});

const PinnedIcon = styled(PushPinIcon)({
  fontSize: 18,
  color: "#D97706",
  transform: "rotate(45deg)",
});

const PinnedSender = styled(Typography)({
  fontSize: 12,
  color: "#B45309",
  fontWeight: 600,
  marginRight: 8,
  flexShrink: 0,
});

const ExpandButton = styled(IconButton)({
  width: 24,
  height: 24,
  color: "#D97706",
});

const CloseButton = styled(IconButton)({
  width: 24,
  height: 24,
  color: "#D97706",
});

interface PinnedAttachment {
  type?: string;
  name?: string;
  url?: string;
  thumbnailUrl?: string;
}

interface PinnedMessageData {
  id: string;
  content?: string;
  body?: string;
  sender?: { name: string };
  senderName?: string;
  timestamp?: string;
  attachments?: PinnedAttachment[];
}

interface PinnedBarProps {
  pinnedMessage?: PinnedMessageData;
  onExpand?: () => void;
  onClose?: () => void;
}

function getTypeIcon(type?: string, size = 18) {
  if (type?.startsWith?.("image")) return <ImageIcon sx={{ fontSize: size, color: "#D97706", flexShrink: 0 }} />;
  if (type?.startsWith?.("video")) return <VideocamIcon sx={{ fontSize: size, color: "#D97706", flexShrink: 0 }} />;
  if (type?.startsWith?.("audio")) return <AudiotrackIcon sx={{ fontSize: size, color: "#D97706", flexShrink: 0 }} />;
  return <InsertDriveFileOutlinedIcon sx={{ fontSize: size, color: "#D97706", flexShrink: 0 }} />;
}

function hasOnlyImages(attachments: PinnedAttachment[]): boolean {
  return attachments.length > 0 && attachments.every(a => a.type?.startsWith?.("image") || a.type === "image");
}

function getFirstImage(attachments: PinnedAttachment[]): PinnedAttachment | null {
  return attachments.find(a => a.type?.startsWith?.("image") || a.type === "image") || null;
}

const PinnedBar: React.FC<PinnedBarProps> = ({
  pinnedMessage,
  onExpand = () => {},
  onClose = () => {},
}) => {
  if (!pinnedMessage) return null;

  const text = pinnedMessage.content || pinnedMessage.body || "";
  const attachments = pinnedMessage.attachments || [];
  const senderName = pinnedMessage.sender?.name || pinnedMessage.senderName || "";

  return (
    <PinnedContainer>
      <PinnedIcon />

      {senderName && (
        <PinnedSender variant="caption">
          {senderName}
        </PinnedSender>
      )}

      {text ? (
        <Typography
          sx={{
            fontSize: 14,
            color: "#92400E",
            fontWeight: 500,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </Typography>
      ) : attachments.length > 0 ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
          {hasOnlyImages(attachments) ? (
            <>
              <Avatar
                src={getFirstImage(attachments)?.thumbnailUrl || getFirstImage(attachments)?.url}
                alt=""
                sx={{ width: 30, height: 30, borderRadius: 0.5 }}
                variant="rounded"
              />
              <Typography sx={{ fontSize: 13, color: "#92400E", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {attachments.length === 1 ? "Hình ảnh" : `${attachments.length} hình ảnh`}
              </Typography>
            </>
          ) : (
            <>
              {getTypeIcon(attachments[0]?.type)}
              <Typography sx={{ fontSize: 13, color: "#92400E", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {attachments[0]?.name || "Tệp đính kèm"}
                {attachments.length > 1 ? ` (+${attachments.length - 1})` : ""}
              </Typography>
            </>
          )}
        </Box>
      ) : (
        <Typography
          sx={{
            fontSize: 14,
            color: "#92400E",
            fontWeight: 500,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          Tin nhắn đã ghim
        </Typography>
      )}

      <ExpandButton size="small" onClick={onExpand}>
        <ExpandMoreIcon fontSize="small" />
      </ExpandButton>

      <CloseButton size="small" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </CloseButton>
    </PinnedContainer>
  );
};

export default PinnedBar;
