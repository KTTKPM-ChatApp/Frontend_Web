"use client";

import { IconButton, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { UiMessage } from "@/src/common/interface/chat-interface";
import { getReplyPreview } from "@/src/common/helpers/displayPreviewReply";
import { sanitizeInputText } from "@/src/common/helpers/chatInput.helpers";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface ComposerActionPreviewProps {
  replyMessage?: UiMessage | null;
  editMessage?: UiMessage | null;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
}

const ActionPreviewWrap = styled(Box)({
  padding: "8px 12px",
  borderBottom: "1px solid #F1F5F9",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

const ActionPreviewLeft = styled(Box)({
  minWidth: 0,
  flex: 1,
});

const ActionPreviewTitle = styled(Box)({
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 2,
});

const ActionPreviewText = styled(Box)({
  fontSize: 12,
  color: "#64748B",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const ReplyPreviewImage = styled("img")({
  width: 52,
  height: 52,
  objectFit: "cover",
  borderRadius: 8,
  marginTop: 6,
  display: "block",
});

const ReplyPreviewVideo = styled("video")({
  width: 72,
  maxWidth: "100%",
  maxHeight: 72,
  borderRadius: 8,
  marginTop: 6,
  display: "block",
  background: "#000",
});

export default function ComposerActionPreview({
  replyMessage,
  editMessage,
  onCancelReply,
  onCancelEdit,
}: ComposerActionPreviewProps) {
  const t = useTrans();
  if (replyMessage && !editMessage) {
    const replyPreview = getReplyPreview(replyMessage);

    return (
      <ActionPreviewWrap>
        <ActionPreviewLeft>
          <ActionPreviewTitle sx={{ color: "#2563EB" }}>
            {t("CHAT.REPLYING")}
          </ActionPreviewTitle>

          <ActionPreviewText>{replyPreview.text}</ActionPreviewText>

          {replyPreview.imageAttachment && (
            <ReplyPreviewImage
              src={
                `${process.env.NEXT_PUBLIC_S3_BASE_URL}/${replyPreview.imageAttachment.key}`
              }
              alt={replyPreview.imageAttachment.name ?? "reply-image"}
            />
          )}

          {replyPreview.videoAttachment && (
            <ReplyPreviewVideo
              src={
                `${process.env.NEXT_PUBLIC_S3_BASE_URL}/${replyPreview.videoAttachment.key}`
              }
              preload="metadata"
              muted
            />
          )}
        </ActionPreviewLeft>

        <IconButton size="small" onClick={onCancelReply}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </ActionPreviewWrap>
    );
  }

  if (editMessage) {
    return (
      <ActionPreviewWrap>
        <ActionPreviewLeft>
          <ActionPreviewTitle sx={{ color: "#D97706" }}>
            {t("CHAT.EDITING_MESSAGE")}
          </ActionPreviewTitle>

          <ActionPreviewText>
            {sanitizeInputText(editMessage.body) || t("CHAT.MESSAGE")}
          </ActionPreviewText>
        </ActionPreviewLeft>

        <IconButton size="small" onClick={onCancelEdit}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </ActionPreviewWrap>
    );
  }

  return null;
}