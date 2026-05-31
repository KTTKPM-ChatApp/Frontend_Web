"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, Box, IconButton, Typography, Button } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useTrans } from "@/src/common/utilities/hook/trans";

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
export const buildS3Url = (key?: string | null): string => {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  
  const cloudName = "dokskn4kz";
  const ext = key.split(".").pop()?.toLowerCase() || "";
  
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${key}`;
  }
  if (["mp4", "webm", "ogg", "mov"].includes(ext)) {
    return `https://res.cloudinary.com/${cloudName}/video/upload/${key}`;
  }
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${key}`;
};

const animScaleUp = keyframes`
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const ViewerRoot = styled(Box)({
  width: "100vw",
  height: "100vh",
  background: "rgba(30, 41, 59, 0.65)", // Premium semi-transparent slate-grey
  backdropFilter: "blur(18px)",          // Blurry backdrop
  WebkitBackdropFilter: "blur(18px)",    // Safari support
  display: "flex",
  flexDirection: "column",
});

const ViewerHeader = styled(Box)({
  height: 56,
  minHeight: 56,
  padding: "0 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "rgba(15, 23, 42, 0.4)",  // Subtle slate-grey accent
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  color: "#fff",
  zIndex: 2,
});

const FileName = styled(Typography)({
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  maxWidth: 520,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  letterSpacing: "0.2px",
});

const HeaderActions = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 16,
});

const Counter = styled(Typography)({
  fontWeight: 600,
  color: "#fff",
  opacity: 0.9,
  background: "rgba(255, 255, 255, 0.1)",
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "12px",
});

const ViewerBody = styled(Box)({
  flex: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  padding: "32px 96px", // Space for navigation arrows
});

const FullImage = styled("img")({
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  userSelect: "none",
  borderRadius: "12px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  animation: `${animScaleUp} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`,
});

const FullVideo = styled("video")({
  maxWidth: "100%",
  maxHeight: "100%",
  background: "#000",
  borderRadius: "12px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  animation: `${animScaleUp} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`,
});

const NavButton = styled(IconButton)({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 50,
  height: 50,
  background: "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  color: "#fff",
  zIndex: 10,
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.22)",
    transform: "translateY(-50%) scale(1.08)",
    boxShadow: "0 0 15px rgba(255, 255, 255, 0.25)",
  },
  "&:active": {
    transform: "translateY(-50%) scale(0.95)",
  },
  "&.prev": {
    left: 24,
  },
  "&.next": {
    right: 24,
  },
});

const ThumbnailBar = styled(Box)({
  height: 100,
  minHeight: 100,
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  background: "rgba(15, 23, 42, 0.5)",  // Subtle slate-grey accent
  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
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
  borderRadius: 8,
  overflow: "hidden",
  cursor: "pointer",
  border: active ? "3px solid #0068FF" : "2px solid rgba(255, 255, 255, 0.1)",
  boxShadow: active ? "0 0 12px rgba(0, 104, 255, 0.5)" : "none",
  opacity: active ? 1 : 0.6,
  transition: "all 0.25s ease",
  "&:hover": {
    opacity: 1,
    transform: "scale(1.05)",
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
  const t = useTrans();
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

  const fileName = currentMedia?.name || "";
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  const isVideo = currentMedia?.type === "video" || ["mp4", "webm", "ogg", "mov"].includes(ext);
  const isPdf = ext === "pdf";
  const isTxt = ["txt", "log", "json", "js", "ts", "html", "css", "md"].includes(ext);
  const isOffice = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext);
  const isImage = !isVideo && !isPdf && !isTxt && !isOffice;



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
                {t("COMMON.DOWNLOAD")}
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

          {mediaUrl && isImage && (
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

          {mediaUrl && isPdf && (
            <Box
              component="iframe"
              src={mediaUrl}
              sx={{
                width: "80%",
                height: "90%",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                animation: `${animScaleUp} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`,
              }}
              onClick={(e: any) => e.stopPropagation()}
            />
          )}

          {mediaUrl && isOffice && (
            <Box
              component="iframe"
              src={`https://docs.google.com/gview?url=${encodeURIComponent(mediaUrl)}&embedded=true`}
              sx={{
                width: "80%",
                height: "90%",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                animation: `${animScaleUp} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`,
              }}
              onClick={(e: any) => e.stopPropagation()}
            />
          )}

          {mediaUrl && isTxt && (
            <Box
              component="iframe"
              src={mediaUrl}
              sx={{
                width: "80%",
                height: "90%",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                animation: `${animScaleUp} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`,
              }}
              onClick={(e: any) => e.stopPropagation()}
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