"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

interface LinkPreviewCardProps {
  url: string;
  isOwn?: boolean;
}

const LinkCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isOwn",
})<{ isOwn?: boolean }>(({ isOwn }) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 8,
  background: isOwn ? "rgba(0, 0, 0, 0.04)" : "#F0F9FF",
  border: `1px solid ${isOwn ? "rgba(0, 0, 0, 0.08)" : "#BAE6FD"}`,
  cursor: "pointer",
  transition: "all 0.15s ease",
  maxWidth: 300,
  "&:hover": {
    background: isOwn ? "rgba(0, 0, 0, 0.07)" : "#E0F2FE",
  },
}));

const LinkIconBox = styled(Box)({
  width: 28,
  height: 28,
  borderRadius: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  background: "#E0F2FE",
});

const LinkText = styled(Typography)({
  fontSize: 12,
  color: "#0284C7",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  textDecoration: "underline",
  textUnderlineOffset: 2,
});

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
};

export default function LinkPreviewCard({ url, isOwn }: LinkPreviewCardProps) {
  const domain = getDomain(url);

  return (
    <LinkCard isOwn={isOwn} onClick={() => window.open(url, "_blank")}>
      <LinkIconBox>
        <LinkRoundedIcon sx={{ fontSize: 16, color: "#0284C7" }} />
      </LinkIconBox>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <LinkText>{url}</LinkText>
        <Typography sx={{ fontSize: 10, color: "#94A3B8", marginTop: 0.5 }}>
          {domain}
        </Typography>
      </Box>
    </LinkCard>
  );
}
