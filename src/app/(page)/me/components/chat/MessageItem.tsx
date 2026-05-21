"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Box,
  Chip,
  Fade,
  IconButton,
  ImageList,
  ImageListItem,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled, alpha, keyframes } from "@mui/material/styles";
import { getReplyPreview } from "@/src/common/helpers/displayPreviewReply";

import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import ForwardOutlinedIcon from "@mui/icons-material/ForwardOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";

interface Attachment {
  key?: string;
  url?: string;
  thumbnailUrl?: string;
  type?: string;
  name?: string;
  size?: number;
  contentType?: string;
  content_type?: string;
}

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
  isGrouped?: boolean;
  replyTo?: {
    messageId: string;
    body: string;
    senderId?: string;
    senderName?: string;
    attachments?: any[];
    isDeleted?: boolean;
  } | null;
  attachments?: Attachment[];
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
  onUnpin?: () => void;
  onDelete?: () => void;
  onEdit?: (newContent: string) => void;
  onReact?: (reaction: string) => void;
  onImageClick?: (url: string, mediaList: Attachment[], index: number) => void;
}

const MessageRow = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "mine" && prop !== "isGrouped",
})<{
  mine?: boolean;
  isGrouped?: boolean;
}>(({ mine, isGrouped }) => ({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: mine ? "flex-end" : "flex-start",
  gap: 8,
  padding: "0 14px",
  marginTop: isGrouped ? 2 : 10,
  position: "relative",

  "&:hover .message-actions": {
    opacity: 1,
    visibility: "visible",
    transform: "translateY(0px)",
  },
}));

const MessageAvatar = styled(Avatar)({
  width: 32,
  height: 32,
  fontSize: 13,
  flexShrink: 0,
  marginBottom: 2,
});

const BubbleWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine",
})<{ mine?: boolean }>(({ mine }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: mine ? "flex-end" : "flex-start",
  position: "relative",
}));

const flashAnimation = keyframes`
  0% {
    background-color: #fef08a !important; /* light yellow */
    border-color: #facc15 !important;
  }
  50% {
    background-color: #fef08a !important;
    border-color: #facc15 !important;
  }
  100% {
    /* transition back */
  }
`;

const Bubble = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "mine" && prop !== "isDeleted",
})<{
  mine?: boolean;
  isDeleted?: boolean;
}>(({ mine, isDeleted }) => ({
  position: "relative",
  maxWidth: "560px",
  minWidth: 70,
  padding: "9px 12px",
  borderRadius: mine
    ? "18px 18px 4px 18px"
    : "18px 18px 18px 4px",
  background: mine ? "#d9fdd3" : "#ffffff",
  border: mine
    ? "1px solid #c9f1c3"
    : "1px solid #E5E7EB",
  color: "#111827",
  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  opacity: isDeleted ? 0.6 : 1,
  fontStyle: isDeleted ? "italic" : "normal",
  transition: "background-color 0.3s ease, border-color 0.3s ease",

  "&.flash-active": {
    animation: `${flashAnimation} 1.5s ease-in-out`,
  },
}));

const SenderName = styled(Typography)({
  fontSize: 12,
  fontWeight: 600,
  color: "#2563EB",
  marginBottom: 4,
});

const MessageText = styled(Typography)({
  fontSize: 14,
  lineHeight: 1.45,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
});

const MetaRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginTop: 4,
});

const MetaText = styled(Typography)({
  fontSize: 11,
  color: "#94A3B8",
  lineHeight: 1,
});

const ActionBar = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine",
})<{ mine?: boolean }>(({ mine }) => ({
  position: "absolute",
  top: 0,
  [mine ? "left" : "right"]: "-110px",

  display: "flex",
  alignItems: "center",
  gap: 2,

  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 999,
  padding: "2px 4px",

  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",

  opacity: 0,
  visibility: "hidden",
  transform: "translateY(4px)",
  transition: "all 0.18s ease",

  zIndex: 20,
}));

const ActionBtn = styled(IconButton)({
  width: 28,
  height: 28,
  color: "#64748B",

  "&:hover": {
    background: "#F1F5F9",
    color: "#0068FF",
  },
});

