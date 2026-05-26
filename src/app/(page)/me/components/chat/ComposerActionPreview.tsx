"use client";

import { IconButton, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { UiMessage } from "@/src/common/interface/chat-interface";
import { getReplyPreview } from "@/src/common/helpers/displayPreviewReply";
import { sanitizeInputText } from "@/src/common/helpers/chatInput.helpers";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface ComposerActionPreviewProps {
  replyMessage?: UiMessage | { messageId: string; body: string; senderId?: string; senderName?: string } | null;
  editMessage?: UiMessage | null;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
}

const ActionPreviewWrap = styled(Box)({
  padding: "8px 12px",
  background: "#F0F4FF",
  borderLeft: "3px solid #0068FF",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  margin: "8px 12px 0 12px",
  borderRadius: "0 8px 8px 0",
});

const ActionPreviewLeft = styled(Box)({
  minWidth: 0,
  flex: 1,
});

const ActionPreviewTitle = styled(Box)({
  fontSize: 11,
  fontWeight: 600,
  marginBottom: 4,
  color: "#0068FF",
});

const ActionPreviewText = styled(Box)({
  fontSize: 13,
  color: "#4B5563",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const ReplyPreviewImage = styled("img")({
  width: 52,
  height: 52,
  objectFit: "cover",
  borderRadius: 8,
  display: "block",
});

const ReplyPreviewVideo = styled("img")({
  width: 72,
  height: 52,
  objectFit: "cover",
  borderRadius: 8,
  display: "block",
  background: "#000",
});

const ReplyPreviewFileWrap = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 6,
});

const ReplyPreviewFileName = styled(Box)({
  fontSize: 12,
  color: "#4B5563",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 180,
});

export default function ComposerActionPreview({
  replyMessage,
  editMessage,
  onCancelReply,
  onCancelEdit,
}: ComposerActionPreviewProps) {
  const t = useTrans();

  if (replyMessage && !editMessage) {
    const senderName = (replyMessage as any).senderName || (replyMessage as any).senderId || t("CHAT.USER");
    const {
      text: replyText,
      imageAttachment,
      videoAttachment,
      imageCount,
      imageAttachments,
      fileAttachments,
      fileCount,
    } = getReplyPreview(replyMessage as any);

    return (
      <ActionPreviewWrap>
        <ActionPreviewLeft>
          <ActionPreviewTitle>
            Trả lời {senderName}
          </ActionPreviewTitle>

          <ActionPreviewText>{replyText || t("CHAT.MESSAGE")}</ActionPreviewText>

          {imageAttachment && (
            <Box sx={{ position: "relative", display: "inline-block", mt: 1 }}>
              <ReplyPreviewImage
                src={imageAttachment.thumbnailUrl || imageAttachment.url || imageAttachment.key}
                alt=""
              />
              {imageCount > 1 && (
                <Box sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  bgcolor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  fontSize: 11,
                  px: 0.6,
                  borderRadius: 0.8,
                  lineHeight: "18px",
                }}>
                  +{imageCount - 1}
                </Box>
              )}
            </Box>
          )}

          {!imageAttachment && videoAttachment && (
            <Box sx={{ position: "relative", display: "inline-block", mt: 1 }}>
              <ReplyPreviewVideo
                src={videoAttachment.thumbnailUrl || videoAttachment.url || videoAttachment.key}
                alt=""
              />
            </Box>
          )}

          {!imageAttachment && !videoAttachment && fileAttachments.length > 0 && (
            <ReplyPreviewFileWrap>
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: "#64748B" }} />
              <ReplyPreviewFileName>
                {fileCount === 1 ? fileAttachments[0].name : `${fileCount} file`}
              </ReplyPreviewFileName>
            </ReplyPreviewFileWrap>
          )}
        </ActionPreviewLeft>

        <IconButton size="small" onClick={onCancelReply} sx={{ color: "#64748B" }}>
          <CloseIcon fontSize="small" />
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