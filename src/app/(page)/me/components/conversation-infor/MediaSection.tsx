"use client";

import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import SectionBlock from "./SectionBlock";
import { AttachmentDto } from "@/src/common/interface/chat-interface";

interface MediaSectionProps {
  items: AttachmentDto[];
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

export default function MediaSection({ items }: MediaSectionProps) {
  return (
    <SectionBlock title="Ảnh/Video" defaultOpen>
      {items.length > 0 ? (
        <>
          <MediaGrid>
            {items.slice(0, 8).map((item) => (
              <MediaItem key={item.key || item?.url}>
                {item.url ? (
                  <MediaImage src={item?.url} alt={item.name || "media"} />
                ) : (
                  <MediaFallback>
                    <InsertPhotoOutlinedIcon />
                  </MediaFallback>
                )}
              </MediaItem>
            ))}
          </MediaGrid>

          {items.length > 8 && <ViewAllButton fullWidth>Xem tất cả</ViewAllButton>}
        </>
      ) : (
        <EmptyHint>Chưa có ảnh hoặc video trong hội thoại</EmptyHint>
      )}
    </SectionBlock>
  );
}