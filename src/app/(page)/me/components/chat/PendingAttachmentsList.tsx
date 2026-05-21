"use client";

import { IconButton, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { ChatAttachmentPayload } from "@/src/common/interface/media-interface";

interface PendingAttachmentListProps {
  attachments: ChatAttachmentPayload[];
  onRemove: (key: string) => void;
}

const PendingWrap = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  padding: "0 0 8px",
});

const PendingItem = styled(Box)({
  position: "relative",
  width: 72,
  height: 72,
  borderRadius: 8,
  overflow: "hidden",
  background: "#F1F5F9",
  flexShrink: 0,
  border: "1px solid #E2E8F0",
});

const PreviewImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
});

const PreviewVideo = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  background: "#000",
});

const VideoOverlay = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
});

const FilePreview = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  padding: 6,
  background: "#FFFFFF",
});

const FileName = styled(Typography)({
  fontSize: 9,
  lineHeight: 1.2,
  color: "#334155",
  textAlign: "center",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  wordBreak: "break-word",
});

const FileExt = styled(Box)({
  fontSize: 8,
  lineHeight: 1,
  fontWeight: 700,
  color: "#2563EB",
  background: "#DBEAFE",
  borderRadius: 3,
  padding: "1px 3px",
  textTransform: "uppercase",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const RemoveButton = styled(IconButton)({
  position: "absolute",
  top: 2,
  right: 2,
  width: 18,
  height: 18,
  minWidth: 18,
  background: "rgba(0, 0, 0, 0.6)",
  color: "#fff",
  zIndex: 2,
  "&:hover": {
    background: "rgba(0, 0, 0, 0.8)",
  },
});

const getPreviewSrc = (item: ChatAttachmentPayload) =>
  item.url || item.thumbnailUrl || "";

const getFileExtension = (fileName?: string, key?: string) => {
  const source = fileName || key || "";
  const ext = source.split(".").pop();
  return ext ? ext.slice(0, 4) : "FILE";
};

export default function PendingAttachmentList({
  attachments,
  onRemove,
}: PendingAttachmentListProps) {
  if (!attachments.length) return null;

  return (
    <PendingWrap data-testid="preview-file-inputChat">
      {attachments.map((item) => {
        const previewSrc = getPreviewSrc(item);
        const fileExt = getFileExtension(item.name, item.key);

        return (
          <PendingItem key={item.key}>
            {item.type === "image" ? (
              <PreviewImage
                src={previewSrc}
                alt={item.name || "preview-image"}
              />
            ) : item.type === "video" ? (
              <>
                <PreviewVideo
                  src={previewSrc}
                  muted
                  playsInline
                  preload="metadata"
                />
                <VideoOverlay>
                  <PlayArrowRoundedIcon sx={{ fontSize: 16, color: "#fff" }} />
                </VideoOverlay>
              </>
            ) : (
              <FilePreview>
                <InsertDriveFileOutlinedIcon
                  sx={{ fontSize: 22, color: "#64748B" }}
                />
                <FileExt>{fileExt}</FileExt>
                <FileName>{item.name || "Tệp"}</FileName>
              </FilePreview>
            )}

            <RemoveButton size="small" onClick={() => onRemove(item.key)}>
              <CloseIcon sx={{ width: 12, height: 12 }} />
            </RemoveButton>
          </PendingItem>
        );
      })}
    </PendingWrap>
  );
}
