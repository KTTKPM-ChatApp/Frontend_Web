"use client";

import { useRef, useState } from "react";
import {
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import dynamic from "next/dynamic";
import InsertEmoticonRoundedIcon from "@mui/icons-material/InsertEmoticonRounded";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MicIcon from "@mui/icons-material/Mic";
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

// ==================== STYLED COMPONENTS ====================

const ChatInputContainer = styled(Box)(({ theme }) => ({
  background: "#fff",
  borderTop: "1px solid #E5E7EB",
  padding: "16px",
}));

const InputRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  gap: 8,
}));

const InputField = styled(TextField)(({ theme }) => ({
  flex: 1,
  "& .MuiOutlinedInput-root": {
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    paddingRight: 8,
    "&:hover": {
      backgroundColor: "#F1F5F9",
    },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
      boxShadow: "0 0 0 2px #0078FF",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },
  "& .MuiInputBase-input": {
    fontSize: 15,
    color: "#0F172A",
    padding: "12px 16px",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#94A3B8",
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 10,
  color: "#64748B",
  backgroundColor: "#F8FAFC",
  "&:hover": {
    backgroundColor: "#E5E7EB",
    color: "#0F172A",
  },
}));

const SendButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 10,
  backgroundColor: "#0078FF",
  color: "#FFFFFF",
  "&:hover": {
    backgroundColor: "#0056CC",
  },
  "&:disabled": {
    backgroundColor: "#E5E7EB",
    color: "#94A3B8",
  },
}));

const EmojiWrap = styled(Box)(({ theme }) => ({
  position: "relative",
}));

const PickerBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 60,
  right: 0,
  zIndex: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  borderRadius: 12,
  overflow: "hidden",
}));

const AttachmentPreview = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px",
  backgroundColor: "#F8FAFC",
  borderRadius: 8,
  border: "1px solid #E5E7EB",
  marginBottom: 8,
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 16px",
  color: "#64748B",
  fontSize: 13,
  fontStyle: "italic",
}));
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
    <ChatInputContainer>
      {/* Attachment Preview */}
      {/* <AttachmentPreview>
        <AttachFileIcon fontSize="small" />
        <Typography variant="body2">file.pdf</Typography>
        <IconButton size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </AttachmentPreview> */}

      {/* Typing Indicator */}
      {/* <TypingIndicator>
        <span>Nguyễn Văn A đang nhập...</span>
      </TypingIndicator> */}

      <InputRow>
        <ActionButton disabled={disabled}>
          <AttachFileIcon />
        </ActionButton>

        <InputField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          placeholder="Nhập tin nhắn..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        <EmojiWrap>
          <ActionButton
            onClick={() => setOpenEmoji((prev) => !prev)}
            disabled={disabled}
            aria-label="emoji"
          >
            <InsertEmoticonRoundedIcon />
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
          <CameraAltIcon />
        </ActionButton>

        <ActionButton disabled={disabled}>
          <ImageIcon />
        </ActionButton>

        <SendButton
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="send"
        >
          <SendRoundedIcon />
        </SendButton>
      </InputRow>
    </ChatInputContainer>
  );
}