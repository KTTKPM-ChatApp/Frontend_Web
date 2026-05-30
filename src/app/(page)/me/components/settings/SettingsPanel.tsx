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
import { useTrans } from "@/src/common/utilities/hook/trans";
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
  const t = useTrans();
  const authData = useAuthStore((s) => s.authData);
  const user = authData?.data?.user;

  const [openPassword, setOpenPassword] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPw || !newPw || !confirmPw) {
      toast.warning(t("SETTINGS.FILL_ALL_INFO"));
      return;
    }
    if (newPw.length < 6) {
      toast.warning(t("SETTINGS.NEW_PASSWORD_MIN_LENGTH"));
      return;
    }
    if (newPw !== confirmPw) {
      toast.warning(t("SETTINGS.PASSWORD_MISMATCH"));
      return;
    }
    setSaving(true);
    try {
      const res = await authService.changePassword(oldPw, newPw);
      if (res?.ok) {
        toast.success(t("SETTINGS.PASSWORD_CHANGE_SUCCESS"));
        setOpenPassword(false);
        setOldPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        const msg = (res?.payload as any)?.message || t("SETTINGS.CANNOT_CHANGE_PASSWORD");
        toast.error(msg);
      }
    } catch (err: any) {
      toast.error(err?.message || t("SETTINGS.CANNOT_CHANGE_PASSWORD"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Root>
      <Header>
        <HeaderTitle>{t("SETTINGS.TITLE")}</HeaderTitle>
      </Header>

      <Content>
        <Section>
          <SectionTitle>{t("SETTINGS.ACCOUNT_INFO")}</SectionTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
            <Avatar src={user?.avatarUrl || undefined} sx={{ width: 64, height: 64 }}>
              {user?.displayName?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography fontWeight={600} variant="h6">
                {user?.displayName || t("SETTINGS.DEFAULT_USER")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                {t("SETTINGS.USERNAME")}
              </Typography>
              <Typography variant="body2">{user?.username}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                {t("SETTINGS.PHONE")}
              </Typography>
              <Typography variant="body2">{user?.phone || t("SETTINGS.NOT_UPDATED")}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                {t("SETTINGS.GENDER")}
              </Typography>
              <Typography variant="body2">{user?.gender || t("SETTINGS.NOT_UPDATED")}</Typography>
            </Box>
          </Box>
        </Section>

        <Section>
          <SectionTitle>{t("SETTINGS.SECURITY")}</SectionTitle>
          <Button variant="outlined" onClick={() => setOpenPassword(true)}>
            {t("SETTINGS.CHANGE_PASSWORD")}
          </Button>
        </Section>
      </Content>

      <Dialog open={openPassword} onClose={() => setOpenPassword(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("SETTINGS.CHANGE_PASSWORD")}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label={t("SETTINGS.CURRENT_PASSWORD")}
              type="password"
              size="small"
              fullWidth
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
            />
            <TextField
              label={t("SETTINGS.NEW_PASSWORD")}
              type="password"
              size="small"
              fullWidth
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              helperText={t("SETTINGS.MIN_LENGTH_6")}
            />
            <TextField
              label={t("SETTINGS.CONFIRM_PASSWORD")}
              type="password"
              size="small"
              fullWidth
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              error={confirmPw.length > 0 && confirmPw !== newPw}
              helperText={confirmPw.length > 0 && confirmPw !== newPw ? t("SETTINGS.PASSWORD_NOT_MATCH") : ""}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPassword(false)}>{t("SETTINGS.CANCEL")}</Button>
          <Button variant="contained" onClick={handleChangePassword} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : t("SETTINGS.SAVE_PASSWORD")}
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
}
