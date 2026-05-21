"use client";

import { useState, useRef } from "react";
import {
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { toast } from "react-toastify";

import { chatService } from "@/src/common/service/chat-service";
import { uploadMedia } from "@/src/common/service/media-service";
import { useChatStore } from "@/src/common/store/useChatStore";
import AppAvatar from "@/src/shared/component/Avatar";
import CropDialog from "@/src/shared/component/CropDialog";
import { getCroppedImgFile } from "@/src/common/helpers/cropImage";
import type { Area } from "react-easy-crop";

const Card = styled(Box)({
  background: "#fff",
  marginBottom: 8,
});

const TopInfo = styled(Box)({
  padding: "32px 24px 24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const AvatarWrapper = styled(Box)({
  position: "relative",
  cursor: "pointer",
  width: 72,
  height: 72,
  borderRadius: "50%",
  "&:hover .avatar-overlay": {
    opacity: 1,
  },
});

const AvatarOverlay = styled(Box)({
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.2s ease",
  color: "#fff",
});

const NameRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 16,
  marginBottom: 20,
  width: "100%",
  justifyContent: "center",
});

const ConversationName = styled(Typography)({
  fontSize: 18,
  fontWeight: 700,
  color: "#0F132A",
  maxWidth: 220,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  textAlign: "center",
});

const EditCircleButton = styled(IconButton)({
  width: 32,
  height: 32,
  flexShrink: 0,
  background: "#EEF2F7",
  color: "#334155",
  "&:hover": {
    background: "#E2E8F0",
  },
});

const ActionsRow = styled(Box)({
  width: "100%",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 12,
  marginTop: 8,
});

const ActionItem = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: 8,
});

const ActionIcon = styled(IconButton)({
  width: 40,
  height: 40,
  borderRadius: 10,
  background: "#EEF2F7",
  color: "#0F172A",
  "&:hover": {
    background: "#E5F1FF",
    color: "#005AE0",
  },
});

const ActionText = styled(Typography)({
  fontSize: 12,
  color: "#0F172A",
  lineHeight: 1.3,
});

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    borderRadius: 12,
    maxWidth: 380,
  },
});

const DialogTitleStyled = styled(DialogTitle)({
  fontSize: 18,
  fontWeight: 600,
  color: "#000000",
  padding: "20px 24px 16px",
});

const DialogContentStyled = styled(DialogContent)({
  padding: "0 24px 16px",
});

const DialogActionsStyled = styled(DialogActions)({
  padding: "8px 16px 16px",
  gap: 8,
});

const CancelButton = styled(Button)({
  height: 40,
  borderRadius: 8,
  background: "#F7F7F8",
  color: "#000000",
  fontSize: 14,
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "none",
  padding: "0 16px",
  "&:hover": {
    background: "#F1F2F4",
    boxShadow: "none",
  },
});

const SaveButton = styled(Button)({
  height: 40,
  borderRadius: 8,
  background: "#0068FF",
  color: "#fff",
  fontSize: 14,
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "none",
  padding: "0 16px",
  "&:hover": {
    background: "#005AE0",
  },
  "&:disabled": {
    background: "#E5E7EB",
    color: "#94A3B8",
  },
});

interface ProfileCardProps {
  onAddMember?: () => void;
}

