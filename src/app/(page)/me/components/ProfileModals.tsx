"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import InfoRow from "@/src/shared/component/InfoRow";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { resolveMediaUrl } from "@/src/common/helpers/displayMedia.helpers";
import { uploadMedia } from "@/src/common/service/media-service";
import { getCroppedImgFile } from "@/src/common/helpers/cropImage";
import { userService } from "@/src/common/service/user-service";
import { IUpdateMyProfilePayload } from "@/src/common/interface/user-interface";
import { IUser } from "@/src/common/interface/auth-interface";
import { useUserStore } from "@/src/common/store/useUserStore";

const ProfileDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 4,
    padding: theme.spacing(0.5),
    width: "100%",
    maxWidth: 420,
  },
}));

const ProfileDialogTitle = styled(DialogTitle)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 16,
  fontWeight: 600,
  paddingBottom: 8,
});

const ProfileDialogContent = styled(DialogContent)({
  paddingTop: "8px !important",
});

const ProfileHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "16px",
});

const AvatarWrapper = styled(Box)({
  position: "relative",
  width: 72,
  height: 72,
  cursor: "pointer",
});

const AvatarStyled = styled(Avatar)({
  width: 72,
  height: 72,
});

const AvatarEditBadge = styled(Box)({
  position: "absolute",
  right: -2,
  bottom: -2,
  width: 28,
  height: 28,
  borderRadius: "50%",
  backgroundColor: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
});

interface ProfileModalsProps {
  openProfileModal: boolean;
  setOpenProfileModal: (value: boolean) => void;
  pendingOpenEdit: boolean;
  setPendingOpenEdit: (value: boolean) => void;
}

