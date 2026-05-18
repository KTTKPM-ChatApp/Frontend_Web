"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Box,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  TextField,
  ImageList,
  ImageListItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ReplyIcon from "@mui/icons-material/Reply";
import ForwardIcon from "@mui/icons-material/Forward";
import PushPinIcon from "@mui/icons-material/PushPin";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckIcon from "@mui/icons-material/Check";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

const MessageRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine" && prop !== "isGrouped",
})<{ mine?: boolean; isGrouped?: boolean }>(({ mine, isGrouped }) => ({
  display: "flex",
  justifyContent: mine ? "flex-end" : "flex-start",
  alignItems: "flex-end",
  gap: 8,
  marginBottom: isGrouped ? 2 : 10,
  padding: "0 14px",
  position: "relative",
}));

const Bubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine" && prop !== "isDeleted",
})<{ mine?: boolean; isDeleted?: boolean }>(({ mine, isDeleted }) => ({
  maxWidth: "60%",
  minWidth: 60,
  padding: "8px 14px",
  borderRadius: mine ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
  background: mine ? "#005AE0" : "#F0F0F0",
  color: mine ? "#fff" : "#0F172A",
  position: "relative",
  opacity: isDeleted ? 0.5 : 1,
  fontStyle: isDeleted ? "italic" : "normal",
}));

const MessageText = styled(Typography)({
  fontSize: 14,
  lineHeight: 1.45,
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
});

const MessageMeta = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginTop: 3,
});

const MessageTime = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "isOwn",
})<{ isOwn?: boolean }>(({ isOwn }) => ({
  fontSize: 11,
  color: isOwn ? "rgba(255,255,255,0.7)" : "#9CA3AF",
  lineHeight: 1,
}));

const MessageAvatar = styled(Avatar)({
  width: 24,
  height: 24,
  flexShrink: 0,
  fontSize: 11,
  marginBottom: 2,
});

const HoverActions = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 2,
  opacity: 0,
  transition: "opacity 0.15s ease",
  position: "absolute",
  ...({
    top: -28,
    right: 0,
  } as any),
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  padding: "0 2px",
  zIndex: 5,
});

const BubbleWrap = styled(Box)({
  position: "relative",
  "&:hover .hover-actions": {
    opacity: 1,
  },
});

const HoverBtn = styled(IconButton)({
  width: 28,
  height: 28,
  color: "#64748B",
  borderRadius: "50%",
  "&:hover": {
    background: "#F0F2F5",
    color: "#005AE0",
  },
});

const ReactionChip = styled(Chip)({
  height: 24,
  fontSize: 12,
  margin: "2px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#E5E7EB",
  },
});

const EditedLabel = styled(Typography)({
  fontSize: 11,
  color: "rgba(255,255,255,0.5)",
  fontStyle: "italic",
  lineHeight: 1,
});

const SenderName = styled(Typography)({
  fontSize: 12,
  fontWeight: 600,
  color: "#005AE0",
  marginBottom: 2,
});

interface Attachment {
  key?: string;
  url?: string;
  thumbnailUrl?: string;
  type?: string;
  name?: string;
  size?: number;
}

interface MessageItemProps {
  id: string;
  content: string;
  sender?: { id: string; name: string; avatar?: string };
  timestamp: string;
  isOwn?: boolean;
  isDeleted?: boolean;
  isPinned?: boolean;
  deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed";
  isEdited?: boolean;
  isGrouped?: boolean;
  attachments?: Attachment[];
  reactions?: Array<{ userId: string; type: string; user: { fullName: string; avatar?: string } }>;
  onReply?: () => void;
  onForward?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onEdit?: (newContent: string) => void;
  onReact?: (reaction: string) => void;
  onImageClick?: (url: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  id,
  content,
  sender,
  timestamp,
  isOwn = false,
  isDeleted = false,
  isPinned = false,
  deliveryStatus = "sent",
  isEdited = false,
  isGrouped = false,
  attachments = [],
  reactions = [],
  onReply,
  onForward,
  onPin,
  onDelete,
  onEdit,
  onReact,
  onImageClick,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, [editing]);