const ReactionWrap = styled(Box)({
  position: "absolute",
  bottom: -12,
  right: 10,

  display: "flex",
  alignItems: "center",
  gap: 2,

  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 999,
  padding: "1px 5px",

  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
});

const ReactionChip = styled(Chip)({
  height: 22,
  borderRadius: 999,
  background: "transparent",
  fontSize: 12,
  fontWeight: 500,

  "& .MuiChip-label": {
    paddingLeft: 4,
    paddingRight: 4,
  },

  "&:hover": {
    background: alpha("#0068FF", 0.06),
  },
});

const ReplyPreviewBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine",
})<{ mine?: boolean }>(({ mine }) => ({
  background: mine ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.04)",
  borderRadius: "6px",
  padding: "6px 12px",
  marginBottom: 6,
  borderLeft: "3.5px solid #0068FF",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  transition: "all 0.2s ease",
  minWidth: 140,
  maxWidth: "100%",
  userSelect: "none",

  "&:hover": {
    background: mine ? "rgba(0, 0, 0, 0.09)" : "rgba(0, 0, 0, 0.07)",
  },
}));

const ReplySenderName = styled(Box)({
  fontSize: 12,
  fontWeight: 600,
  color: "#0068FF",
  marginBottom: 2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const ReplyContent = styled(Box)({
  fontSize: 12,
  color: "#4B5563",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
});

const MessageItem: React.FC<MessageItemProps> = ({
  content,
  sender,
  timestamp,
  isOwn = false,
  isDeleted = false,
  isPinned = false,
  deliveryStatus = "sent",
  isEdited = false,
  isGrouped = false,
  replyTo,
  attachments = [],
  reactions = [],
  onReply,
  onForward,
  onPin,
  onUnpin,
  onDelete,
  onEdit,
  onReact,
  onImageClick,
}) => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSaveEdit = () => {
    const trimmed = editText.trim();

    if (trimmed && trimmed !== content) {
      onEdit?.(trimmed);
    }

    setEditing(false);
  };

  const handleDeliveryIcon = () => {
    switch (deliveryStatus) {
      case "sending":
        return (
          <ScheduleRoundedIcon
            sx={{
              fontSize: 14,
              color: "#94A3B8",
            }}
          />
        );

      case "sent":
        return (
          <CheckRoundedIcon
            sx={{
              fontSize: 14,
              color: "#94A3B8",
            }}
          />
        );

      case "delivered":
        return (
          <DoneAllRoundedIcon
            sx={{
              fontSize: 14,
              color: "#94A3B8",
            }}
          />
        );

      case "read":
        return (
          <DoneAllRoundedIcon
            sx={{
              fontSize: 14,
              color: "#0068FF",
            }}
          />
        );

      default:
        return null;
    }
  };

  const handleScrollToMessage = () => {
    if (!replyTo?.messageId) return;
    const element = document.getElementById(`msg-${replyTo.messageId}`);
    if (element) {
      const bubble = element.querySelector(".message-bubble");
      if (bubble) {
        bubble.scrollIntoView({ behavior: "smooth", block: "center" });
        bubble.classList.add("flash-active");
        setTimeout(() => {
          bubble.classList.remove("flash-active");
        }, 1500);
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const mediaAttachments = attachments.filter((a) => {
    const type = a.type?.toLowerCase();
    const contentType = (a.contentType || a.content_type || '').toLowerCase();
    const isMedia = type === 'image' || type === 'video' || contentType.startsWith('image/') || contentType.startsWith('video/');
    if (isMedia && attachments.length > 0) {
      console.log('[MessageItem] media attachment:', { key: a.key, type: a.type, url: a.url, contentType: a.contentType });
    }
    return isMedia;
  });

  if (attachments.length > 0) {
    console.log('[MessageItem] all attachments:', JSON.stringify(attachments, null, 2));
  }

  return (
    <MessageRow mine={isOwn} isGrouped={isGrouped}>
      {!isOwn && !isGrouped ? (
        <MessageAvatar src={sender?.avatar}>
          {sender?.name?.charAt(0).toUpperCase()}
        </MessageAvatar>
      ) : (
        !isOwn && <Box width={32} />
      )}

      <BubbleWrap mine={isOwn}>
        <Fade in={!editing}>
          <ActionBar
            mine={isOwn}
            className="message-actions"
          >
            {onReply && (
              <Tooltip title={t("CHAT.ACTION_REPLY")}>
                <ActionBtn
                  size="small"
                  onClick={onReply}
                >
                  <ReplyOutlinedIcon
                    sx={{ fontSize: 17 }}
                  />
                </ActionBtn>
              </Tooltip>
            )}

            {onReact && (
              <Tooltip title={t("CHAT.ADD_REACTION")}>
                <ActionBtn
                  size="small"
                  onClick={() => onReact?.("👍")}
                >
                  <EmojiEmotionsOutlinedIcon
                    sx={{ fontSize: 17 }}
                  />
                </ActionBtn>
              </Tooltip>
            )}

            <Tooltip title={t("CHAT.MORE_OPTIONS")}>
              <ActionBtn
                size="small"
                onClick={(e) =>
                  setAnchorEl(e.currentTarget)
                }
              >
                <MoreHorizOutlinedIcon
                  sx={{ fontSize: 18 }}
                />
              </ActionBtn>
            </Tooltip>
          </ActionBar>
        </Fade>

        <Bubble
          mine={isOwn}
          isDeleted={isDeleted}
          className="message-bubble"
        >
          {!isOwn && !isGrouped && sender && (
            <SenderName>
              {sender.name}
            </SenderName>
          )}

          {editing ? (
            <TextField
              fullWidth
              multiline
              maxRows={4}
              inputRef={inputRef}
              value={editText}
              onChange={(e) =>
                setEditText(e.target.value)
              }
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  handleSaveEdit();
                }

                if (e.key === "Escape") {
                  setEditing(false);
                  setEditText(content);
                }
              }}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: 14,
                  borderRadius: 2,
                  background: "#fff",
                },
              }}
            />
          ) : (
            <>
              {replyTo && (() => {
                const { text: replyText, imageAttachment, videoAttachment } = getReplyPreview(replyTo as any);
                return (
                  <ReplyPreviewBox mine={isOwn} onClick={handleScrollToMessage}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <ReplySenderName>
                        {replyTo.senderName || "Người dùng"}
                      </ReplySenderName>
                      <ReplyContent>
                        {replyTo.isDeleted ? "Tin nhắn đã được thu hồi" : replyText}
                      </ReplyContent>
                    </Box>
                    {!replyTo.isDeleted && imageAttachment && (
                      <Box
                        component="img"
                        src={imageAttachment.url || imageAttachment.key}
                        alt="replied-media"
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          objectFit: "cover",
                          marginLeft: 1.5,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    {!replyTo.isDeleted && videoAttachment && (
                      <Box
                        component="video"
                        src={videoAttachment.url || videoAttachment.key}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          objectFit: "cover",
                          marginLeft: 1.5,
                          flexShrink: 0,
                          backgroundColor: "#000",
                        }}
                      />
                    )}
                  </ReplyPreviewBox>
                );
              })()}

              {!!content && (
                <MessageText>
                  {content}
                </MessageText>
              )}

              {mediaAttachments.length > 0 && (
                <ImageList
                  cols={
                    mediaAttachments.length >= 3
                      ? 3
                      : mediaAttachments.length
                  }
                  gap={4}
                  sx={{
                    mt: content ? 1 : 0,
                    overflow: "hidden",
                    borderRadius: 2,
                    mb:
                      reactions.length > 0
                        ? 1.5
                        : 0,
                  }}
                >
                  {mediaAttachments
                    .slice(0, 9)
                    .map((att, index) => (
                      <ImageListItem
                        key={att.key || index}
                        sx={{
                          overflow: "hidden",
                          borderRadius: 2,
                          cursor: "pointer",
                          position: "relative",

                          "& img, & video": {
                            transition:
                              "0.2s ease",
                          },

                          "&:hover img, &:hover video": {
                            transform:
                              "scale(1.03)",
                          },
                        }}
                        onClick={() =>
                          onImageClick?.(
                            att.url ||
                              att.thumbnailUrl ||
                              "",
                            mediaAttachments,
                            index
                          )
                        }
                      >
                        {(() => {
                          const isVideo = att.type?.toLowerCase() === 'video' || (att.contentType || att.content_type || '').toLowerCase().startsWith('video/');
                          if (isVideo) {
                            return (
                              <>
                                <Box
                                  component="video"
                                  src={
                                    att.thumbnailUrl ||
                                    att.url
                                  }
                                  sx={{
                                    width: "100%",
                                    height: 150,
                                    objectFit: "cover",
                                    display: "block",
                                    background: "#000",
                                  }}
                                />
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    background: "rgba(0,0,0,0.6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    pointerEvents: "none",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 0,
                                      height: 0,
                                      borderStyle: "solid",
                                      borderWidth: "8px 0 8px 14px",
                                      borderColor: "transparent transparent transparent #fff",
                                      ml: 1,
                                    }}
                                  />
                                </Box>
                              </>
                            );
                          }
                          return (
                            <Box
                              component="img"
                              src={
                                att.thumbnailUrl ||
                                att.url
                              }
                              alt={att.name}
                              sx={{
                                width: "100%",
                                height: 150,
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          );
                        })()}
                      </ImageListItem>
                    ))}
                </ImageList>
              )}
            </>
          )}

          {reactions.length > 0 && (
            <ReactionWrap>
              {reactions.map((r, i) => (
                <ReactionChip
                  key={i}
                  clickable
                  label={r.type}
                  onClick={() =>
                    onReact?.(r.type)
                  }
                />
              ))}
            </ReactionWrap>
          )}
        </Bubble>

        <MetaRow
          sx={{
            justifyContent: isOwn
              ? "flex-end"
              : "flex-start",
            px: 0.5,
          }}
        >
          <MetaText>{timestamp}</MetaText>

          {isEdited && (
            <MetaText>
              • {t("CHAT.EDITED")}
            </MetaText>
          )}

          {isPinned && (
            <PushPinOutlinedIcon
              sx={{
                fontSize: 12,
                color: "#94A3B8",
              }}
            />
          )}

          {isOwn && handleDeliveryIcon()}
        </MetaRow>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 180,
              borderRadius: 3,
              mt: 1,
              border: "1px solid #E5E7EB",
            },
          }}
        >
          {[
            onForward ? (
              <MenuItem
                key="forward"
                onClick={() => {
                  setAnchorEl(null);
                  onForward();
                }}
              >
                <ForwardOutlinedIcon
                  sx={{ mr: 1.2, fontSize: 18 }}
                />
                {t("CHAT.ACTION_FORWARD")}
              </MenuItem>
            ) : null,
            onPin && !isPinned ? (
              <MenuItem
                key="pin"
                onClick={() => {
                  setAnchorEl(null);
                  onPin?.();
                }}
              >
                <PushPinOutlinedIcon sx={{ mr: 1.2, fontSize: 18 }} />
                {t("CHAT.ACTION_PIN")}
              </MenuItem>
            ) : null,
            onUnpin && isPinned ? (
              <MenuItem
                key="unpin"
                onClick={() => {
                  setAnchorEl(null);
                  onUnpin?.();
                }}
              >
                <PushPinOutlinedIcon sx={{ mr: 1.2, fontSize: 18 }} />
                {t("CHAT.ACTION_UNPIN")}
              </MenuItem>
            ) : null,
            onEdit && isOwn ? (
              <MenuItem
                key="edit"
                onClick={() => {
                  setAnchorEl(null);
                  setEditing(true);
                }}
              >
                <EditOutlinedIcon
                  sx={{ mr: 1.2, fontSize: 18 }}
                />
                {t("CHAT.ACTION_EDIT")}
              </MenuItem>
            ) : null,
            onDelete && isOwn ? (
              <MenuItem
                key="delete"
                sx={{
                  color: "#EF4444",
                }}
                onClick={() => {
                  setAnchorEl(null);
                  onDelete();
                }}
              >
                <DeleteOutlineOutlinedIcon
                  sx={{ mr: 1.2, fontSize: 18 }}
                />
                {t("CHAT.ACTION_DELETE")}
              </MenuItem>
            ) : null,
          ]}
        </Menu>
      </BubbleWrap>
    </MessageRow>
  );
};

export default MessageItem;