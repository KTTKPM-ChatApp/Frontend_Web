// MODAL COMPONENTS - UI ONLY (No Logic/Handlers)
// ============================================

// APP MODAL COMPONENT
// ===================
import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  IconButton,
  Button,
  Typography,
  Slider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

interface AppModalProps {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: DialogProps["maxWidth"];
  fullWidth?: boolean;
  hideCloseButton?: boolean;
  slotProps?: DialogProps["slotProps"];
  headerDivider?: boolean;
  bottomDivider?: boolean;
}

// Styled Components for AppModal
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "4px",
    width: "100%",
  },
}));

const StyledDialogTitle = styled(DialogTitle)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 16,
  fontWeight: 600,
  paddingBottom: 8,
});

const StyledDialogContent = styled(DialogContent)({
  // paddingTop: "8px !important",
});

const ActionsWrap = styled(Box)({
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  padding: "16px 24px",
  borderTop: "1px solid #EAECF0",
});

// AppModal Component UI Structure
export const AppModalUI = {
  // Basic modal with title and content
  basic: (
    <StyledDialog
      open={true}
      onClose={() => {}}
      fullWidth={true}
      maxWidth="xs"
    >
      <StyledDialogTitle>
        <Box component="span">Modal Title</Box>
        <IconButton onClick={() => {}} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </StyledDialogTitle>

      <StyledDialogContent>
        <Typography variant="body1">
          This is the modal content. You can add any content here.
        </Typography>
      </StyledDialogContent>
    </StyledDialog>
  ),

  // Modal with actions
  withActions: (
    <StyledDialog
      open={true}
      onClose={() => {}}
      fullWidth={true}
      maxWidth="sm"
    >
      <StyledDialogTitle>
        <Box component="span">Confirm Action</Box>
        <IconButton onClick={() => {}} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </StyledDialogTitle>

      <StyledDialogContent>
        <Typography variant="body1" mb={2}>
          Are you sure you want to perform this action?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This action cannot be undone.
        </Typography>
      </StyledDialogContent>

      <ActionsWrap>
        <Button variant="outlined" onClick={() => {}}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => {}}>
          Confirm
        </Button>
      </ActionsWrap>
    </StyledDialog>
  ),

  // Modal with header divider
  withHeaderDivider: (
    <StyledDialog
      open={true}
      onClose={() => {}}
      fullWidth={true}
      maxWidth="md"
    >
      <StyledDialogTitle>
        <Box component="span">User Profile</Box>
        <IconButton onClick={() => {}} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </StyledDialogTitle>

      <Divider />

      <StyledDialogContent>
        <Typography variant="body1">
          Modal content with header divider for better visual separation.
        </Typography>
      </StyledDialogContent>
    </StyledDialog>
  ),

  // Modal without close button
  withoutCloseButton: (
    <StyledDialog
      open={true}
      onClose={() => {}}
      fullWidth={true}
      maxWidth="sm"
    >
      <StyledDialogTitle>
        <Box component="span">Information</Box>
      </StyledDialogTitle>

      <StyledDialogContent>
        <Typography variant="body1">
          This modal cannot be closed manually. You need to perform an action.
        </Typography>
      </StyledDialogContent>

      <ActionsWrap>
        <Button variant="contained" onClick={() => {}}>
          OK
        </Button>
      </ActionsWrap>
    </StyledDialog>
  ),

  // Full width modal
  fullWidth: (
    <StyledDialog
      open={true}
      onClose={() => {}}
      fullWidth={true}
      maxWidth="lg"
    >
      <StyledDialogTitle>
        <Box component="span">Wide Modal</Box>
        <IconButton onClick={() => {}} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </StyledDialogTitle>

      <StyledDialogContent>
        <Typography variant="body1">
          This is a full-width modal with more space for content.
        </Typography>
      </StyledDialogContent>
    </StyledDialog>
  )
};

// CROP DIALOG COMPONENT
// =====================

interface CropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onConfirm: (croppedAreaPixels: unknown) => Promise<void> | void;
}

// Styled Components for CropDialog
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

// CropDialog Component UI Structure
export const CropDialogUI = {
  layout: (
    <Dialog open={true} onClose={() => {}} fullWidth maxWidth="sm">
      <CropDialogTitle>
        Cắt ảnh đại diện
        <IconButton onClick={() => {}} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </CropDialogTitle>

      <DialogContent>
        <CropContainer>
          {/* Placeholder for Cropper component */}
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
            }}
          >
            Image Cropper Area
          </Box>
        </CropContainer>

        <Box mt={2}>
          <Typography fontSize={13} mb={1}>
            Thu phóng
          </Typography>
          <Slider
            value={1}
            min={1}
            max={3}
            step={0.1}
            onChange={() => {}}
          />
        </Box>

        <Actions>
          <Button fullWidth variant="outlined" onClick={() => {}}>
            Hủy
          </Button>
          <Button fullWidth variant="contained" onClick={() => {}}>
            Lưu
          </Button>
        </Actions>
      </DialogContent>
    </Dialog>
  )
};

