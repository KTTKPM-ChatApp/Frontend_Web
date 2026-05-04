"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { UiMessage } from "@/src/common/interface/chat-interface";
import { buildSystemMessageText } from "@/src/common/helpers/systemMessage.helpers";

interface Props {
  message: UiMessage;
}

const Wrap = styled(Box)({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  margin: "2px 0",
});

const Banner = styled(Box)({
  maxWidth: "70%",
  background: "#ffffffd9",
  color: "#6B7280",
  fontSize: 12,
  lineHeight: 1.4,
  padding: "6px 16px",
  borderRadius: 999,
  textAlign: "center",
  wordBreak: "break-word",
});

const Text = styled(Typography)({
  fontSize: 12,
  color: "#6B7280",
  lineHeight: 1.4,
});

export default function SystemMessageBanner({ message }: Props) {
  return (
    <Wrap data-message-id={message.messageId}>
      <Banner>
        <Text>{buildSystemMessageText(message)}</Text>
      </Banner>
    </Wrap>
  );
}