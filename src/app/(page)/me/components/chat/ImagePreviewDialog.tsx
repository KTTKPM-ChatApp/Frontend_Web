"use client";

import React from "react";
import { Dialog, IconButton, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    background: "rgba(0,0,0,0.92)",
    maxWidth: "90vw",
    maxHeight: "90vh",
    margin: 0,
    borderRadius: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  "& .MuiBackdrop-root": {
    background: "rgba(0,0,0,0.85)",
  },
});

const CloseBtn = styled(IconButton)({
  position: "fixed",
  top: 16,
  right: 16,
  color: "#fff",
  zIndex: 1301,
});

const NavBtn = styled(IconButton)({
  position: "fixed",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#fff",
  zIndex: 1301,
  background: "rgba(255,255,255,0.1)",
  "&:hover": { background: "rgba(255,255,255,0.2)" },
});

const PreviewImage = styled("img")({
  maxWidth: "90vw",
  maxHeight: "90vh",
  objectFit: "contain",
});

interface ImagePreviewDialogProps {
  open: boolean;
  images: { url: string; name?: string }[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImagePreviewDialog({
  open,
  images,
  initialIndex,
  onClose,
}: ImagePreviewDialogProps) {
  const [index, setIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  const current = images[index];
  if (!current) return null;

  return (
    <StyledDialog open={open} onClose={onClose}>
      <CloseBtn onClick={onClose}>
        <CloseIcon />
      </CloseBtn>

      {images.length > 1 && index > 0 && (
        <NavBtn
          sx={{ left: 16 }}
          onClick={() => setIndex((i) => i - 1)}
        >
          <NavigateBeforeIcon fontSize="large" />
        </NavBtn>
      )}

      {images.length > 1 && index < images.length - 1 && (
        <NavBtn
          sx={{ right: 16 }}
          onClick={() => setIndex((i) => i + 1)}
        >
          <NavigateNextIcon fontSize="large" />
        </NavBtn>
      )}

      <Box sx={{ textAlign: "center" }}>
        <PreviewImage src={current.url} alt={current.name ?? ""} />
      </Box>
    </StyledDialog>
  );
}