const ProfileModals = ({
  openProfileModal,
  setOpenProfileModal,
  pendingOpenEdit,
  setPendingOpenEdit,
}: ProfileModalsProps) => {
  const {
    authData,
    setAuthData,
    setLoadingAuth,
    setErrorAuth,
  } = useAuthStore();
  const setOpenEditProfileModal = useUserStore((s)=> s.setOpenEditProfileModal)
  const openEditProfileModal = useUserStore((s)=> s.openEditProfileModal)
  const editProfileData = useUserStore((s)=> s.editProfileData)
  const setEditProfileField = useUserStore((s)=> s.setEditProfileField)
  const [openCropDialog, setOpenCropDialog] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const currentUser = authData?.data?.user ?? null;

  const currentAvatar = avatarPreview
    ? avatarPreview.startsWith("blob:")
      ? avatarPreview
      : resolveMediaUrl(avatarPreview)
    : resolveMediaUrl(currentUser?.avatarUrl) || "/avatar.jpg";

  const onCropComplete = (_croppedArea: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSaveCroppedAvatar = async () => {
    try {
      if (!selectedImageSrc || !croppedAreaPixels) return;

      const croppedFile = await getCroppedImgFile(
        selectedImageSrc,
        croppedAreaPixels,
        "avatar.jpg"
      );

      const croppedPreview = URL.createObjectURL(croppedFile);

      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }

      setAvatarFile(croppedFile);
      setAvatarPreview(croppedPreview);
      setOpenCropDialog(false);

      if (selectedImageSrc?.startsWith("blob:")) {
        URL.revokeObjectURL(selectedImageSrc);
      }

      setSelectedImageSrc("");
    } catch (error: any) {
      setErrorAuth(error?.message ?? "Không thể crop ảnh.");
    }
  };

  const handleCloseProfileModal = () => {
    setOpenProfileModal(false);
  };

  const handleProfileDialogExited = () => {
    if (!pendingOpenEdit) return;
    setPendingOpenEdit(false);
    setOpenEditProfileModal(true);
  };

  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorAuth("Vui lòng chọn file ảnh");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorAuth("Ảnh không được vượt quá 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImageSrc(previewUrl);
    setOpenCropDialog(true);
    event.target.value = "";
  };

  const handleCloseEditModal = () => {
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(null);
    setAvatarPreview("");
    setOpenEditProfileModal(false);
    setPendingOpenEdit(false);
  };

  const handleUpdateMyProfile = async () => {
    const user = authData?.data?.user;
    const userId = user?.id;

    if (!user || !userId) {
      setErrorAuth("Không tìm thấy thông tin người dùng");
      return;
    }

    const displayName = editProfileData.displayName?.trim() ?? "";
    const bio = editProfileData.bio?.trim() ?? "";
    const gender = editProfileData.gender ?? "other";
    const dateOfBirth = editProfileData.dateOfBirth || null;

    if (!displayName) {
      setErrorAuth("Họ và tên không được để trống");
      return;
    }

    try {
      setLoadingAuth(true);
      setErrorAuth(null);

      let uploadedAvatarUrl = user.avatarUrl;

      if (avatarFile) {
        const uploadResult = await uploadMedia({
          file: avatarFile,
          userId: String(userId),
        });

        uploadedAvatarUrl = uploadResult.key;
      }
      console.log("avatarKey before update profile:", uploadedAvatarUrl);
      const payload: IUpdateMyProfilePayload = {
        displayName,
        bio: bio || null,
        gender,
        dateOfBirth,
        avatarUrl: uploadedAvatarUrl ?? null,
      };
      console.log("update profile payload:", payload);
      const response = await userService.userUpdateProfile(payload);
      const returnedUser = response?.payload?.data ?? null;

      const mergedUser: IUser = {
        ...user,
        ...(returnedUser ?? {}),
        ...payload,
        avatarUrl:
          returnedUser?.avatarUrl ??
          uploadedAvatarUrl ??
          user.avatarUrl ??
          null,
      } as IUser;

      setAuthData({
        success: authData?.success ?? true,
        message: authData?.message,
        timestamp: authData?.timestamp,
        meta: authData?.meta,
        data: {
          user: mergedUser,
          tokens: authData?.data?.tokens ?? {
            accessToken: "",
            refreshToken: "",
            expiresIn: 0,
          },
        },
      });

      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }

      setAvatarFile(null);
      setAvatarPreview("");
      setSelectedImageSrc("");
      setOpenEditProfileModal(false);
      setPendingOpenEdit(false);
    } catch (error: any) {
      console.error("update profile error:", error);
      setErrorAuth(
        error?.message ||
        error?.payload?.message ||
        error?.response?.data?.message ||
        "Cập nhật hồ sơ thất bại"
      );
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    if (!openEditProfileModal) return;

    const normalizedDateOfBirth = currentUser?.dateOfBirth
      ? String(currentUser.dateOfBirth).slice(0, 10)
      : "";

    setEditProfileField("username", currentUser?.username ?? "");
    setEditProfileField("email", currentUser?.email ?? "");
    setEditProfileField("displayName", currentUser?.displayName ?? "");
    setEditProfileField("bio", currentUser?.bio ?? "");
    setEditProfileField("gender", currentUser?.gender ?? "other");
    setEditProfileField("dateOfBirth", normalizedDateOfBirth);
    setEditProfileField("phone", currentUser?.phone ?? "");
    setEditProfileField("isActive", String(currentUser?.isActive ?? false));
    setEditProfileField("createdAt", currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN') : "");
    setEditProfileField("updatedAt", currentUser?.updatedAt ? new Date(currentUser.updatedAt).toLocaleDateString('vi-VN') : "");

    setAvatarPreview("");
    setAvatarFile(null);
  }, [openEditProfileModal, currentUser, setEditProfileField]);

  return (
    <>
      <ProfileDialog
        open={openProfileModal}
        onClose={handleCloseProfileModal}
        fullWidth
        maxWidth="xs"
        slotProps={{
          transition: {
            onExited: handleProfileDialogExited,
          },
        }}
      >
        <ProfileDialogTitle>
          Thông tin tài khoản
          <IconButton onClick={handleCloseProfileModal} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </ProfileDialogTitle>

        <ProfileDialogContent>
          <ProfileHeader>
            <AvatarWrapper>
              <AvatarStyled src={resolveMediaUrl(currentUser?.avatarUrl) || "/avatar.jpg"} />
            </AvatarWrapper>

            <Box>
              <Typography fontSize="16px" fontWeight={600}>
                {currentUser?.displayName ?? ""}
              </Typography>
              <Typography fontSize="13px" color="text.secondary">
                Thông tin tài khoản
              </Typography>
            </Box>
          </ProfileHeader>

          <Divider sx={{ mb: 2 }} />

          <InfoRow label="Username" value={currentUser?.username ?? ""} />
          <InfoRow label="Email" value={currentUser?.email ?? ""} />
          {currentUser?.bio ? <InfoRow label="Bio" value={currentUser.bio} /> : null}
          <InfoRow label="Giới tính" value={currentUser?.gender ?? ""} />
          <InfoRow
            label="Ngày sinh"
            value={
              currentUser?.dateOfBirth
                ? String(currentUser.dateOfBirth).slice(0, 10)
                : ""
            }
          />
          <InfoRow label="Điện thoại" value={currentUser?.phone ?? ""} />
          <InfoRow label="Trạng thái" value={currentUser?.isActive ? "Hoạt động" : "Không hoạt động"} />
          <InfoRow 
            label="Ngày tạo" 
            value={
              currentUser?.createdAt
                ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN')
                : ""
            } 
          />
          <InfoRow 
            label="Cập nhật lần cuối" 
            value={
              currentUser?.updatedAt
                ? new Date(currentUser.updatedAt).toLocaleDateString('vi-VN')
                : ""
            } 
          />

          <Divider sx={{ m: "16px 0px" }} />

          <Box display="flex" justifyContent="center" width="100%">
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setPendingOpenEdit(true);
                setOpenProfileModal(false);
              }}
            >
              Chỉnh sửa
            </Button>
          </Box>
        </ProfileDialogContent>
      </ProfileDialog>

      <Dialog
        open={openEditProfileModal}
        onClose={handleCloseEditModal}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Chỉnh sửa thông tin
          <IconButton onClick={handleCloseEditModal} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <ProfileHeader>
            <AvatarWrapper onClick={handleChooseAvatar}>
              <AvatarStyled src={currentAvatar} />
              <AvatarEditBadge>
                <EditOutlinedIcon fontSize="small" />
              </AvatarEditBadge>
            </AvatarWrapper>

            <Box>
              <Typography fontSize="16px" fontWeight={600}>
                {editProfileData.displayName ?? ""}
              </Typography>
              <Typography fontSize="13px" color="text.secondary">
                Nhấn vào ảnh để đổi avatar
              </Typography>
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </ProfileHeader>

          <Divider sx={{ mb: 2 }} />

          <TextField
            label="Họ và tên"
            fullWidth
            margin="dense"
            value={editProfileData.displayName ?? ""}
            onChange={(e) => setEditProfileField("displayName", e.target.value)}
          />

          <TextField
            label="Bio"
            fullWidth
            margin="dense"
            value={editProfileData.bio ?? ""}
            onChange={(e) => setEditProfileField("bio", e.target.value)}
          />

          <FormControl component="fieldset" margin="dense" sx={{ mt: 2 }}>
            <FormLabel component="legend">Giới tính</FormLabel>
            <RadioGroup
              row
              value={editProfileData.gender ?? "other"}
              onChange={(e) => setEditProfileField("gender", e.target.value)}
            >
              <FormControlLabel value="male" control={<Radio />} label="Nam" />
              <FormControlLabel value="female" control={<Radio />} label="Nữ" />
              <FormControlLabel value="other" control={<Radio />} label="Khác" />
            </RadioGroup>
          </FormControl>

          <TextField
            label="Ngày sinh"
            type="date"
            fullWidth
            margin="dense"
            value={editProfileData.dateOfBirth ?? ""}
            onChange={(e) => setEditProfileField("dateOfBirth", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          
          <Divider sx={{ m: "16px 0px" }} />

          <Box display="flex" gap={1}>
            <Button fullWidth variant="outlined" onClick={handleCloseEditModal}>
              Hủy
            </Button>

            <Button fullWidth variant="contained" onClick={handleUpdateMyProfile}>
              Lưu
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openCropDialog}
        onClose={() => setOpenCropDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Cắt ảnh đại diện
          <IconButton onClick={() => setOpenCropDialog(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 320,
              bgcolor: "#000",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {selectedImageSrc ? (
              <Cropper
                image={selectedImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            ) : null}
          </Box>

          <Box mt={2}>
            <Typography fontSize="13px" mb={1}>
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

          <Box display="flex" gap={1} mt={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenCropDialog(false)}
            >
              Hủy
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSaveCroppedAvatar}
            >
              Lưu
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileModals;