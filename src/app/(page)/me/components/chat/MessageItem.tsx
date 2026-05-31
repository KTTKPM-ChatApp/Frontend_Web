"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Box,
  Chip,
  ClickAwayListener,
  Dialog,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  ImageList,
  ImageListItem,
  Menu,
  MenuItem,
  Paper,
  Popper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled, alpha, keyframes } from "@mui/material/styles";
import { getReplyPreview } from "@/src/common/helpers/displayPreviewReply";
import type { ReactionDto } from "@/src/common/interface/chat-interface";
import { useChatStore } from "@/src/common/store/useChatStore";

import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
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
import FileAttachmentCard from "./FileAttachmentCard";
import LinkPreviewCard from "./LinkPreviewCard";
import { buildS3Url } from "@/src/common/components/MediaPreviewModal";
import type { ConversationMemberDto } from "@/src/common/interface/chat-interface";

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
  reactions?: ReactionDto[];
  onReply?: () => void;
  onForward?: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  onDelete?: () => void;
  onEdit?: (newContent: string) => void;
  onReact?: (emoji: string) => void;
  onImageClick?: (url: string, mediaList: Attachment[], index: number) => void;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const EmojiPickerBox = styled(Paper)({
  display: "flex",
  gap: 4,
  padding: "6px 10px",
  borderRadius: 999,
  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
});

const EmojiBtn = styled(IconButton)({
  width: 32,
  height: 32,
  fontSize: 18,
  "&:hover": {
    backgroundColor: alpha("#0068FF", 0.08),
    transform: "scale(1.2)",
  },
  transition: "transform 0.15s ease",
});

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
  top: -16,
  right: mine ? 8 : "auto",
  left: mine ? "auto" : 8,

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
  bottom: -10,
  right: 6,

  display: "flex",
  alignItems: "center",
  gap: 1,

  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 999,
  padding: "1px 4px",

  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  cursor: "pointer",
  zIndex: 5,

  "&:hover": {
    boxShadow: "0 2px 6px rgba(0,0,0,0.13)",
  },
});

const ReactionEmoji = styled(Box)({
  fontSize: 15,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
});

const ReactionCount = styled(Typography)({
  fontSize: 11,
  fontWeight: 500,
  color: "#4B5563",
  marginLeft: 0.5,
  lineHeight: 1,
});

