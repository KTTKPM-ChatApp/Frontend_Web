"use client";

import { useRef, useState } from "react";
import { Box, IconButton, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import MicIcon from "@mui/icons-material/Mic";
import dynamic from "next/dynamic";
import InsertEmoticonRoundedIcon from "@mui/icons-material/InsertEmoticonRounded";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ImageIcon from "@mui/icons-material/Image";
import { EmojiClickData } from "emoji-picker-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

interface ChatInputProps {
  disabled?: boolean;
  onSend: (value: string) => void;
}

const ChatInputContainer = styled(Box)({
  background: "#fff",
  borderTop: "1px solid #E5E7EB",
  padding: "12px 14px",
});

const InputRow = styled(Box)({
  display: "flex",
  alignItems: "flex-end",
  gap: 8,
});

const InputField = styled(TextField)({
  flex: 1,
  "& .MuiOutlinedInput-root": {
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    "&:hover": {
      backgroundColor: "#EFF2F7",
    },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
      boxShadow: "0 0 0 2px #D8E8FF",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },
  "& .MuiInputBase-input": {
    fontSize: 14,
    color: "#0F172A",
    padding: "10px 14px",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#94A3B8",
  },
});

const ActionButton = styled(IconButton)({
  width: 34,
  height: 34,
  borderRadius: 8,
  color: "#64748B",
  backgroundColor: "#F8FAFC",
  "&:hover": {
    backgroundColor: "#E5E7EB",
    color: "#0F172A",
  },
});

const SendButton = styled(IconButton)({
  width: 34,
  height: 34,
  borderRadius: 8,
  backgroundColor: "#0078FF",
  color: "#FFFFFF",
  "&:hover": {
    backgroundColor: "#0056CC",
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
  right: 0,
  zIndex: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  borderRadius: 12,
  overflow: "hidden",
});

export default function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const hasText = !!value.trim();

  const handleSend = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    setOpenEmoji(false);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const input = inputRef.current;
    const emoji = emojiData.emoji;
    if (!input) {
      setValue((prev) => prev + emoji);
      return;
    }

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const newValue = value.slice(0, start) + emoji + value.slice(end);
    setValue(newValue);

    requestAnimationFrame(() => {
      input.focus();
      const nextPos = start + emoji.length;
      input.setSelectionRange(nextPos, nextPos);
    });
  };

  return (
    <ChatInputContainer>
      <InputRow>
        <ActionButton disabled={disabled}>
          <AttachFileIcon fontSize="small" />
        </ActionButton>

        <InputField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          placeholder="Nhập tin nhắn..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          inputRef={inputRef}
        />

        <EmojiWrap>
          <ActionButton onClick={() => setOpenEmoji((prev) => !prev)} disabled={disabled} aria-label="emoji">
            <InsertEmoticonRoundedIcon fontSize="small" />
          </ActionButton>
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

        <ActionButton disabled={disabled}>
          <CameraAltIcon fontSize="small" />
        </ActionButton>

        <ActionButton disabled={disabled}>
          <ImageIcon fontSize="small" />
        </ActionButton>

        {hasText ? (
          <SendButton onClick={handleSend} disabled={disabled} aria-label="send">
            <SendRoundedIcon fontSize="small" />
          </SendButton>
        ) : (
          <ActionButton disabled={disabled} aria-label="record">
            <MicIcon fontSize="small" />
          </ActionButton>
        )}
      </InputRow>
    </ChatInputContainer>
  );
}
