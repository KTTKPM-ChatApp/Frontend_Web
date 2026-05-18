"use client";

import { useRef, useState, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import { sendTyping, sendStopTyping } from "@/src/common/action/chat.action";
import { styled } from "@mui/material/styles";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import dynamic from "next/dynamic";
import InsertEmoticonRoundedIcon from "@mui/icons-material/InsertEmoticonRounded";
import { EmojiClickData } from "emoji-picker-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

interface ChatInputProps {
  disabled?: boolean;
  conversationId?: string;
  onSend: (value: string) => void;
}

const ChatInputContainer = styled(Box)({
  background: "#fff",
  borderTop: "1px solid #E5E7EB",
  padding: "8px 12px",
});

const InputRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
});

const InputField = styled("input")({
  flex: 1,
  height: 40,
  borderRadius: 20,
  border: "none",
  background: "#F0F2F5",
  padding: "0 14px",
  fontSize: 14,
  color: "#0F172A",
  outline: "none",
  "&::placeholder": {
    color: "#94A3B8",
  },
  "&:focus": {
    background: "#FFFFFF",
    boxShadow: "0 0 0 2px #D8E8FF",
  },
});

const IconBtn = styled(IconButton)({
  width: 34,
  height: 34,
  color: "#64748B",
  borderRadius: "50%",
  "&:hover": {
    background: "#F0F2F5",
    color: "#005AE0",
  },
});

const SendBtn = styled(IconButton)({
  width: 34,
  height: 34,
  borderRadius: "50%",
  backgroundColor: "#005AE0",
  color: "#FFFFFF",
  "&:hover": {
    backgroundColor: "#004BB5",
  },
  "&:disabled": {
    backgroundColor: "#E5E7EB",
    color: "#94A3B8",
  },
});

const EmojiWrap = styled(Box)({
  position: "relative",
});

const PickerBox = styled(Box)({
  position: "absolute",
  bottom: 44,
  left: 0,
  zIndex: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  borderRadius: 12,
  overflow: "hidden",
});

export default function ChatInput({ disabled, conversationId, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasText = !!value.trim();
  const lastTypingTime = useRef<number>(0);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      if (conversationId) {
        const now = Date.now();
        if (now - lastTypingTime.current >= 1000) {
          lastTypingTime.current = now;
          sendTyping(conversationId);
        }
      }
    },
    [conversationId]
  );

  const handleSend = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    if (conversationId) sendStopTyping(conversationId);
    setValue("");
    setOpenEmoji(false);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const el = inputRef.current;
    const emoji = emojiData.emoji;
    if (!el) {
      setValue((prev) => prev + emoji);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const newValue = value.slice(0, start) + emoji + value.slice(end);
    setValue(newValue);
    requestAnimationFrame(() => {
      el.focus();
      const nextPos = start + emoji.length;
      el.setSelectionRange(nextPos, nextPos);
    });
  };

  return (
    <ChatInputContainer>
      <InputRow>
        <EmojiWrap>
          <IconBtn onClick={() => setOpenEmoji((prev) => !prev)} disabled={disabled}>
            <InsertEmoticonRoundedIcon fontSize="small" />
          </IconBtn>
          {openEmoji && (
            <PickerBox>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={320}
                height={400}
                previewConfig={{ showPreview: false }}
                searchDisabled={false}
                skinTonesDisabled
              />
            </PickerBox>
          )}
        </EmojiWrap>

        <InputField
          ref={inputRef}
          placeholder="Nhập tin nhắn..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        {hasText ? (
          <SendBtn onClick={handleSend} disabled={disabled}>
            <SendRoundedIcon fontSize="small" />
          </SendBtn>
        ) : (
          <IconBtn disabled={disabled}>
            <MicRoundedIcon fontSize="small" />
          </IconBtn>
        )}
      </InputRow>
    </ChatInputContainer>
  );
}