export default function ProfileCard({ onAddMember }: ProfileCardProps) {
  const listConversation = useChatStore((s) => s.listConversation);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);
  const currentUserId = useChatStore((s) => s.currentUserId);

  const currentConversation = listConversation.find(
    (item) => item.id === activeConversationId
  );
  const isMuted = Boolean(currentConversation?.isMuted);
  const isPinned = Boolean((currentConversation as any)?.isPinned);
  const isGroup =
    currentConversation?.type === "group" ||
    currentConversation?.type === "GROUP";

  const members = currentConversation?.members ?? [];
  const currentUserMember = members.find(
    (m: any) => m.userId === currentUserId
  );
  const currentUserRole = (currentUserMember as any)?.role;
  const canEdit = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const refresh = () => fetchListConversation({ page: 1, limit: 20 });

  const handleToggleMute = async () => {
    if (!activeConversationId) return;
    try {
      await chatService.updateConversationSettings(activeConversationId, {
        isMuted: !isMuted,
      });
      await refresh();
      toast.success(isMuted ? "Đã bật thông báo" : "Đã tắt thông báo");
    } catch {
      toast.error("Không thể cập nhật thông báo");
    }
  };

  const handleTogglePin = async () => {
    if (!activeConversationId) return;
    try {
      if (isPinned) {
        await chatService.unpinConversation(activeConversationId);
      } else {
        await chatService.pinConversation(activeConversationId);
      }
      await refresh();
      toast.success(isPinned ? "Đã bỏ ghim hội thoại" : "Đã ghim hội thoại");
    } catch {
      toast.error("Không thể cập nhật ghim");
    }
  };

  const [openEditName, setOpenEditName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");

  const handleOpenEditName = () => {
    setEditNameValue(currentConversation?.name ?? "");
    setOpenEditName(true);
  };

  const handleSaveName = async () => {
    const trimmedName = editNameValue.trim();
    if (!trimmedName) {
      toast.error("Tên nhóm không được để trống");
      return;
    }
    if (!activeConversationId) return;
    try {
      await chatService.updateConversation(activeConversationId, {
        name: trimmedName,
      });
      toast.success(`Đã đổi tên nhóm thành "${trimmedName}"`);
      await refresh();
      setOpenEditName(false);
    } catch (error: any) {
      const message =
        error?.message || error?.response?.data?.message || "Không thể đổi tên nhóm";
      toast.error(message);
    }
  };

  const [openCropDialog, setOpenCropDialog] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    if (!canEdit) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImageSrc(previewUrl);
    setOpenCropDialog(true);
    e.target.value = "";
  };

  const handleCropConfirm = async (croppedAreaPixels: Area) => {
    if (!selectedImageSrc || !activeConversationId) return;

    setUploadingAvatar(true);
    try {
      const croppedFile = await getCroppedImgFile(
        selectedImageSrc,
        croppedAreaPixels,
        "group-avatar.jpg"
      );

      const uploadResult = await uploadMedia({
        file: croppedFile,
        userId: currentUserId || "",
      });

      await chatService.updateConversation(activeConversationId, {
        avatarUrl: uploadResult.url || uploadResult.key,
      });

      toast.success("Đã cập nhật ảnh nhóm");
      await refresh();
      setOpenCropDialog(false);
      setSelectedImageSrc("");
    } catch (error: any) {
      const message =
        error?.message || error?.response?.data?.message || "Không thể cập nhật ảnh nhóm";
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <Card>
      <TopInfo>
        <AvatarWrapper onClick={handleAvatarClick}>
          <AppAvatar
            src={currentConversation?.avatarUrl ?? ""}
            name={currentConversation?.name ?? ""}
            size={72}
            fontSize={26}
          />
          {canEdit && (
            <AvatarOverlay className="avatar-overlay">
              <CameraAltOutlinedIcon sx={{ fontSize: 22 }} />
            </AvatarOverlay>
          )}
        </AvatarWrapper>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileSelect}
        />

        <NameRow>
          <ConversationName title={currentConversation?.name ?? ""}>
            {currentConversation?.name ?? "Cuộc trò chuyện"}
          </ConversationName>

          {canEdit && isGroup && (
            <EditCircleButton aria-label="Đổi tên hội thoại" onClick={handleOpenEditName}>
              <EditOutlinedIcon sx={{ fontSize: 16 }} />
            </EditCircleButton>
          )}
        </NameRow>

        <ActionsRow>
          <ActionItem>
            <ActionIcon aria-label="Tắt thông báo" onClick={handleToggleMute}>
              {isMuted ? (
                <NotificationsOffOutlinedIcon sx={{ fontSize: 20 }} />
              ) : (
                <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
              )}
            </ActionIcon>
            <ActionText>{isMuted ? "Bật thông báo" : "Tắt thông báo"}</ActionText>
          </ActionItem>

          <ActionItem>
            <ActionIcon aria-label="Ghim hội thoại" onClick={handleTogglePin}>
              {isPinned ? (
                <PushPinRoundedIcon sx={{ fontSize: 20 }} />
              ) : (
                <PushPinOutlinedIcon sx={{ fontSize: 20 }} />
              )}
            </ActionIcon>
            <ActionText>{isPinned ? "Bỏ ghim" : "Ghim hội thoại"}</ActionText>
          </ActionItem>

          <ActionItem>
            <ActionIcon
              aria-label="Thêm thành viên"
              onClick={onAddMember}
              sx={onAddMember ? {} : { opacity: 0.4, cursor: "not-allowed" }}
            >
              <GroupAddOutlinedIcon sx={{ fontSize: 20 }} />
            </ActionIcon>
            <ActionText>Thêm thành viên</ActionText>
          </ActionItem>
        </ActionsRow>
      </TopInfo>

      <StyledDialog open={openEditName} onClose={() => setOpenEditName(false)}>
        <DialogTitleStyled
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: "#081B3A",
            }}
          >
            Đổi tên nhóm
          </Typography>

          <IconButton
            onClick={() => setOpenEditName(false)}
            size="small"
            sx={{
              width: 32,
              height: 32,
              background: "#F3F5F7",

              "&:hover": {
                background: "#E8ECF1",
              },
            }}
          >
            <CloseRoundedIcon
              sx={{
                fontSize: 18,
                color: "#5B6575",
              }}
            />
          </IconButton>
        </DialogTitleStyled>

        <DialogContentStyled
          sx={{
            pt: 2,
            pb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: "#5B6575",
              }}
            >
              Tên nhóm
            </Typography>

            <TextField
              fullWidth
              autoFocus
              value={editNameValue}
              onChange={(e) =>
                setEditNameValue(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveName();
                }
              }}
              placeholder="Nhập tên nhóm mới"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 46,
                  borderRadius: 12,
                  background: "#F7F9FC",
                  fontSize: 14,

                  "& fieldset": {
                    borderColor: "#E5EAF0",
                  },

                  "&:hover fieldset": {
                    borderColor: "#0068FF",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: "#0068FF",
                    borderWidth: 1,
                  },
                },

                "& input": {
                  padding: "0 14px",
                },

                "& input::placeholder": {
                  color: "#94A3B8",
                  opacity: 1,
                },
              }}
            />

            <Typography
              sx={{
                fontSize: 12,
                color: "#94A3B8",
                lineHeight: 1.5,
              }}
            >
              Tên nhóm sẽ hiển thị với tất cả thành viên.
            </Typography>
          </Box>
        </DialogContentStyled>

        <DialogActionsStyled
          sx={{
            px: 3,
            pb: 2.5,
            pt: 1.5,
            gap: 1.5,
          }}
        >
          <Button
            fullWidth
            onClick={() => setOpenEditName(false)}
            sx={{
              height: 42,
              borderRadius: 12,
              background: "#F3F5F7",
              color: "#081B3A",
              fontSize: 14,
              fontWeight: 700,
              textTransform: "none",

              "&:hover": {
                background: "#E8ECF1",
              },
            }}
          >
            Hủy
          </Button>

          <Button
            fullWidth
            onClick={handleSaveName}
            disabled={!editNameValue.trim()}
            sx={{
              height: 42,
              borderRadius: 12,
              background: "#0068FF",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "none",

              "&:hover": {
                background: "#0052CC",
                boxShadow: "none",
              },

              "&.Mui-disabled": {
                background: "#DCE3EB",
                color: "#94A3B8",
              },
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActionsStyled>
      </StyledDialog>

      <CropDialog
        open={openCropDialog}
        imageSrc={selectedImageSrc}
        onClose={() => {
          setOpenCropDialog(false);
          setSelectedImageSrc("");
        }}
        onConfirm={handleCropConfirm}
      />

      <Dialog open={uploadingAvatar}>
        <DialogContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
          <CircularProgress size={24} />
          <Typography>Đang tải ảnh lên...</Typography>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
