"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { authService } from "@/src/common/service/auth-service";

const Root = styled(Box)({
  height: "100%",
  background: "#F3F5F7",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
});

const Header = styled(Box)({
  height: 76,
  background: "#FFFFFF",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  padding: "0 20px",
});

const HeaderTitle = styled(Typography)({
  fontSize: 24,
  fontWeight: 700,
  color: "#0F172A",
});

const Content = styled(Box)({
  padding: 20,
  maxWidth: 600,
});

const Section = styled(Box)({
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  padding: 20,
  marginBottom: 16,
});

const SectionTitle = styled(Typography)({
  fontSize: 16,
  fontWeight: 700,
  color: "#0F172A",
  marginBottom: 16,
});

export default function SettingsPanel() {
  const authData = useAuthStore((s) => s.authData);
  const user = authData?.data?.user;

  const [openPassword, setOpenPassword] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPw || !newPw || !confirmPw) {
      toast.warning("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPw.length < 6) {
      toast.warning("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPw !== confirmPw) {
      toast.warning("Mật khẩu xác nhận không khớp");
      return;
    }
    setSaving(true);
    try {
      const res = await authService.changePassword(oldPw, newPw);
      if (res?.ok) {
        toast.success("Đổi mật khẩu thành công");
        setOpenPassword(false);
        setOldPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        const msg = (res?.payload as any)?.message || "Không thể đổi mật khẩu";
        toast.error(msg);
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể đổi mật khẩu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Root>
      <Header>
        <HeaderTitle>Cài đặt</HeaderTitle>
      </Header>

      <Content>
        <Section>
          <SectionTitle>Thông tin tài khoản</SectionTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
            <Avatar src={user?.avatarUrl || undefined} sx={{ width: 64, height: 64 }}>
              {user?.displayName?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography fontWeight={600} variant="h6">
                {user?.displayName || "Người dùng"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                Tên đăng nhập
              </Typography>
              <Typography variant="body2">{user?.username}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                Số điện thoại
              </Typography>
              <Typography variant="body2">{user?.phone || "Chưa cập nhật"}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                Giới tính
              </Typography>
              <Typography variant="body2">{user?.gender || "Chưa cập nhật"}</Typography>
            </Box>
          </Box>
        </Section>

        <Section>
          <SectionTitle>Bảo mật</SectionTitle>
          <Button variant="outlined" onClick={() => setOpenPassword(true)}>
            Đổi mật khẩu
          </Button>
        </Section>
      </Content>

      <Dialog open={openPassword} onClose={() => setOpenPassword(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Mật khẩu hiện tại"
              type="password"
              size="small"
              fullWidth
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
            />
            <TextField
              label="Mật khẩu mới"
              type="password"
              size="small"
              fullWidth
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              helperText="Ít nhất 6 ký tự"
            />
            <TextField
              label="Xác nhận mật khẩu mới"
              type="password"
              size="small"
              fullWidth
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              error={confirmPw.length > 0 && confirmPw !== newPw}
              helperText={confirmPw.length > 0 && confirmPw !== newPw ? "Mật khẩu không khớp" : ""}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPassword(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleChangePassword} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : "Lưu mật khẩu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
}
