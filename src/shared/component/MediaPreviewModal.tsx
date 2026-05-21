"use client";

import { Dialog, Box, IconButton, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

export interface MediaPreviewItem {
  key: string;
  name?: string;
  type: "image" | "video" | string;
}

// ✅ FIX: Safe S3 URL builder with fallback
export const buildS3Url = (key?: string | null): string => {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  return key;
};

interface MediaPreviewModalProps {
  open: boolean;
  media: MediaPreviewItem | null;
  onClose: () => void;
}

const ViewerRoot = styled(Box)({
  width: "100vw",
  height: "100vh",
  background: "#0B0B0B",
  display: "flex",
  flexDirection: "column",
});

const ViewerHeader = styled(Box)({
  height: 56,
  minHeight: 56,
  padding: "0 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "rgba(0,0,0,0.65)",
  color: "#fff",
  zIndex: 2,
});

const FileName = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  color: "#fff",
  maxWidth: 520,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const HeaderActions = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const ViewerBody = styled(Box)({
  flex: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
});

const FullImage = styled("img")({
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  userSelect: "none",
});

const FullVideo = styled("video")({
  maxWidth: "100%",
  maxHeight: "100%",
  background: "#000",
});

export default function MediaPreviewModal({
  open,
  media,
  onClose,
}: MediaPreviewModalProps) {
  // ✅ FIX: Use safe URL builder
  const mediaUrl = buildS3Url(media?.key);

  const isVideo = media?.type === "video";
  const handleDownload = async () => {
    if (!mediaUrl || !media) return;

    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = media.name || `media-${Date.now()}`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download media failed:", error);

      // fallback nếu fetch bị CORS
      window.open(mediaUrl, "_blank");
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          background: "transparent",
          boxShadow: "none",
        },
      }}
    >
      <ViewerRoot>
        <ViewerHeader>
          <FileName>{media?.name || "Ảnh"}</FileName>

          <HeaderActions>
            {mediaUrl && (
              <Button
                onClick={handleDownload}
                startIcon={<DownloadRoundedIcon />}
                sx={{
                  color: "#fff",
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  minWidth: 0,
                }}
              >
                Tải về
              </Button>
            )}

            <IconButton onClick={onClose} sx={{ color: "#fff" }}>
              <CloseRoundedIcon />
            </IconButton>
          </HeaderActions>
        </ViewerHeader>

        <ViewerBody onClick={onClose}>
          {mediaUrl && !isVideo && (
            <FullImage
              src={mediaUrl}
              alt={media?.name || "image"}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {mediaUrl && isVideo && (
            <FullVideo
              src={mediaUrl}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </ViewerBody>
      </ViewerRoot>
    </Dialog>
  );
}