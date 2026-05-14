"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, Box, IconButton, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export interface MediaPreviewItem {
  key: string;
  name?: string;
  type: "image" | "video" | string;
}

interface MediaPreviewModalProps {
  open: boolean;
  media: MediaPreviewItem | null;
  mediaList?: MediaPreviewItem[];
  initialIndex?: number;
  onClose: () => void;
}

// ✅ FIX: Safe S3 URL builder with fallback
const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_BASE_URL || "http://18.138.217.102:9000";

export const buildS3Url = (key?: string | null): string => {
  if (!key) return "";
  // Prevent double slashes
  const cleanBase = S3_BASE_URL.replace(/\/+$/, "");
  const cleanKey = key.replace(/^\/+/, "");
  return `${cleanBase}/${cleanKey}`;
};

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
  gap: 12,
});

const Counter = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  color: "#fff",
  opacity: 0.8,
});

const ViewerBody = styled(Box)({
  flex: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  padding: "24px 80px", // Space for navigation arrows
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

const NavButton = styled(IconButton)({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 48,
  height: 48,
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  zIndex: 10,
  "&:hover": {
    background: "rgba(255,255,255,0.2)",
  },
  "&.prev": {
    left: 16,
  },
  "&.next": {
    right: 16,
  },
});

const ThumbnailBar = styled(Box)({
  height: 100,
  minHeight: 100,
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: "rgba(0,0,0,0.85)",
  overflowX: "auto",
  overflowY: "hidden",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(255,255,255,0.3) transparent",
  "&::-webkit-scrollbar": {
    height: 4,
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
});

const ThumbnailItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active }) => ({
  width: 72,
  height: 72,
  flexShrink: 0,
  borderRadius: 6,
  overflow: "hidden",
  cursor: "pointer",
  border: active ? "2px solid #fff" : "2px solid transparent",
  opacity: active ? 1 : 0.6,
  transition: "all 0.2s ease",
  "&:hover": {
    opacity: 1,
  },
}));

const ThumbnailImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const ThumbnailVideo = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

export default function MediaPreviewModal({
  open,
  media,
  mediaList = [],
  initialIndex = 0,
  onClose,
}: MediaPreviewModalProps) {
  // Xây dựng danh sách media đầy đủ
  const allMedia = media && mediaList.length === 0 ? [media] : mediaList.length > 0 ? mediaList : [];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index khi mở modal
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  const currentMedia = allMedia[currentIndex] || media;
  const totalCount = allMedia.length;
  const hasNavigation = totalCount > 1;

  // ✅ FIX: Use safe URL builder
  const mediaUrl = buildS3Url(currentMedia?.key);
  const isVideo = currentMedia?.type === "video";

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalCount - 1));
  }, [totalCount]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < totalCount - 1 ? prev + 1 : 0));
  }, [totalCount]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!hasNavigation) return;
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") onClose();
  }, [hasNavigation, handlePrev, handleNext, onClose]);

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const handleDownload = async () => {
    if (!mediaUrl || !currentMedia) return;

    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = currentMedia.name || `media-${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download media failed:", error);
      window.open(mediaUrl, "_blank");
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (!currentMedia) return null;

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
          <FileName>{currentMedia?.name || "Ảnh"}</FileName>

          <HeaderActions>
            {hasNavigation && (
              <Counter>
                {currentIndex + 1} / {totalCount}
              </Counter>
            )}
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
          {hasNavigation && (
            <NavButton className="prev" onClick={handlePrev}>
              <NavigateBeforeIcon fontSize="large" />
            </NavButton>
          )}

          {mediaUrl && !isVideo && (
            <FullImage
              src={mediaUrl}
              alt={currentMedia?.name || "image"}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {mediaUrl && isVideo && (
            <FullVideo
              src={mediaUrl}
              controls
              autoPlay
              key={currentMedia.key} // Force re-render when changing video
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {hasNavigation && (
            <NavButton className="next" onClick={handleNext}>
              <NavigateNextIcon fontSize="large" />
            </NavButton>
          )}
        </ViewerBody>

        {hasNavigation && (
          <ThumbnailBar>
            {allMedia.map((item, index) => {
              // ✅ FIX: Use safe URL builder
              const thumbUrl = buildS3Url(item.key);
              const isActive = index === currentIndex;

              return (
                <ThumbnailItem
                  key={item.key}
                  active={isActive}
                  onClick={() => handleThumbnailClick(index)}
                >
                  {item.type === "video" ? (
                    <ThumbnailVideo src={thumbUrl} muted preload="metadata" />
                  ) : (
                    <ThumbnailImage src={thumbUrl} alt={item.name} />
                  )}
                </ThumbnailItem>
              );
            })}
          </ThumbnailBar>
        )}
      </ViewerRoot>
    </Dialog>
  );
}