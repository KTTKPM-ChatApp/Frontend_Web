"use client";

import type { ChangeEventHandler, RefObject } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";

interface ComposerToolbarProps {
  disabled?: boolean;
  uploading: boolean;
  imageInputRef: RefObject<HTMLInputElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageChange: ChangeEventHandler<HTMLInputElement>;
  onFileChange: ChangeEventHandler<HTMLInputElement>;
}

const ToolbarRow = styled(Box)({
  height: 40,
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "0 8px",
  borderBottom: "1px solid #F1F5F9",
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

export default function ComposerToolbar({
  disabled,
  uploading,
  imageInputRef,
  fileInputRef,
  onImageChange,
  onFileChange,
}: ComposerToolbarProps) {
  return (
    <ToolbarRow data-testid="toolbar-input-chat">
      <StyledIconButton
        onClick={() => imageInputRef.current?.click()}
        disabled={disabled || uploading}
        aria-label="send-image"
      >
        <ImageOutlinedIcon fontSize="small" />
      </StyledIconButton>

      <StyledIconButton
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        aria-label="send-file"
      >
        <AttachFileRoundedIcon fontSize="small" />
      </StyledIconButton>

      {uploading && <CircularProgress size={16} />}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*"
        hidden
        multiple
        onChange={onImageChange}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
        hidden
        multiple
        onChange={onFileChange}
      />
    </ToolbarRow>
  );
}