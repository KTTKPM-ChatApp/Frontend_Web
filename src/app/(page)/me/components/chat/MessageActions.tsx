"use client";

import { IconButton, Tooltip, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import PushPinIcon from "@mui/icons-material/PushPin";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface MessageActionsProps {
  mine?: boolean;
  canReply: boolean;
  canDelete: boolean;
  canForward: boolean;
  canPin: boolean;
  isPinned: boolean;
  onReply: () => void;
  onDelete: () => void;
  onForward: () => void;
  onTogglePin: () => void;
}

const ActionsWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine",
})<{ mine?: boolean }>(({ mine }) => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  opacity: 0,
  visibility: "hidden",
  transform: "translateY(4px)",
  transition: "all 0.2s ease",
  pointerEvents: "auto",
  order: mine ? -1 : 1,
}));

export default function MessageActions({
  mine,
  canReply,
  canDelete,
  canForward,
  canPin,
  isPinned,
  onReply,
  onDelete,
  onForward,
  onTogglePin,
}: MessageActionsProps) {
  const t = useTrans();
  return (
    <ActionsWrap className="message-actions" mine={mine}>
      {canReply && (
        <Tooltip title={t("CHAT.ACTION_REPLY")}>
          <IconButton size="small" onClick={onReply}>
            <ReplyOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {canForward && (
        <Tooltip title={t("CHAT.ACTION_FORWARD")}>
          <IconButton size="small" onClick={onForward}>
            <ForwardToInboxIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {canPin && !isPinned && (
        <Tooltip title={t("CHAT.ACTION_PIN")}>
          <IconButton size="small" onClick={onTogglePin}>
            <PushPinIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {canDelete && (
        <Tooltip title={t("CHAT.ACTION_DELETE")}>
          <IconButton size="small" onClick={onDelete}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </ActionsWrap>
  );
}