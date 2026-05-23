"use client";

import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import ReportGmailerrorredRoundedIcon from "@mui/icons-material/ReportGmailerrorredRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import { chatService } from "@/src/common/service/chat-service";
import { useChatStore } from "@/src/common/store/useChatStore";

const Card = styled(Box)({
  background: "#fff",
  marginBottom: 8,
  borderRadius: 8,
});

const DangerRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "danger",
})<{ danger?: boolean }>(({ danger }) => ({
  minHeight: 58,
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: danger ? "#DB0000" : "#000000",
  cursor: "pointer",

  "&:hover": {
    background: "#F7F7F8",
  },
}));

const ActionText = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.4,
});

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    borderRadius: 12,
    maxWidth: 400,
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
  "& p": {
    fontSize: 14,
    color: "#767A7F",
    lineHeight: 1.5,
  },
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

const ConfirmButton = styled(Button)({
  height: 40,
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "none",
  padding: "0 16px",
});

const DangerButton = styled(ConfirmButton)({
  background: "#DB0000",
  color: "#fff",
  "&:hover": {
    background: "#B80000",
  },
});

const PrimaryButton = styled(ConfirmButton)({
  background: "#0068FF",
  color: "#fff",
  "&:hover": {
    background: "#005AE0",
  },
});

const WarningBox = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "12px 16px",
  background: "#FFF7ED",
  borderRadius: 8,
  border: "1px solid #FED7AA",
  marginBottom: 8,
});

const WarningText = styled(Typography)({
  fontSize: 13,
  color: "#C2410C",
  lineHeight: 1.5,
});

interface DangerZoneProps {
  conversationId: string;
}

export default function DangerZone({ conversationId }: DangerZoneProps) {
  const { t } = useTranslation();
  const [confirmAction, setConfirmAction] = useState<"leave" | "disband" | "leave-owner" | null>(null);

  const listConversation = useChatStore((s) => s.listConversation);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const currentUserId = useChatStore((s) => s.currentUserId);

  const conversation = listConversation.find((c) => c.id === activeConversationId);
  const isGroup = conversation?.type === "group" || conversation?.type === "GROUP";
  const currentUser = conversation?.members?.find((m: any) => m.userId === currentUserId);
  const userRole = (currentUser as any)?.role;
  const isOwner = userRole === "OWNER";
  const memberCount = conversation?.members?.length ?? conversation?.memberCount ?? 0;

  const refresh = () => fetchListConversation({ page: 1, limit: 20 });

  const handleLeave = async () => {
    try {
      await chatService.leaveConversation(conversationId);
      toast.success("Đã rời nhóm");
      setActiveConversationId(null);
      await refresh();
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || "Không thể rời nhóm";
      toast.error(message);
    } finally {
      setConfirmAction(null);
    }
  };

  const handleDisband = async () => {
    try {
      await chatService.disbandGroup(conversationId);
      toast.success("Đã giải tán nhóm");
      setActiveConversationId(null);
      await refresh();
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || "Không thể giải tán nhóm";
      toast.error(message);
    } finally {
      setConfirmAction(null);
    }
  };

  const handleLeaveClick = () => {
    if (isOwner && memberCount > 1) {
      setConfirmAction("leave-owner");
    } else {
      setConfirmAction("leave");
    }
  };

  const getLeaveTitle = () => {
    if (confirmAction === "leave-owner") {
      return "Không thể rời nhóm";
    }
    return t("DANGER.LEAVE_GROUP");
  };

  const getLeaveMessage = () => {
    if (confirmAction === "leave-owner") {
      return "Là trưởng nhóm, bạn không thể rời nhóm khi còn thành viên khác. Vui lòng chuyển quyền trưởng nhóm cho người khác hoặc giải tán nhóm.";
    }
    return t("DANGER.LEAVE_GROUP_CONFIRM");
  };

  return (
    <>
      <Card>
        {isGroup && (
          <>
            <DangerRow onClick={handleLeaveClick}>
              <ExitToAppIcon sx={{ fontSize: 20 }} />
              <ActionText>{t("DANGER.LEAVE_GROUP")}</ActionText>
            </DangerRow>
            <Divider sx={{ mx: 0 }} />
          </>
        )}

        {isGroup && isOwner && (
          <>
            <DangerRow danger onClick={() => setConfirmAction("disband")}>
              <DeleteForeverIcon sx={{ fontSize: 20 }} />
              <ActionText>{t("DANGER.DISBAND_GROUP")}</ActionText>
            </DangerRow>
            <Divider sx={{ mx: 0 }} />
          </>
        )}

        <DangerRow>
          <ReportGmailerrorredRoundedIcon sx={{ fontSize: 20 }} />
          <ActionText>{t("DANGER.REPORT")}</ActionText>
        </DangerRow>

        <Divider sx={{ mx: 0 }} />

        <DangerRow danger>
          <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
          <ActionText>{t("DANGER.DELETE_HISTORY")}</ActionText>
        </DangerRow>
      </Card>

      <StyledDialog open={confirmAction === "leave"} onClose={() => setConfirmAction(null)}>
        <DialogTitleStyled>{t("DANGER.LEAVE_GROUP")}</DialogTitleStyled>
        <DialogContentStyled>
          <Typography>{t("DANGER.LEAVE_GROUP_CONFIRM")}</Typography>
        </DialogContentStyled>
        <DialogActionsStyled>
          <CancelButton onClick={() => setConfirmAction(null)}>Hủy</CancelButton>
          <DangerButton onClick={handleLeave}>Rời nhóm</DangerButton>
        </DialogActionsStyled>
      </StyledDialog>

      <StyledDialog open={confirmAction === "leave-owner"} onClose={() => setConfirmAction(null)}>
        <DialogTitleStyled>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SwapHorizIcon sx={{ color: "#FFB800" }} />
            Chuyển quyền trưởng nhóm
          </Box>
        </DialogTitleStyled>
        <DialogContentStyled>
          <WarningBox>
            <WarningText>
              Bạn là trưởng nhóm. Để rời nhóm, hãy chuyển quyền trưởng nhóm cho thành viên khác trong phần quản lý thành viên, hoặc giải tán nhóm nếu không cần thiết.
            </WarningText>
          </WarningBox>
          <Typography sx={{ mt: 1 }}>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <strong>Cách chuyển quyền:</strong> Vào danh sách thành viên → Nhấn icon mũi tên bên cạnh thành viên muốn chuyển quyền → Chọn "Chuyển quyền trưởng nhóm".
          </Typography>
        </DialogContentStyled>
        <DialogActionsStyled>
          <CancelButton onClick={() => setConfirmAction(null)}>Đóng</CancelButton>
        </DialogActionsStyled>
      </StyledDialog>

      <StyledDialog open={confirmAction === "disband"} onClose={() => setConfirmAction(null)}>
        <DialogTitleStyled>{t("DANGER.DISBAND_GROUP")}</DialogTitleStyled>
        <DialogContentStyled>
          <WarningBox>
            <WarningText>
              Hành động này sẽ xóa vĩnh viễn nhóm và toàn bộ tin nhắn. Không thể hoàn tác.
            </WarningText>
          </WarningBox>
          <Typography sx={{ mt: 1 }}>{t("DANGER.DISBAND_GROUP_CONFIRM")}</Typography>
        </DialogContentStyled>
        <DialogActionsStyled>
          <CancelButton onClick={() => setConfirmAction(null)}>Hủy</CancelButton>
          <DangerButton onClick={handleDisband}>Giải tán</DangerButton>
        </DialogActionsStyled>
      </StyledDialog>
    </>
  );
}
