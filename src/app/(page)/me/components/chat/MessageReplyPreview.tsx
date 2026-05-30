"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { IMessageReplyPreview } from "@/src/common/interface/chat-interface";
import { getReplyPreview } from "@/src/common/helpers/displayPreviewReply";
import { useChatStore } from "@/src/common/store/useChatStore";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface MessageReplyPreviewProps {
  replyTo?: IMessageReplyPreview | null;
  onClick?: () => void;
  mine?: boolean;
  senderId?: string;
}

const ReplyBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mine",
})<{ mine?: boolean }>(({ mine }) => ({
  backgroundColor: mine ? "#C7E0FF" : "#EBECF0",
  borderRadius: "0 3px 3px 0",
  padding: "8px 10px",
  marginBottom: 6,
  maxWidth: "100%",
  cursor: "pointer",
  borderLeft: "3px solid #0068ff",
}));

const ReplyText = styled(Typography)({
  fontSize: 12,
  color: "#4B5563",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  lineHeight: 1.4,
});

const ReplyMediaImage = styled("img")({
  width: 72,
  height: 72,
  objectFit: "cover",
  borderRadius: 8,
  display: "block",
  marginTop: 6,
});

const ReplyMediaVideo = styled("video")({
  width: 96,
  maxWidth: "100%",
  maxHeight: 120,
  borderRadius: 8,
  display: "block",
  marginTop: 6,
  background: "#000",
});

export default function MessageReplyPreview({
  replyTo,
  onClick,
  mine,
}: MessageReplyPreviewProps) {
  const t = useTrans();
  const conversationId = useChatStore((s) => s.activeConversationId);
  const messagesByConversation = useChatStore((s) =>
    conversationId ? s.messagesByConversation[conversationId] ?? [] : []
  );

  if (!replyTo) return null;

  const originalMessage = messagesByConversation.find(
    (m) => m.messageId === replyTo.messageId
  );

  const currentReplyTo: IMessageReplyPreview = originalMessage
    ? {
        ...replyTo,
        body: originalMessage.isDeleted ? "" : originalMessage.body,
        attachments: originalMessage.isDeleted
          ? []
          : originalMessage.attachments ?? [],
        isDeleted: Boolean(originalMessage.isDeleted),
      }
    : replyTo;

  const { text, imageAttachment, videoAttachment } =
    getReplyPreview(currentReplyTo);

  const isDeleted = Boolean(currentReplyTo.isDeleted);

  return (
    <ReplyBox mine={mine} onClick={onClick}>
      <Box sx={{ alignItems: "stretch", gap: "8px" }}>
        <ReplyText>
          {isDeleted ? t("CHAT.MESSAGE_DELETED") : text}
        </ReplyText>
      </Box>

      {!isDeleted && imageAttachment && (
        <ReplyMediaImage
          src={imageAttachment.url || imageAttachment.key}
          alt={imageAttachment.name ?? "reply-image"}
        />
      )}

      {!isDeleted && videoAttachment && (
        <ReplyMediaVideo
          src={videoAttachment.url || videoAttachment.key}
          preload="metadata"
          muted
        />
      )}
    </ReplyBox>
  );
}