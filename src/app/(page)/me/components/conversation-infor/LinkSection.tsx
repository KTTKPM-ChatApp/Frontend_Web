"use client";

import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import SectionBlock from "./SectionBlock";

interface LinkSectionProps {
  items: string[];
}

const EmptyHint = styled(Typography)({
  padding: "0 20px 20px",
  textAlign: "center",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#64748B",
});

const ItemList = styled(Box)({
  padding: "0 20px 16px",
});

const ItemRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 0",
});

const ItemContent = styled(Box)({
  minWidth: 0,
  flex: 1,
});

const StyledLink = styled("a")({
  fontSize: 14,
  color: "#0068FF",
  textDecoration: "none",
  wordBreak: "break-word",
  fontFamily: "inherit",
  "&:hover": {
    textDecoration: "underline",
  },
});

const ViewMoreButton = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "4px 0 12px",
  cursor: "pointer",
  color: "#0068FF",
  fontSize: 13,
  fontWeight: 600,
  transition: "all 0.2s ease",
  "&:hover": {
    textDecoration: "underline",
    opacity: 0.8,
  },
});

export default function LinkSection({ items }: LinkSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 8);

  return (
    <SectionBlock title="Link" defaultOpen>
      {items.length > 0 ? (
        <ItemList>
          {visibleItems.map((link) => (
            <ItemRow key={link}>
              <LinkRoundedIcon sx={{ color: "#0068FF" }} />
              <ItemContent>
                <StyledLink href={link} target="_blank" rel="noopener noreferrer">
                  {link}
                </StyledLink>
              </ItemContent>
            </ItemRow>
          ))}
          {items.length > 8 && (
            <ViewMoreButton onClick={() => setExpanded(!expanded)}>
              {expanded ? "Thu gọn" : `Xem thêm (+${items.length - 8})`}
            </ViewMoreButton>
          )}
        </ItemList>
      ) : (
        <EmptyHint>Chưa có link trong hội thoại</EmptyHint>
      )}
    </SectionBlock>
  );
}