const StyledTab = styled(Tab)({
  minHeight: 36,
  minWidth: 50,
  fontSize: 13,
  textTransform: "none",
  fontWeight: 500,
  padding: "4px 10px",
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
  const [emojiAnchorEl, setEmojiAnchorEl] =
    useState<null | HTMLElement>(null);

  const currentUserId = useChatStore((s) => s.currentUserId);
  const conversationDetailById = useChatStore((s) => s.conversationDetailById);
  const listConversation = useChatStore((s) => s.listConversation);
  const activeConversationId = useChatStore((s) => s.activeConversationId);

  const convDetail = activeConversationId ? conversationDetailById[activeConversationId] : null;
  const convFromList = activeConversationId ? listConversation.find((c) => c.id === activeConversationId) : null;
  const members = convDetail?.members || convFromList?.members || [];
  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    (members as ConversationMemberDto[]).forEach((m) => {
      const name = m.displayName || m.fullName || m.username || m.nickname || "";
      if (name) map.set(m.userId, name);
    });
    return map;
  }, [members]);

  const resolveUserName = (uid: string): string => {
    if (!uid) return "Người dùng";
    if (uid === currentUserId) return "Bạn";
    return memberMap.get(uid) || uid.slice(0, 8);
  };

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content);
  const [reactionDetailOpen, setReactionDetailOpen] = useState(false);
  const [reactionTab, setReactionTab] = useState(0);

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
    return isMedia;
  });

  const fileAttachments = attachments.filter((a) => {
    const type = a.type?.toLowerCase();
    const contentType = (a.contentType || a.content_type || '').toLowerCase();
    const isFile = type === 'document' || type === 'file' || type === 'audio' ||
      (!contentType.startsWith('image/') && !contentType.startsWith('video/'));
    return isFile && !mediaAttachments.includes(a);
  });

  const linkUrls = content.match(/(https?:\/\/[^\s]+)/g) || [];

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
                  onClick={(e) => setEmojiAnchorEl(e.currentTarget)}
                >
                  <EmojiEmotionsOutlinedIcon
                    sx={{ fontSize: 17 }}
                  />
                </ActionBtn>
              </Tooltip>
            )}
            <Popper
              open={Boolean(emojiAnchorEl)}
              anchorEl={emojiAnchorEl}
              placement="top"
              disablePortal
              sx={{ zIndex: 1300 }}
            >
              <ClickAwayListener onClickAway={() => setEmojiAnchorEl(null)}>
                <EmojiPickerBox elevation={4}>
                  {REACTION_EMOJIS.map((emoji) => (
                    <Tooltip key={emoji} title={emoji}>
                      <EmojiBtn
                        size="small"
                        onClick={() => {
                          onReact?.(emoji);
                          setEmojiAnchorEl(null);
                        }}
                      >
                        {emoji}
                      </EmojiBtn>
                    </Tooltip>
                  ))}
                </EmojiPickerBox>
              </ClickAwayListener>
            </Popper>

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
                const {
                  text: replyText,
                  imageAttachment,
                  videoAttachment,
                  imageCount,
                  fileAttachments,
                  fileCount,
                } = getReplyPreview(replyTo as any);
                return (
                  <ReplyPreviewBox mine={isOwn} onClick={handleScrollToMessage}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <ReplySenderName>
                        {replyTo.senderName || t("CHAT.USER")}
                      </ReplySenderName>
                      <ReplyContent>
                        {replyTo.isDeleted
                          ? t("CHAT.MESSAGE_DELETED")
                          : replyText || (imageAttachment
                              ? imageCount > 1
                                ? t("CHAT.IMAGES_COUNT", { count: imageCount })
                                : t("CHAT.IMAGE")
                              : videoAttachment
                              ? t("CHAT.VIDEO")
                              : fileCount > 1
                              ? t("CHAT.FILES_COUNT", { count: fileCount })
                              : fileCount === 1
                              ? t("CHAT.FILE_ATTACHMENT")
                              : t("CHAT.MESSAGE")
                            )
                        }
                      </ReplyContent>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0, ml: 1.5 }}>
                      {!replyTo.isDeleted && imageAttachment && (
                        <Box sx={{ position: "relative" }}>
                          <Box
                            component="img"
                            src={imageAttachment.thumbnailUrl || imageAttachment.url || imageAttachment.key}
                            alt="replied-media"
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1,
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                          {imageCount > 1 && (
                            <Box sx={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              bgcolor: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              fontSize: 9,
                              px: 0.4,
                              borderRadius: "0 1px 0 1px",
                              lineHeight: "14px",
                            }}>
                              +{imageCount - 1}
                            </Box>
                          )}
                        </Box>
                      )}
                      {!replyTo.isDeleted && !imageAttachment && videoAttachment && (
                        <Box
                          component="img"
                          src={videoAttachment.thumbnailUrl || videoAttachment.url || videoAttachment.key}
                          alt="replied-video"
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1,
                            objectFit: "cover",
                            display: "block",
                            backgroundColor: "#000",
                          }}
                        />
                      )}
                      {!replyTo.isDeleted && !imageAttachment && !videoAttachment && fileAttachments.length > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: "#64748B" }} />
                          <ReplyContent>
                            {fileCount === 1 ? fileAttachments[0].name : `${fileCount} files`}
                          </ReplyContent>
                        </Box>
                      )}
                    </Box>
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
                              <Box
                                sx={{
                                  position: "relative",
                                  width: "100%",
                                  height: 150,
                                }}
                              >
                                <Box
                                  component="video"
                                  src={att.url || att.thumbnailUrl}
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
                              </Box>
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

              {fileAttachments.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: content || mediaAttachments.length > 0 ? 1 : 0 }}>
                  {fileAttachments.map((att, index) => (
                    <FileAttachmentCard
                      key={att.key || index}
                      attachment={{
                        name: att.name || "file",
                        size: att.size || 0,
                        type: att.type || "document",
                        url: att.url,
                        key: att.key,
                        contentType: att.contentType,
                      }}
                      isOwn={isOwn}
                      onPreview={() => {
                        const fileUrl = att.url || buildS3Url(att.key);
                        const contentType = (att.contentType || att.content_type || "").toLowerCase();
                        const isVideo = att.type?.toLowerCase() === 'video' || contentType.startsWith('video/');
                        const isImage = att.type?.toLowerCase() === 'image' || contentType.startsWith('image/');
                        
                        onImageClick?.(fileUrl || "", [{
                          key: att.key || fileUrl || "",
                          name: att.name || "file",
                          type: isVideo ? "video" : isImage ? "image" : "document"
                        }], 0);
                      }}
                    />
                  ))}
                </Box>
              )}

              {linkUrls.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: content || mediaAttachments.length > 0 || fileAttachments.length > 0 ? 1 : 0 }}>
                  {linkUrls.map((url, index) => (
                    <LinkPreviewCard key={index} url={url} isOwn={isOwn} />
                  ))}
                </Box>
              )}
            </>
          )}

          {reactions.length > 0 && (
            <ReactionWrap onClick={() => setReactionDetailOpen(true)}>
              {reactions.slice(0, 3).map((r, i) => (
                <Tooltip
                  key={i}
                  title={
                    <Box sx={{ fontSize: 12 }}>
                      {r.userIds.slice(0, 5).map((uid, j) => (
                        <div key={j}>{resolveUserName(uid)}</div>
                      ))}
                      {r.userIds.length > 5 && <div>+{r.userIds.length - 5} khác</div>}
                    </Box>
                  }
                  placement="top"
                  componentsProps={{ tooltip: { sx: { bgcolor: "#1F2937", fontSize: 12 } } }}
                >
                  <ReactionEmoji>
                    {r.emoji}
                    {r.count > 1 && <ReactionCount>{r.count}</ReactionCount>}
                  </ReactionEmoji>
                </Tooltip>
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
              • {t("CHAT.MESSAGE_EDITED")}
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

        <Dialog
          open={reactionDetailOpen}
          onClose={() => setReactionDetailOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, maxHeight: 400 } }}
        >
          <DialogTitle sx={{ fontSize: 16, fontWeight: 600, pb: 0 }}>
            {"Phản ứng"}
          </DialogTitle>
          <DialogContent sx={{ px: 2, py: 1.5 }}>
            <Tabs
              value={reactionTab}
              onChange={(_, v) => setReactionTab(v)}
              variant="scrollable"
              scrollButtons={false}
              sx={{ minHeight: 36, mb: 1, "& .MuiTabs-indicator": { height: 2.5 } }}
            >
              <StyledTab label={`Tất cả (${reactions.reduce((s, r) => s + r.count, 0)})`} />
              {reactions.map((r, i) => (
                <StyledTab key={i} label={`${r.emoji} ${r.count}`} />
              ))}
            </Tabs>
            <Box sx={{ maxHeight: 240, overflowY: "auto" }}>
              {(reactionTab === 0 ? reactions : [reactions[reactionTab - 1]]).map((r, i) =>
                r.userIds.map((uid) => {
                  const name = resolveUserName(uid);
                  return (
                    <Box key={`${uid}-${r.emoji}`} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.6 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "#E5E7EB", color: "#4B5563" }}>
                        {name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography sx={{ fontSize: 14, flex: 1 }}>{name}</Typography>
                      <Typography sx={{ fontSize: 16 }}>{r.emoji}</Typography>
                    </Box>
                  );
                })
              )}
            </Box>
          </DialogContent>
        </Dialog>
      </BubbleWrap>
    </MessageRow>
  );
};

export default MessageItem;