"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import Cropper, { Area } from "react-easy-crop";

const CropDialogTitle = styled(DialogTitle)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const CropContainer = styled(Box)({
  position: "relative",
  width: "100%",
  height: 320,
  backgroundColor: "#000",
  borderRadius: 12,
  overflow: "hidden",
});

const Actions = styled(Box)({
  display: "flex",
  gap: 8,
  marginTop: 16,
});

interface CropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onConfirm: (croppedAreaPixels: Area) => Promise<void> | void;
}

export default function CropDialog({
  open,
  imageSrc,
  onClose,
  onConfirm,
}: CropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = (_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    await onConfirm(croppedAreaPixels);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <CropDialogTitle>
        Cắt ảnh đại diện
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </CropDialogTitle>

      <DialogContent>
        <CropContainer>
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          ) : null}
        </CropContainer>

        <Box mt={2}>
          <Typography fontSize={13} mb={1}>
            Thu phóng
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => setZoom(value as number)}
          />
        </Box>

        <Actions>
          <Button fullWidth variant="outlined" onClick={handleClose}>
            Hủy
          </Button>
          <Button fullWidth variant="contained" onClick={handleConfirm}>
            Lưu
          </Button>
        </Actions>
      </DialogContent>
    </Dialog>
  );
}