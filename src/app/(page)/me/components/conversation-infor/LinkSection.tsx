"use client";

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
  alignItems: "flex-start",
  gap: 10,
  padding: "10px 0",
});

const ItemContent = styled(Box)({
  minWidth: 0,
  flex: 1,
});

const StyledLink = styled("a")({
  fontSize: 14,
  color: "#0F3B82",
  textDecoration: "none",
  wordBreak: "break-word",
});

export default function LinkSection({ items }: LinkSectionProps) {
  return (
    <SectionBlock title="Link" defaultOpen>
      {items.length > 0 ? (
        <ItemList>
          {items.slice(0, 8).map((link) => (
            <ItemRow key={link}>
              <LinkRoundedIcon sx={{ color: "#0F3B82", mt: "2px" }} />
              <ItemContent>
                <StyledLink href={link} target="_blank" rel="noopener noreferrer">
                  {link}
                </StyledLink>
              </ItemContent>
            </ItemRow>
          ))}
        </ItemList>
      ) : (
        <EmptyHint>Chưa có link trong hội thoại</EmptyHint>
      )}
    </SectionBlock>
  );
}