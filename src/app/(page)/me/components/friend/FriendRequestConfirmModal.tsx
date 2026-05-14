"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  TextField,
  Switch,
  CircularProgress,
  Stack,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

const Content = styled(Box)({
  padding: "20px 0",
});

const UserInfo = styled(Stack)({
  alignItems: "center",
  gap: 16,
  marginBottom: 24,
});

const UserName = styled(Typography)({
  fontSize: 18,
  fontWeight: 600,
  color: "#0F172A",
});

const UserMessage = styled(Typography)({
  fontSize: 14,
  color: "#64748B",
  textAlign: "center",
  maxWidth: 300,
});

const Banner = styled(Box)(({ theme }) => ({
  height: 180,
  width: "100%",
  background: "linear-gradient(135deg, #DCEBFF 0%, #F8E7D8 50%, #E8F1D4 100%)",
  overflow: "hidden",
  position: "relative",
}));

const UserInfoWrap = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: "0 20px 20px",
}));

const AvatarWrap = styled(Box)(({ theme }) => ({
  marginTop: -42,
  display: "flex",
  alignItems: "center",
  gap: 16,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 84,
  height: 84,
  border: "4px solid #FFFFFF",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
}));

const OnlineIndicator = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: "#10B981",
  border: "2px solid #FFFFFF",
  position: "absolute",
  bottom: 0,
  right: 0,
}));

const OfflineIndicator = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: "#94A3B8",
  border: "2px solid #FFFFFF",
  position: "absolute",
  bottom: 0,
  right: 0,
}));

interface User {
  id: string;
  name?: string;
  displayName?: string;
  fullName?: string;
  avatar?: string;
  avatarUrl?: string | null;
  message?: string;
  phone?: string | null;
}

interface FriendRequestConfirmModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onConfirm?: () => void;
  onReject?: () => void;
  loading?: boolean;
  message?: string;
  onChangeMessage?: (message: string) => void;
  onChangeBlockDiary?: (value: boolean) => void;
  onViewProfile?: (user: User) => void;
}

const FriendRequestConfirmModal: React.FC<FriendRequestConfirmModalProps> = ({
  open,
  onClose,
  user,
  onConfirm = () => {},
  onReject = () => {},
  loading = false,
  message: controlledMessage,
  onChangeMessage,
  onChangeBlockDiary,
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("Xin chào, Kết bạn với mình nhé!");
  const [blockDiary, setBlockDiary] = useState(false);
  const displayName = user?.name ?? user?.fullName ?? user?.displayName ?? "";
  const avatarSrc = user?.avatar ?? user?.avatarUrl ?? undefined;
  const currentMessage = controlledMessage ?? message;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: open ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1400,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          width: { xs: "90%", sm: 400 },
          maxHeight: "80vh",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: "1px solid #E5E7EB" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 600, color: "#0F172A" }}>
              {t("FRIEND.REQUEST_CONFIRM_TITLE")}
            </Typography>
            <IconButton onClick={onClose} sx={{ p: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Banner */}
        <Banner />

        {/* User Info */}
        <UserInfoWrap>
          <AvatarWrap>
            <Box sx={{ position: "relative" }}>
              <StyledAvatar
                src={avatarSrc}
                sx={{ width: 84, height: 84 }}
              >
                {displayName.charAt(0)}
              </StyledAvatar>
              <OnlineIndicator />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 600 }}>
                {displayName}
              </Typography>
              {user?.phone && (
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  {user.phone}
                </Typography>
              )}
            </Box>
          </AvatarWrap>

          {/* User Message */}
          {user?.message && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: "#F8FAFC", borderRadius: 8 }}>
              <Typography variant="body2" sx={{ color: "#64748B", fontStyle: "italic" }}>
                &quot;{user.message}&quot;
              </Typography>
            </Box>
          )}

          {/* Message Input */}
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={currentMessage}
              onChange={(e) => {
                setMessage(e.target.value);
                onChangeMessage?.(e.target.value);
              }}
              placeholder={t("FRIEND.MESSAGE_PLACEHOLDER")}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 12,
                },
              }}
            />
          </Box>

          {/* Privacy Options */}
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              {t("FRIEND.ALLOW_DIARY")}
            </Typography>
            <Switch
              checked={blockDiary}
              onChange={(e) => {
                setBlockDiary(e.target.checked);
                onChangeBlockDiary?.(e.target.checked);
              }}
              size="small"
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onReject}
              sx={{ flex: 1 }}
              disabled={loading}
              color="error"
            >
              {t("FRIEND.REJECT")}
            </Button>
            <Button
              variant="contained"
              onClick={onConfirm}
              sx={{ flex: 1 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
            >
              {t("FRIEND.ACCEPT")}
            </Button>
          </Box>
        </UserInfoWrap>
      </Box>
    </Box>
  );
};

export default FriendRequestConfirmModal;
