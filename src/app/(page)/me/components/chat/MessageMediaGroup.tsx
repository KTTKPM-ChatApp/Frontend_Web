"use client";

import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { UiMessage } from "@/src/common/interface/chat-interface";
import { MediaPreviewItem } from "@/src/shared/component/MediaPreviewModal";
import { buildS3Url } from "@/src/common/components/MediaPreviewModal";

interface MessageMediaGroupProps {
  attachments: any[];
  type: "image" | "video";
  mine?: boolean;
  messageId: UiMessage["messageId"];
  onMediaLoad?: (messageId: UiMessage["messageId"]) => void;
  onOpenMedia?: (media: MediaPreviewItem, allMedia?: MediaPreviewItem[], initialIndex?: number) => void;
}

// Zalo-style grid layout
const MediaWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== "count" && prop !== "mine",
})<{ count: number; mine?: boolean }>(({ count, mine }) => ({
  display: "grid",
  gap: 4,
  // Grid layout based on image count (like Zalo)
  ...(count === 1 && {
    gridTemplateColumns: "1fr",
    maxWidth: 280,
  }),
  ...(count === 2 && {
    gridTemplateColumns: "repeat(2, 1fr)",
    maxWidth: 320,
  }),
  ...(count === 3 && {
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    maxWidth: 320,
    "& > *:first-of-type": {
      gridColumn: "span 2",
    },
  }),
  ...(count >= 4 && {
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    maxWidth: 320,
  }),
  alignSelf: mine ? "flex-end" : "flex-start",
  borderRadius: 12,
  overflow: "hidden",
}));

const MediaItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isLast" && prop !== "hasMore",
})<{ isLast?: boolean; hasMore?: boolean }>(({ isLast, hasMore }) => ({
  cursor: "pointer",
  overflow: "hidden",
  position: "relative",
  lineHeight: 0,
  aspectRatio: "1 / 1",
  ...(isLast && hasMore && {
    "&::after": {
      content: 'attr(data-more)',
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: 24,
      fontWeight: 600,
    },
  }),
}));

const MessageImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const MessageVideo = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  background: "#000",
});

const MAX_DISPLAY = 4;

export default function MessageMediaGroup({
  attachments,
  type,
  mine,
  messageId,
  onMediaLoad,
  onOpenMedia,
}: MessageMediaGroupProps) {
  if (!attachments.length) return null;

  // Build media list for gallery view
  const allMedia: MediaPreviewItem[] = attachments.map((file) => ({
    key: file.key,
    name: file.name,
    type: type as "image" | "video",
  }));

  // Show only first MAX_DISPLAY, with "+X more" overlay on last one
  const displayAttachments = attachments.slice(0, MAX_DISPLAY);
  const hasMore = attachments.length > MAX_DISPLAY;
  const moreCount = attachments.length - MAX_DISPLAY + 1;

  return (
    <MediaWrap count={Math.min(attachments.length, MAX_DISPLAY)} mine={mine}>
      {displayAttachments.map((file, index) => {
        const mediaUrl = buildS3Url(file.key);
        const isLast = index === displayAttachments.length - 1;

        return (
          <MediaItem
            key={file.key}
            isLast={isLast}
            hasMore={hasMore && isLast}
            data-more={moreCount}
            onClick={() => onOpenMedia?.(allMedia[index], allMedia, index)}
          >
            {type === "image" ? (
              <MessageImage
                src={mediaUrl}
                alt={file.name || "image"}
                onLoad={() => onMediaLoad?.(messageId)}
              />
            ) : (
              <MessageVideo
                src={mediaUrl}
                muted
                playsInline
                onLoadedMetadata={() => onMediaLoad?.(messageId)}
              />
            )}
          </MediaItem>
        );
      })}
    </MediaWrap>
  );
}