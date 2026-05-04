"use client";

import { ReactNode, useState } from "react";
import { Box, Collapse, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

interface SectionBlockProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

const Root = styled(Box)({
  background: "#fff",
  marginBottom: 8,
});

const Header = styled(Box)({
  minHeight: 56,
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
});

const Title = styled(Typography)({
  fontSize: 16,
  fontWeight: 700,
  color: "#0F172A",
});

const ArrowButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ open }) => ({
  width: 28,
  height: 28,
  color: "#64748B",
  transform: open ? "rotate(180deg)" : "rotate(0deg)",
  transition: "transform 0.2s ease",
}));

export default function SectionBlock({
  title,
  defaultOpen = true,
  children,
}: SectionBlockProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Root>
      <Header onClick={() => setOpen((prev) => !prev)}>
        <Title>{title}</Title>

        <ArrowButton open={open}>
          <KeyboardArrowDownRoundedIcon />
        </ArrowButton>
      </Header>

      <Collapse in={open}>{children}</Collapse>
    </Root>
  );
}