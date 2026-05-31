"use client";

import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SectionBlock from "./SectionBlock";
import { AttachmentDto } from "@/src/common/interface/chat-interface";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface MediaSectionProps {
  items: AttachmentDto[];
  onMediaClick?: (url: string, mediaList: AttachmentDto[], index: number) => void;
}

const EmptyHint = styled(Typography)({
  padding: "0 20px 20px",
  textAlign: "center",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#64748B",
});

const MediaGrid = styled(Box)({
  padding: "0 20px 20px",
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 8,
});

const MediaItem = styled(Box)({
  width: "100%",
  aspectRatio: "1 / 1",
  borderRadius: 6,
  overflow: "hidden",
  background: "#E5E7EB",
  border: "1px solid #E5E7EB",
});

const MediaImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
});

const MediaVideo = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  background: "#000",
});

const VideoWrapper = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
});

const PlayOverlay = styled(Box)({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0, 0, 0, 0.15)",
  color: "#ffffff",
  transition: "all 0.2s ease",
  "& svg": {
    fontSize: 28,
    filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
  },
  "&:hover": {
    background: "rgba(0, 0, 0, 0.3)",
    "& svg": {
      transform: "scale(1.1)",
    },
  },
});

const MediaFallback = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748B",
});

const ViewAllButton = styled(Button)({
  margin: "0 20px 20px",
  height: 44,
  borderRadius: 8,
  background: "#EEF2F7",
  color: "#0F2F6B",
  fontSize: 16,
  fontWeight: 700,
  textTransform: "none",
  boxShadow: "none",

  "&:hover": {
    background: "#E4EAF3",
    boxShadow: "none",
  },
});

export default function MediaSection({ items, onMediaClick }: MediaSectionProps) {
  const t = useTrans();
  return (
    <SectionBlock title={t("CONVO.MEDIA_TITLE")} defaultOpen>
      {items.length > 0 ? (
        <>
          <MediaGrid>
            {items.slice(0, 8).map((item, index) => {
              const isVideo = item.type === "video" || item.resourceType === "video" || (item.name && item.name.match(/\.(mp4|m4v|webm|ogv|mov|avi)$/i)) || (item.url && item.url.match(/\.(mp4|m4v|webm|ogv|mov|avi)$/i));
              return (
                <MediaItem
                  key={item.key || item?.url}
                  onClick={() => onMediaClick?.(item.url || "", items, index)}
                  sx={{ cursor: onMediaClick ? "pointer" : "default" }}
                >
                  {item.url ? (
                    isVideo ? (
                      <VideoWrapper>
                        <MediaVideo src={item.url} preload="metadata" playsInline muted />
                        <PlayOverlay>
                          <PlayArrowRoundedIcon />
                        </PlayOverlay>
                      </VideoWrapper>
                    ) : (
                      <MediaImage src={item?.url} alt={item.name || "media"} />
                    )
                  ) : (
                    <MediaFallback>
                      <InsertPhotoOutlinedIcon />
                    </MediaFallback>
                  )}
                </MediaItem>
              );
            })}
          </MediaGrid>

          {items.length > 8 && <ViewAllButton fullWidth>{t("CONVO.VIEW_ALL")}</ViewAllButton>}
        </>
      ) : (
        <EmptyHint>{t("CONVO.MEDIA_EMPTY")}</EmptyHint>
      )}
    </SectionBlock>
  );
}