// MEDIA PREVIEW MODAL COMPONENT
// ==============================
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

export interface MediaPreviewItem {
  key: string;
  name?: string;
  type: "image" | "video" | string;
}

interface MediaPreviewModalProps {
  open: boolean;
  media: MediaPreviewItem | null;
  onClose: () => void;
}

// Styled Components for MediaPreviewModal
const ViewerRoot = styled(Box)({
  width: "100vw",
  height: "100vh",
  background: "#0B0B0B",
  display: "flex",
  flexDirection: "column",
});

const ViewerHeader = styled(Box)({
  height: 56,
  minHeight: 56,
  padding: "0 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "rgba(0,0,0,0.65)",
  color: "#fff",
  zIndex: 2,
});

const FileName = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  color: "#fff",
  maxWidth: 520,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const HeaderActions = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const ViewerBody = styled(Box)({
  flex: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
});

const FullImage = styled("img")({
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  userSelect: "none",
});

const FullVideo = styled("video")({
  maxWidth: "100%",
  maxHeight: "100%",
  background: "#000",
});

// MediaPreviewModal Component UI Structure
export const MediaPreviewModalUI = {
  // Image preview
  imagePreview: (
    <Dialog
      open={true}
      onClose={() => {}}
      fullScreen
      PaperProps={{
        sx: {
          background: "transparent",
          boxShadow: "none",
        },
      }}
    >
      <ViewerRoot>
        <ViewerHeader>
          <FileName>image.jpg</FileName>

          <HeaderActions>
            <Button
              onClick={() => {}}
              startIcon={<DownloadRoundedIcon />}
              sx={{
                color: "#fff",
                textTransform: "none",
                fontSize: 13,
                fontWeight: 500,
                minWidth: 0,
              }}
            >
              Tải về
            </Button>

            <IconButton onClick={() => {}} sx={{ color: "#fff" }}>
              <CloseRoundedIcon />
            </IconButton>
          </HeaderActions>
        </ViewerHeader>

        <ViewerBody onClick={() => {}}>
          <FullImage
            src="/sample-image.jpg"
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
          />
        </ViewerBody>
      </ViewerRoot>
    </Dialog>
  ),

  // Video preview
  videoPreview: (
    <Dialog
      open={true}
      onClose={() => {}}
      fullScreen
      PaperProps={{
        sx: {
          background: "transparent",
          boxShadow: "none",
        },
      }}
    >
      <ViewerRoot>
        <ViewerHeader>
          <FileName>video.mp4</FileName>

          <HeaderActions>
            <Button
              onClick={() => {}}
              startIcon={<DownloadRoundedIcon />}
              sx={{
                color: "#fff",
                textTransform: "none",
                fontSize: 13,
                fontWeight: 500,
                minWidth: 0,
              }}
            >
              Tải về
            </Button>

            <IconButton onClick={() => {}} sx={{ color: "#fff" }}>
              <CloseRoundedIcon />
            </IconButton>
          </HeaderActions>
        </ViewerHeader>

        <ViewerBody onClick={() => {}}>
          <FullVideo
            src="/sample-video.mp4"
            controls
            autoPlay
            onClick={(e) => e.stopPropagation()}
          />
        </ViewerBody>
      </ViewerRoot>
    </Dialog>
  ),

  // Loading state
  loading: (
    <Dialog
      open={true}
      onClose={() => {}}
      fullScreen
      PaperProps={{
        sx: {
          background: "transparent",
          boxShadow: "none",
        },
      }}
    >
      <ViewerRoot>
        <ViewerHeader>
          <FileName>Loading...</FileName>

          <HeaderActions>
            <IconButton onClick={() => {}} sx={{ color: "#fff" }}>
              <CloseRoundedIcon />
            </IconButton>
          </HeaderActions>
        </ViewerHeader>

        <ViewerBody onClick={() => {}}>
          <Box
            sx={{
              color: "#fff",
              fontSize: 16,
              textAlign: "center",
            }}
          >
            Loading media...
          </Box>
        </ViewerBody>
      </ViewerRoot>
    </Dialog>
  )
};
