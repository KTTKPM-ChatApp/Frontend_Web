"use client";

import { useRef, useState } from "react";
import { Box, IconButton, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import dynamic from "next/dynamic";
import InsertEmoticonRoundedIcon from "@mui/icons-material/InsertEmoticonRounded";
import { EmojiClickData } from "emoji-picker-react";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});
interface ChatInputProps {
  disabled?: boolean;
  onSend: (value: string) => void;
}

const ComposerWrap = styled(Box)({
  height: "100%",
  minHeight: 50,
  maxHeight: 50,
  borderTop: "1px solid #EEF1F4",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
});

const ComposerRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "100%",
  gap: 8,

});

const StyledTextField = styled(TextField)({
  flex: 1,
  "& .MuiOutlinedInput-root": {

    paddingRight: 4,
    alignItems: "center",
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },

  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },

  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },

  "& .MuiInputBase-input": {
    fontSize: "15px",
    color: "#111827",
    lineHeight: 1.2,
  },
  "& .MuiInputBase-input::placeholder": {
    opacity: .5,
    paddingLeft: 4,
  },
});
const EmojiWrap = styled(Box)({
  position: "relative",
  width: 36,
  minWidth: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginRight:"8px"
});

const PickerBox = styled(Box)({
  position: "absolute",
  bottom: 46,
  right: 0,
  zIndex: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  borderRadius: 12,
  overflow: "hidden",
});
const StyledIconButton = styled(IconButton)({
  width: 36,
  minWidth: 36,
  height: 36,
  borderRadius: 10,
  color: "#64748B",
  flexShrink: 0,

  "&:hover": {
    background: "#F1F5F9",
  },
});
export default function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const handleSend = () => {
    const text = value.trim();
    if (!text || disabled) return;

    onSend(text);
    setValue("");
    setOpenEmoji(false)
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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
    <ComposerWrap data-testid="chat-input">
      <ComposerRow>
        <StyledTextField
          fullWidth
          multiline
          minRows={1}
          maxRows={1}
          placeholder="Nhập tin nhắn..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />


        <EmojiWrap>
          <StyledIconButton
            onClick={() => setOpenEmoji((prev) => !prev)}
            disabled={disabled}
            aria-label="emoji"
          >
            <InsertEmoticonRoundedIcon fontSize="small" />
          </StyledIconButton>

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
      </ComposerRow>
    </ComposerWrap>
  );
}