  const handleEditSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== content) onEdit?.(trimmed);
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    }
    if (e.key === "Escape") {
      setEditText(content);
      setEditing(false);
    }
  };

  const getDeliveryIcon = () => {
    switch (deliveryStatus) {
      case "sending": return <ScheduleIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }} />;
      case "sent": return <CheckIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }} />;
      case "delivered": return <DoneAllIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }} />;
      case "read": return <DoneAllIcon sx={{ fontSize: 13, color: "#53D0F0" }} />;
      case "failed": return <ScheduleIcon sx={{ fontSize: 13, color: "#EF4444" }} />;
      default: return null;
    }
  };

  return (
    <MessageRow mine={isOwn} isGrouped={isGrouped}>
      {!isOwn && !isGrouped && (
        <MessageAvatar src={sender?.avatar}>
          {sender?.name?.charAt(0)?.toUpperCase() || "?"}
        </MessageAvatar>
      )}
      {!isOwn && isGrouped && <Box width={24} flexShrink={0} />}

      <BubbleWrap>
        <Bubble mine={isOwn} isDeleted={isDeleted}>
          {!isOwn && !isGrouped && sender && (
            <SenderName>{sender.name}</SenderName>
          )}

          {editing ? (
            <TextField
              inputRef={editInputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleEditKeyDown}
              fullWidth
              size="small"
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 1, fontSize: 14 } }}
            />
          ) : (
            <>
              {content && <MessageText>{content}</MessageText>}
              {attachments.filter((a) => a.type === "image" || a.type === "video").length > 0 && (
                <ImageList
                  sx={{ mt: content ? 1 : 0, borderRadius: 1, overflow: "hidden" }}
                  cols={Math.min(attachments.filter((a) => a.type === "image" || a.type === "video").length, 3)}
                  gap={4}
                >
                  {attachments
                    .filter((a) => a.type === "image" || a.type === "video")
                    .slice(0, 9)
                    .map((att, i) => (
                      <ImageListItem
                        key={att.key || i}
                        sx={{ cursor: "pointer", borderRadius: 1, overflow: "hidden", "&:hover": { opacity: 0.85 } }}
                        onClick={() => onImageClick?.(att.url || att.thumbnailUrl || "")}
                      >
                        <Box
                          component="img"
                          src={att.thumbnailUrl || att.url}
                          alt={att.name || ""}
                          sx={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                        />
                      </ImageListItem>
                    ))}
                </ImageList>
              )}
            </>
          )}

          {reactions.length > 0 && (
            <Box sx={{ mt: 0.5, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {reactions.map((r, i) => (
                <ReactionChip key={i} label={`${r.type}`} size="small" onClick={() => onReact?.(r.type)} />
              ))}
            </Box>
          )}
        </Bubble>

        {!(editing) && (
          <HoverActions className="hover-actions">
            {onReply && (
              <Tooltip title={t("CHAT.ACTION_REPLY")}>
                <HoverBtn size="small" onClick={onReply}><ReplyIcon sx={{ fontSize: 16 }} /></HoverBtn>
              </Tooltip>
            )}
            {onReact && (
              <Tooltip title={t("CHAT.ADD_REACTION")}>
                <HoverBtn size="small" onClick={() => {}}><EmojiEmotionsIcon sx={{ fontSize: 16 }} /></HoverBtn>
              </Tooltip>
            )}
            <Tooltip title={t("CHAT.MORE_OPTIONS")}>
              <HoverBtn size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertIcon sx={{ fontSize: 16 }} />
              </HoverBtn>
            </Tooltip>
          </HoverActions>
        )}

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {onForward && (
            <MenuItem onClick={() => { setAnchorEl(null); onForward?.(); }}>
              <ForwardIcon sx={{ mr: 1 }} fontSize="small" />{t("CHAT.ACTION_FORWARD")}
            </MenuItem>
          )}
          {onPin && (
            <MenuItem onClick={() => { setAnchorEl(null); onPin?.(); }}>
              <PushPinIcon sx={{ mr: 1 }} fontSize="small" />
              {isPinned ? t("CHAT.ACTION_UNPIN") : t("CHAT.ACTION_PIN")}
            </MenuItem>
          )}
          {onEdit && isOwn && (
            <MenuItem onClick={() => { setAnchorEl(null); setEditing(true); }}>
              <EditIcon sx={{ mr: 1 }} fontSize="small" />{t("CHAT.ACTION_EDIT")}
            </MenuItem>
          )}
          {onDelete && isOwn && (
            <MenuItem onClick={() => { setAnchorEl(null); onDelete?.(); }} sx={{ color: "#EF4444" }}>
              <DeleteIcon sx={{ mr: 1 }} fontSize="small" />{t("CHAT.ACTION_DELETE")}
            </MenuItem>
          )}
        </Menu>

        <MessageMeta sx={{ justifyContent: isOwn ? "flex-end" : "flex-start", px: 0.5 }}>
          <MessageTime isOwn={isOwn}>{timestamp}</MessageTime>
          {isEdited && !isOwn && (
            <EditedLabel>(Đã chỉnh sửa)</EditedLabel>
          )}
          {isEdited && isOwn && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontStyle: "italic", lineHeight: 1 }}>(đã chỉnh sửa)</span>
          )}
          {isOwn && getDeliveryIcon()}
        </MessageMeta>
      </BubbleWrap>
    </MessageRow>
  );
};

export default MessageItem;
