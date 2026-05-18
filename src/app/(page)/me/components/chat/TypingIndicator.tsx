"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const Root = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "4px 16px",
  minHeight: 28,
});

const Dot = styled(Box)({
  width: 6,
  height: 6,
  borderRadius: "50%",
  backgroundColor: "#94A3B8",
  animation: "typingPulse 1.4s infinite ease-in-out",
  "&:nth-of-type(2)": {
    animationDelay: "0.2s",
  },
  "&:nth-of-type(3)": {
    animationDelay: "0.4s",
  },
  "@keyframes typingPulse": {
    "0%, 60%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
    "30%": { opacity: 1, transform: "scale(1)" },
  },
});

interface TypingIndicatorProps {
  names: string[];
  count: number;
}

export default function TypingIndicator({ names, count }: TypingIndicatorProps) {
  const text =
    count === 1
      ? `${names[0]} đang nhập...`
      : count === 2
        ? `${names[0]} và ${names[1]} đang nhập...`
        : `${names[0]} và ${count - 1} người khác đang nhập...`;

  return (
    <Root>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Dot />
        <Dot />
        <Dot />
      </Box>
      <Typography variant="caption" sx={{ color: "#64748B", fontStyle: "italic" }}>
        {text}
      </Typography>
    </Root>
  );
}
