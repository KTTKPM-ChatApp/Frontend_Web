"use client";

import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import { useTrans } from "@/src/common/utilities/hook/trans";
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
  const t = useTrans();
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
      toast.success(t("CONVO.LEAVE_SUCCESS"));
      setActiveConversationId(null);
      await refresh();
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || t("CONVO.LEAVE_FAILED");
      toast.error(message);
    } finally {
      setConfirmAction(null);
    }
  };

  const handleDisband = async () => {
    try {
      await chatService.disbandGroup(conversationId);
      toast.success(t("CONVO.DISBAND_SUCCESS"));
      setActiveConversationId(null);
      await refresh();
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || t("CONVO.DISBAND_FAILED");
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
      return t("CONVO.CANNOT_LEAVE");
    }
    return t("DANGER.LEAVE_GROUP");
  };

  const getLeaveMessage = () => {
    if (confirmAction === "leave-owner") {
      return t("CONVO.LEAVE_OWNER_MESSAGE");
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
          <CancelButton onClick={() => setConfirmAction(null)}>{t("CONVO.CANCEL")}</CancelButton>
          <DangerButton onClick={handleLeave}>{t("DANGER.LEAVE_GROUP")}</DangerButton>
        </DialogActionsStyled>
      </StyledDialog>

      <StyledDialog open={confirmAction === "leave-owner"} onClose={() => setConfirmAction(null)}>
        <DialogTitleStyled>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SwapHorizIcon sx={{ color: "#FFB800" }} />
            {t("CONVO.TRANSFER_OWNERSHIP")}
          </Box>
        </DialogTitleStyled>
        <DialogContentStyled>
          <WarningBox>
            <WarningText>
              {t("CONVO.LEAVE_OWNER_WARNING")}
            </WarningText>
          </WarningBox>
          <Typography sx={{ mt: 1 }} dangerouslySetInnerHTML={{ __html: t("CONVO.TRANSFER_INSTRUCTION") }} />
        </DialogContentStyled>
        <DialogActionsStyled>
          <CancelButton onClick={() => setConfirmAction(null)}>{t("COMMON.CLOSE")}</CancelButton>
        </DialogActionsStyled>
      </StyledDialog>

      <StyledDialog open={confirmAction === "disband"} onClose={() => setConfirmAction(null)}>
        <DialogTitleStyled>{t("DANGER.DISBAND_GROUP")}</DialogTitleStyled>
        <DialogContentStyled>
          <WarningBox>
            <WarningText>
              {t("CONVO.DISBAND_WARNING")}
            </WarningText>
          </WarningBox>
          <Typography sx={{ mt: 1 }}>{t("DANGER.DISBAND_GROUP_CONFIRM")}</Typography>
        </DialogContentStyled>
        <DialogActionsStyled>
          <CancelButton onClick={() => setConfirmAction(null)}>{t("CONVO.CANCEL")}</CancelButton>
          <DangerButton onClick={handleDisband}>{t("CONVO.DISBAND_BTN")}</DangerButton>
        </DialogActionsStyled>
      </StyledDialog>
    </>
  );
}
