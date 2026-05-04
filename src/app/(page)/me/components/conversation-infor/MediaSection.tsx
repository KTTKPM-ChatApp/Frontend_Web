"use client";

import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import SectionBlock from "./SectionBlock";
import { AttachmentDto } from "@/src/common/interface/chat-interface";
import { buildS3Url, MediaPreviewItem } from "@/src/common/components/MediaPreviewModal";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface MediaSectionProps {
  items: AttachmentDto[];
  onMediaClick?: (media: MediaPreviewItem) => void;
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
  cursor: "pointer",
  transition: "opacity 0.2s ease",
  "&:hover": {
    opacity: 0.85,
  },
});

const MediaImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
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
  const handleMediaClick = (item: AttachmentDto) => {
    if (!onMediaClick || !item.key) return;

    const mediaItem: MediaPreviewItem = {
      key: item.key,
      name: item.name,
      type: item.type as "image" | "video" | string,
    };
    onMediaClick(mediaItem);
  };

  return (
    <SectionBlock title={t("CONVO.MEDIA_TITLE")} defaultOpen>
      {items.length > 0 ? (
        <>
          <MediaGrid>
            {items.slice(0, 8).map((item) => (
              <MediaItem
                key={item.key || item?.url}
                onClick={() => handleMediaClick(item)}
              >
                {item.key ? (
                  <MediaImage
                    src={buildS3Url(item.key)}
                    alt={item.name || "media"}
                  />
                ) : (
                  <MediaFallback>
                    <InsertPhotoOutlinedIcon />
                  </MediaFallback>
                )}
              </MediaItem>
            ))}
          </MediaGrid>

          {items.length > 8 && <ViewAllButton fullWidth>{t("CONVO.VIEW_ALL")}</ViewAllButton>}
        </>
      ) : (
        <EmptyHint>{t("CONVO.MEDIA_EMPTY")}</EmptyHint>
      )}
    </SectionBlock>
  );
}