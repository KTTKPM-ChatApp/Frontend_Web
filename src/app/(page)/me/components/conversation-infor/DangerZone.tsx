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

import { chatService } from "@/src/common/service/chat-service";
import { useChatStore } from "@/src/common/store/useChatStore";

const Card = styled(Box)({
  background: "#fff",
  marginBottom: 8,
});

const DangerRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "danger",
})<{ danger?: boolean }>(({ danger }) => ({
  minHeight: 58,
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: danger ? "#DC2626" : "#0F172A",
  cursor: "pointer",

  "&:hover": {
    background: "#F8FAFC",
  },
}));

interface DangerZoneProps {
  conversationId: string;
}

export default function DangerZone({ conversationId }: DangerZoneProps) {
  const { t } = useTranslation();
  const [confirmAction, setConfirmAction] = useState<"leave" | "disband" | null>(null);

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

  const refresh = () => fetchListConversation({ page: 1, limit: 20 });

  const handleLeave = async () => {
    try {
      await chatService.leaveConversation(conversationId);
      toast.success("Đã rời nhóm");
      setActiveConversationId(null);
      await refresh();
    } catch {
      toast.error("Không thể rời nhóm");
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
    } catch {
      toast.error("Không thể giải tán nhóm");
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <>
      <Card>
        {isGroup && (
          <>
          <DangerRow onClick={() => setConfirmAction("leave")}>
            <ExitToAppIcon />
            <Typography fontSize={15}>{t("DANGER.LEAVE_GROUP")}</Typography>
          </DangerRow>
            <Divider />
          </>
        )}

        {isGroup && isOwner && (
          <>
          <DangerRow danger onClick={() => setConfirmAction("disband")}>
            <DeleteForeverIcon />
            <Typography fontSize={15}>{t("DANGER.DISBAND_GROUP")}</Typography>
          </DangerRow>
            <Divider />
          </>
        )}

        <DangerRow>
          <ReportGmailerrorredRoundedIcon />
          <Typography fontSize={15}>{t("DANGER.REPORT")}</Typography>
        </DangerRow>

        <Divider />

        <DangerRow danger>
          <DeleteOutlineRoundedIcon />
          <Typography fontSize={15}>{t("DANGER.DELETE_HISTORY")}</Typography>
        </DangerRow>
      </Card>

      <Dialog open={confirmAction === "leave"} onClose={() => setConfirmAction(null)}>
        <DialogTitle>{t("DANGER.LEAVE_GROUP")}</DialogTitle>
        <DialogContent>
          <Typography>{t("DANGER.LEAVE_GROUP_CONFIRM")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={handleLeave}>
            Rời nhóm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmAction === "disband"} onClose={() => setConfirmAction(null)}>
        <DialogTitle>{t("DANGER.DISBAND_GROUP")}</DialogTitle>
        <DialogContent>
          <Typography>{t("DANGER.DISBAND_GROUP_CONFIRM")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={handleDisband}>
            Giải tán
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
