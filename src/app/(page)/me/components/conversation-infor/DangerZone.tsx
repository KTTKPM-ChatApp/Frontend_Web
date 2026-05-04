"use client";

import React, { useMemo, useState } from "react";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import ReportGmailerrorredRoundedIcon from "@mui/icons-material/ReportGmailerrorredRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CancelPresentationOutlinedIcon from "@mui/icons-material/CancelPresentationOutlined";
import { useChatStore } from "@/src/common/store/useChatStore";
import { groupService } from "@/src/common/service/group-service";
import AppModal from "@/src/shared/component/AppModal";
import { useTrans } from "@/src/common/utilities/hook/trans";

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

export default function DangerZone() {
  const t = useTrans();
  const conversationId = useChatStore((s) => s.activeConversationId);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const conversationDetail = useChatStore(
    (s) => s.conversationDetailById[conversationId ?? ""] ?? null
  );
  const removeConversationLocally = useChatStore((s) => s.removeConversationLocally);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);

  const isGroup = conversationDetail?.type === "group";

  const myRole = useMemo(() => {
    const members = conversationDetail?.members ?? [];
    return members.find((member) => member.userId === currentUserId)?.role;
  }, [conversationDetail?.members, currentUserId]);

  const isOwner = myRole === "owner";

  const [leaving, setLeaving] = useState(false);
  const [disbanding, setDisbanding] = useState(false);
  const [openLeaveGroupModal, setOpenLeaveGroupModal] = useState(false);
  const [openDisbandGroupModal, setOpenDisbandGroupModal] = useState(false);

  const handleOutGroup = async () => {
    if (!conversationId) return;

    try {
      setLeaving(true);
      await groupService.leaveGroup(conversationId);
      removeConversationLocally(conversationId);
      setActiveConversationId(null);
      setOpenLeaveGroupModal(false);
    } catch (error) {
      console.error(t("CONVO.LEAVE_FAILED"), error);
    } finally {
      setLeaving(false);
    }
  };

  const handleDisbandGroup = async () => {
    if (!conversationId) return;
    if (!isOwner) return;

    try {
      setDisbanding(true);
      await groupService.disbandGroup(conversationId);
      removeConversationLocally(conversationId);
      setActiveConversationId(null);
      setOpenDisbandGroupModal(false);
    } catch (error) {
      console.error(t("CONVO.DISBAND_FAILED"), error);
    } finally {
      setDisbanding(false);
    }
  };

  return (
    <>
      <Card>
        <DangerRow>
          <ReportGmailerrorredRoundedIcon />
          <Typography fontSize={15}>{t("CONVO.REPORT")}</Typography>
        </DangerRow>

        <Divider />

        <DangerRow danger>
          <DeleteOutlineRoundedIcon />
          <Typography fontSize={15}>{t("CONVO.DELETE_HISTORY")}</Typography>
        </DangerRow>

        {isGroup && (
          <Stack>
            <DangerRow danger onClick={() => setOpenLeaveGroupModal(true)}>
              <LogoutOutlinedIcon />
              <Typography fontSize={15}>{t("CONVO.LEAVE")}</Typography>
            </DangerRow>

            {isOwner && (
              <DangerRow danger onClick={() => setOpenDisbandGroupModal(true)}>
                <CancelPresentationOutlinedIcon />
                <Typography fontSize={15}>{t("CONVO.DISBAND")}</Typography>
              </DangerRow>
            )}
          </Stack>
        )}
      </Card>

      <AppModal
        open={openLeaveGroupModal}
        onClose={() => {
          if (leaving) return;
          setOpenLeaveGroupModal(false);
        }}
        title={isOwner ? t("CONVO.LEAVE_TITLE_OWNER") : t("CONVO.LEAVE_TITLE_MEMBER")}
        headerDivider
        actions={
          <>
            <Button
              onClick={() => setOpenLeaveGroupModal(false)}
              disabled={leaving}
              color="inherit"
            >
              {t("COMMON.BACK")}
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleOutGroup}
              disabled={leaving}
            >
              {t("CONVO.CONFIRM")}
            </Button>
          </>
        }
      >
        <Typography fontSize={14}>
          {isOwner
            ? t("CONVO.LEAVE_DESC_OWNER")
            : t("CONVO.LEAVE_DESC_MEMBER")}
        </Typography>
      </AppModal>

      <AppModal
        open={openDisbandGroupModal}
        onClose={() => {
          if (disbanding) return;
          setOpenDisbandGroupModal(false);
        }}
        title={t("CONVO.DISBAND")}
        headerDivider
        actions={
          <>
            <Button
              onClick={() => setOpenDisbandGroupModal(false)}
              disabled={disbanding}
              color="inherit"
            >
              {t("COMMON.BACK")}
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleDisbandGroup}
              disabled={disbanding}
            >
              {t("CONVO.CONFIRM")}
            </Button>
          </>
        }
      >
        <Typography fontSize={14}>
          {t("CONVO.DISBAND_DESC")}
        </Typography>
      </AppModal>
    </>
  );
}