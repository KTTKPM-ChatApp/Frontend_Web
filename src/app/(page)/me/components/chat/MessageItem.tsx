"use client";

import React, { useState } from "react";
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
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ReplyIcon from "@mui/icons-material/Reply";
import ForwardIcon from "@mui/icons-material/Forward";
import PushPinIcon from "@mui/icons-material/PushPin";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckIcon from "@mui/icons-material/Check";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

// ==================== STYLED COMPONENTS ====================

const MessageRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine" && prop !== "isHighlighted",
})<{ mine?: boolean; isHighlighted?: boolean }>(({ mine, isHighlighted }) => ({
  display: "flex",
  justifyContent: mine ? "flex-end" : "flex-start",
  alignItems: "flex-start",
  gap: 8,
  marginBottom: 16,
  position: "relative",
  transition: "background-color 0.3s ease",
  borderRadius: 8,
  padding: "4px 8px",
  ...(isHighlighted && {
    backgroundColor: "rgba(0, 168, 132, 0.2)",
    animation: "highlight-pulse 1.5s ease-in-out",
  }),
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine" && prop !== "isDeleted",
})<{ mine?: boolean; isDeleted?: boolean }>(({ mine, isDeleted }) => ({
  maxWidth: "70%",
  minWidth: 100,
  padding: "12px 16px",
  borderRadius: 16,
  background: mine ? "#0078FF" : "#F1F5F9",
  color: mine ? "#fff" : "#0F172A",
  position: "relative",
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  opacity: isDeleted ? 0.6 : 1,
  fontStyle: isDeleted ? "italic" : "normal",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    width: 0,
    height: 0,
    border: mine ? "8px solid transparent" : "8px solid transparent",
    ...(mine
      ? {
          right: -6,
          borderLeftColor: "#0078FF",
          borderTopColor: "#0078FF",
        }
      : {
          left: -6,
          borderRightColor: "#F1F5F9",
          borderTopColor: "#F1F5F9",
        }),
  },
}));

const MessageText = styled(Typography)({
  fontSize: 14,
  lineHeight: 1.4,
  wordBreak: "break-word",
});

const MessageTime = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "isOwn",
})<{ isOwn?: boolean }>(({ isOwn }) => ({
  fontSize: 11,
  color: isOwn ? "#B3D9FF" : "#9CA3AF",
  marginTop: 4,
  textAlign: isOwn ? "right" : "left",
}));

const MessageAvatar = styled(Avatar)({
  width: 32,
  height: 32,
  flexShrink: 0,
});

const OnlineIndicator = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: "#10B981",
  border: "2px solid #fff",
  position: "absolute",
  bottom: 0,
  right: 0,
}));

const OfflineIndicator = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: "#94A3B8",
  border: "2px solid #fff",
  position: "absolute",
  bottom: 0,
  right: 0,
}));

const ActionButtons = styled(Box)({
  display: "flex",
  gap: 4,
  opacity: 0,
  transition: "opacity 0.2s ease",
});

const MessageActionsContainer = styled(Box)({
  position: "relative",
  "&:hover .action-buttons": {
    opacity: 1,
  },
});

const DeliveryStatus = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 2,
  marginTop: 4,
}));

const ReactionChip = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: 12,
  margin: "2px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#E5E7EB",
  },
}));

interface MessageItemProps {
  id: string;
  content: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  isOwn?: boolean;
  isDeleted?: boolean;
  isPinned?: boolean;
  deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed";
  isEdited?: boolean;
  reactions?: Array<{
    userId: string;
    type: string;
    user: {
      fullName: string;
      avatar?: string;
    };
  }>;
  onReply?: () => void;
  onForward?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onReact?: (reaction: string) => void;
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
  reactions = [],
  onReply,
  onForward,
  onPin,
  onDelete,
  onEdit,
  onReact,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getDeliveryIcon = () => {
    switch (deliveryStatus) {
      case "sending":
        return <ScheduleIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />;
      case "sent":
        return <CheckIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />;
      case "delivered":
        return <DoneAllIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />;
      case "read":
        return <DoneAllIcon sx={{ fontSize: 14, color: "#0078FF" }} />;
      case "failed":
        return <ScheduleIcon sx={{ fontSize: 14, color: "#EF4444" }} />;
      default:
        return null;
    }
  };

  return (
    <MessageRow mine={isOwn}>
      {!isOwn && sender && (
        <Box sx={{ position: "relative" }}>
          <MessageAvatar src={sender.avatar}>
            {sender.name.charAt(0)}
          </MessageAvatar>
          <OnlineIndicator />
        </Box>
      )}
      
      <Box sx={{ maxWidth: "70%" }}>
        <MessageActionsContainer>
          <MessageBubble mine={isOwn} isDeleted={isDeleted}>
            <MessageText>{content}</MessageText>
            
            {/* Reactions */}
            {reactions.length > 0 && (
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {reactions.map((reaction, index) => (
                  <ReactionChip
                    key={index}
                    label={`${reaction.type} ${reaction.user.fullName}`}
                    size="small"
                    onClick={() => onReact?.(reaction.type)}
                  />
                ))}
              </Box>
            )}
          </MessageBubble>
          
          <ActionButtons className="action-buttons">
            {onReply && (
              <Tooltip title={t("CHAT.ACTION_REPLY")}>
                <IconButton size="small" onClick={onReply}>
                  <ReplyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {onReact && (
              <Tooltip title={t("CHAT.ADD_REACTION")}>
                <IconButton size="small" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  <EmojiEmotionsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title={t("CHAT.MORE_OPTIONS")}>
              <IconButton size="small" onClick={handleMenuClick}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {onForward && (
                <MenuItem onClick={handleMenuClose}>
                  <ForwardIcon sx={{ mr: 1 }} fontSize="small" />
                  {t("CHAT.ACTION_FORWARD")}
                </MenuItem>
              )}
              
              {onPin && (
                <MenuItem onClick={handleMenuClose}>
                  {isPinned ? <StarIcon sx={{ mr: 1 }} fontSize="small" /> : <StarBorderIcon sx={{ mr: 1 }} fontSize="small" />}
                  {isPinned ? t("CHAT.ACTION_UNPIN") : t("CHAT.ACTION_PIN")}
                </MenuItem>
              )}
              
              {onEdit && isOwn && (
                <MenuItem onClick={handleMenuClose}>
                  <EditIcon sx={{ mr: 1 }} fontSize="small" />
                  {t("CHAT.ACTION_EDIT")}
                </MenuItem>
              )}
              
              {onDelete && isOwn && (
                <MenuItem onClick={handleMenuClose} sx={{ color: "#EF4444" }}>
                  <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                  {t("CHAT.ACTION_DELETE")}
                </MenuItem>
              )}
            </Menu>
          </ActionButtons>
        </MessageActionsContainer>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
          <MessageTime isOwn={isOwn}>{timestamp}</MessageTime>
          {isEdited && (
            <Typography variant="caption" sx={{ color: "#9CA3AF", fontStyle: "italic" }}>
              ({t("CHAT.MESSAGE_EDITED")})
            </Typography>
          )}
          {isOwn && (
            <DeliveryStatus>
              {getDeliveryIcon()}
            </DeliveryStatus>
          )}
        </Box>
      </Box>
      
      {isOwn && sender && (
        <MessageAvatar src={sender.avatar}>
          {sender.name.charAt(0)}
        </MessageAvatar>
      )}
    </MessageRow>
  );
};

export default MessageItem;
