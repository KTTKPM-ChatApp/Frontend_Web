"use client";

import { useRef, useState, useCallback } from "react";
import { Box, IconButton, CircularProgress, Tooltip } from "@mui/material";
import { sendTyping, sendStopTyping } from "@/src/common/action/chat.action";
import { styled } from "@mui/material/styles";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import dynamic from "next/dynamic";
import InsertEmoticonRoundedIcon from "@mui/icons-material/InsertEmoticonRounded";
import { EmojiClickData } from "emoji-picker-react";
import ComposerActionPreview from "./ComposerActionPreview";
import PendingAttachmentsList from "./PendingAttachmentsList";
import { ChatAttachmentPayload } from "@/src/common/interface/media-interface";
import { uploadMedia } from "@/src/common/service/media-service";
import { useChatStore } from "@/src/common/store/useChatStore";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

interface ChatInputProps {
  disabled?: boolean;
  conversationId?: string;
  onSend: (value: string, attachments: ChatAttachmentPayload[]) => void;
  replyMessage?: {
    messageId: string;
    body: string;
    senderName?: string;
  } | null;
  onCancelReply?: () => void;
}

const ChatInputContainer = styled(Box)({
  background: "#fff",
  borderTop: "1px solid #E5E7EB",
  padding: "8px 12px 12px",
});

const InputWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  background: "#F0F2F5",
  borderRadius: 16,
  border: "1px solid #E5E7EB",
  padding: "2px 8px",
  gap: 1,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "&:focus-within": {
    borderColor: "#005AE0",
    boxShadow: "0 0 0 2px rgba(0, 90, 224, 0.1)",
    background: "#FFFFFF",
  },
});

const InputField = styled("input")({
  flex: 1,
  minHeight: 36,
  maxHeight: 100,
  border: "none",
  background: "transparent",
  padding: "6px 4px",
  fontSize: 14,
  color: "#0F172A",
  outline: "none",
  resize: "none",
  fontFamily: "inherit",
  lineHeight: 1.5,
  "&::placeholder": {
    color: "#94A3B8",
  },
});

const IconBtn = styled(IconButton)({
  width: 34,
  height: 34,
  minWidth: 34,
  color: "#64748B",
  borderRadius: 10,
  flexShrink: 0,
  "&:hover": {
    background: "rgba(0, 0, 0, 0.06)",
    color: "#005AE0",
  },
});

const SendBtn = styled(IconButton)({
  width: 34,
  height: 34,
  minWidth: 34,
  borderRadius: 10,
  backgroundColor: "#005AE0",
  color: "#FFFFFF",
  flexShrink: 0,
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
  right: 0,
  zIndex: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  borderRadius: 12,
  overflow: "hidden",
});

const DropZone = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isDragging",
})<{ isDragging?: boolean }>(({ isDragging }) => ({
  borderRadius: 16,
  border: isDragging ? "2px dashed #005AE0" : "2px dashed transparent",
  background: isDragging ? "rgba(0, 90, 224, 0.05)" : "transparent",
  transition: "all 0.2s ease",
  padding: isDragging ? "8px" : 0,
}));

export default function ChatInput({ disabled, conversationId, onSend, replyMessage, onCancelReply }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachmentPayload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasText = !!value.trim();
  const hasAttachments = pendingAttachments.length > 0;
  const lastTypingTime = useRef<number>(0);
  const currentUserId = useChatStore((state) => state.currentUserId);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (!files.length || !currentUserId) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          console.log("[ChatInput] Uploading file:", file.name, file.type, file.size);
          const result = await uploadMedia({ file, userId: currentUserId });
          console.log("[ChatInput] Upload result:", result);
          return {
            key: result.key,
            url: result.url,
            type: result.type,
            name: result.fileName,
            size: result.size,
            content_type: result.contentType,
            thumbnail_key: result.thumbnailKey || undefined,
            thumbnailUrl: result.type === "video" ? result.url : null,
            visibility: result.visibility,
          } as ChatAttachmentPayload;
        })
      );
      console.log("[ChatInput] All uploaded:", uploaded);
      setPendingAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("[ChatInput] Upload media failed:", err);
    } finally {
      setUploading(false);
    }
  }, [currentUserId]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  }, [handleFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  }, [handleFiles]);

  const handleRemoveAttachment = useCallback((key: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.key !== key));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

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
    if ((!text && !hasAttachments) || disabled) return;
    onSend(text, pendingAttachments);
    if (conversationId) sendStopTyping(conversationId);
    setValue("");
    setPendingAttachments([]);
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
    <ChatInputContainer
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {replyMessage && (
        <ComposerActionPreview
          replyMessage={{
            messageId: replyMessage.messageId,
            body: replyMessage.body,
            senderName: replyMessage.senderName,
          }}
          onCancelReply={onCancelReply}
        />
      )}

      <PendingAttachmentsList
        attachments={pendingAttachments}
        onRemove={handleRemoveAttachment}
      />

      <DropZone isDragging={isDragging}>
        <InputWrapper>
          <Tooltip title="Gửi ảnh/Video" placement="top">
            <IconBtn
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled || uploading}
              aria-label="send-image"
            >
              <ImageOutlinedIcon fontSize="small" />
            </IconBtn>
          </Tooltip>

          <Tooltip title="Gửi tệp" placement="top">
            <IconBtn
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              aria-label="send-file"
            >
              <AttachFileRoundedIcon fontSize="small" />
            </IconBtn>
          </Tooltip>

          {uploading && <CircularProgress size={16} sx={{ mx: 1 }} />}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*,video/*"
            hidden
            multiple
            onChange={handleImageChange}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
            hidden
            multiple
            onChange={handleFileChange}
          />

          <InputField
            ref={inputRef}
            placeholder="Nhập tin nhắn..."
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />

          <EmojiWrap>
            <Tooltip title="Emoji" placement="top">
              <IconBtn onClick={() => setOpenEmoji((prev) => !prev)} disabled={disabled}>
                <InsertEmoticonRoundedIcon fontSize="small" />
              </IconBtn>
            </Tooltip>
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

          {hasText || hasAttachments ? (
            <SendBtn onClick={handleSend} disabled={disabled || uploading}>
              <SendRoundedIcon fontSize="small" />
            </SendBtn>
          ) : (
            <Tooltip title="Gửi tin nhắn thoại" placement="top">
              <IconBtn disabled={disabled}>
                <MicRoundedIcon fontSize="small" />
              </IconBtn>
            </Tooltip>
          )}
        </InputWrapper>
      </DropZone>
    </ChatInputContainer>
  );
}
