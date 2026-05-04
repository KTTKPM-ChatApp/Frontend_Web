"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import dynamic from "next/dynamic";
import InsertEmoticonRoundedIcon from "@mui/icons-material/InsertEmoticonRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { EmojiClickData } from "emoji-picker-react";

import { ChatAttachmentPayload } from "@/src/common/interface/media-interface";
import { getCurrentUserId } from "@/src/common/utilities/utils";
import { useChatStore } from "@/src/common/store/useChatStore";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { uploadManyChatMedia } from "@/src/common/service/chat-media-service";
import { UiMessage } from "@/src/common/interface/chat-interface";
import { useTypingIndicator } from "@/src/common/hooks/useTypingIndicator";
import { getSocket } from "@/src/common/socket/socket";
import { useTrans } from "@/src/common/utilities/hook/trans";

import ComposerToolbar from "./ComposerToolbar";
import { buildChatAttachmentPayload, sanitizeInputText } from "@/src/common/helpers/chatInput.helpers";
import PendingAttachmentList from "./PendingAttachmentsList";
import ComposerActionPreview from "./ComposerActionPreview";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

interface ChatInputProps {
  disabled?: boolean;
  replyMessage?: UiMessage | null;
  editMessage?: UiMessage | null;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
  onSend: (
    value: string,
    attachments?: ChatAttachmentPayload[]
  ) => void | Promise<void>;
  onEdit?: (messageId: string, value: string) => void | Promise<void>;
}

const ComposerContainer = styled(Box)({
  borderTop: "1px solid #EEF1F4",
  background: "#fff",
});

const ComposerWrap = styled(Box)({
  minHeight: 50,
  maxHeight: 50,
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
    fontSize: 15,
    color: "#111827",
    lineHeight: 1.2,
  },
  "& .MuiInputBase-input::placeholder": {
    opacity: 0.5,
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
  marginRight: 8,
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

export default function ChatInput({
  disabled,
  replyMessage,
  editMessage,
  onCancelReply,
  onCancelEdit,
  onSend,
  onEdit,
}: ChatInputProps) {
  const t = useTrans();
  const [value, setValue] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<
    ChatAttachmentPayload[]
  >([]);
  const [uploading, setUploading] = useState(false);

  const textInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUserId = getCurrentUserId();
  const conversationId = useChatStore((s) => s.activeConversationId);
  const socket = getSocket();
  const currentUser = useAuthStore((s) => s.authData?.data?.user);

  const { emitTyping } = useTypingIndicator({
    socket,
    conversationId: conversationId || '',
    myUserId: currentUserId || '',
    enabled: !!conversationId && !!socket,
  });

  const toolbarDisabled = disabled || !!editMessage;

  const canSubmit = useMemo(() => {
    if (disabled || uploading) return false;

    if (editMessage) {
      return !!sanitizeInputText(value);
    }

    return !!sanitizeInputText(value) || pendingAttachments.length > 0;
  }, [disabled, uploading, editMessage, value, pendingAttachments.length]);

  const handleSelectFiles = async (files: FileList | null) => {
    if (
      !files ||
      files.length === 0 ||
      toolbarDisabled ||
      !currentUserId ||
      !conversationId
    ) {
      return;
    }

    try {
      setUploading(true);

      const fileArray = Array.from(files);
      const uploadedList = await uploadManyChatMedia(fileArray, conversationId);

      const nextAttachments = uploadedList.map((uploaded, index) =>
        buildChatAttachmentPayload(uploaded, fileArray[index])
      );

      setPendingAttachments((prev) => [...prev, ...nextAttachments]);
    } catch (error) {
      console.error("upload attachment error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    await handleSelectFiles(e.target.files);
    e.target.value = "";
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    await handleSelectFiles(e.target.files);
    e.target.value = "";
  };

  const handleRemoveAttachment = (key: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSend = async () => {
    const text = sanitizeInputText(value);

    if (editMessage) {
      if (!text || disabled || uploading) return;

      await onEdit?.(editMessage.messageId, text);
      setValue("");
      setOpenEmoji(false);
      onCancelEdit?.();
      return;
    }

    if ((!text && pendingAttachments.length === 0) || disabled || uploading) {
      return;
    }

    await onSend(text, pendingAttachments);

    setValue("");
    setPendingAttachments([]);
    setOpenEmoji(false);
    onCancelReply?.();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    setValue(e.target.value);
    if (e.target.value.trim() && conversationId) {
      const username = currentUser?.fullName || 'Bạn';
      emitTyping(username);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const input = textInputRef.current;
    const emoji = emojiData.emoji;

    if (!input) {
      setValue((prev) => prev + emoji);
      return;
    }

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;

    const nextValue = value.slice(0, start) + emoji + value.slice(end);
    setValue(nextValue);

    requestAnimationFrame(() => {
      input.focus();
      const nextPos = start + emoji.length;
      input.setSelectionRange(nextPos, nextPos);
    });
  };

  useEffect(() => {
    if (editMessage) {
      setValue(sanitizeInputText(editMessage.body));
      setPendingAttachments([]);
      requestAnimationFrame(() => textInputRef.current?.focus());
    }
  }, [editMessage]);

  return (
    <ComposerContainer data-testid="chat-input">
      <ComposerToolbar
        disabled={toolbarDisabled}
        uploading={uploading}
        imageInputRef={imageInputRef}
        fileInputRef={fileInputRef}
        onImageChange={handleImageChange}
        onFileChange={handleFileChange}
      />

      <PendingAttachmentList
        attachments={pendingAttachments}
        onRemove={handleRemoveAttachment}
      />

      <ComposerActionPreview
        replyMessage={replyMessage}
        editMessage={editMessage}
        onCancelReply={onCancelReply}
        onCancelEdit={onCancelEdit}
      />

      <ComposerWrap>
        <ComposerRow>
          <StyledTextField
            fullWidth
            multiline
            minRows={1}
            maxRows={1}
            placeholder={t("CHAT.PLACEHOLDER")}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || uploading}
            inputRef={textInputRef}
          />

          <EmojiWrap>
            <StyledIconButton
              onClick={() => setOpenEmoji((prev) => !prev)}
              disabled={disabled || uploading}
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

          <StyledIconButton
            onClick={() => void handleSend()}
            disabled={!canSubmit}
            aria-label="send-message"
          >
            <SendRoundedIcon fontSize="small" />
          </StyledIconButton>
        </ComposerRow>
      </ComposerWrap>
    </ComposerContainer>
  );
}