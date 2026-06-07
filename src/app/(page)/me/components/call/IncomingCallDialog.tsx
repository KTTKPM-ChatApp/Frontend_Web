"use client";

import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import PhoneIcon from "@mui/icons-material/Phone";
import CallEndIcon from "@mui/icons-material/CallEnd";
import GroupsIcon from "@mui/icons-material/Groups";
import { CircularProgress } from "@mui/material";
import { answerCall, rejectCall, handleIncomingGroupCall } from "@/src/common/action/call.action";
import { useCallStore } from "@/src/common/store/useCallStore";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { playRingtone, stopRingtone } from "@/src/common/service/ringtone";

const Overlay = styled(Box)({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  zIndex: 9998,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const Card = styled(Box)({
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 32,
  textAlign: "center",
  minWidth: 320,
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
});

const Avatar = styled(Box)({
  width: 80,
  height: 80,
  borderRadius: "50%",
  backgroundColor: "#005AE0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 32,
  fontWeight: 700,
  margin: "0 auto 16px",
});

const Actions = styled(Box)({
  display: "flex",
  justifyContent: "center",
  gap: 24,
  marginTop: 24,
});

const ActionBtn = styled(Box)<{ color: string }>(({ color }) => ({
  width: 56,
  height: 56,
  borderRadius: "50%",
  backgroundColor: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#fff",
  transition: "transform 0.2s",
  "&:hover": { transform: "scale(1.1)" },
}));

export default function IncomingCallDialog() {
  const t = useTrans();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any>(null);
  const isAnswering = useCallStore((s) => s.isAnswering);
  const isRejecting = useCallStore((s) => s.isRejecting);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const store = useCallStore.getState();
      if (store.status !== "idle") return;
      setData(detail);
      setVisible(true);
      playRingtone();
    };
    window.addEventListener("call:incoming", handler);
    return () => window.removeEventListener("call:incoming", handler);
  }, []);

  if (!visible || !data) return null;

  const handleAccept = () => {
    stopRingtone();
    setVisible(false);
    useCallStore.getState().receiveCall({
      callId: data.call_id || data.session_id,
      conversationId: data.conversation_id,
      callerId: data.started_by,
      callerName: data.caller_name || "Unknown",
      type: data.type === "incoming_group_call" ? "GROUP" : (data.call_type || "AUDIO"),
      sfuRoomId: data.sfu_room_id,
      sessionId: data.session_id,
    });

    if (data.type === "incoming_group_call") {
      handleIncomingGroupCall(data.conversation_id, data.session_id, data.sfu_room_id);
    } else {
      answerCall(data.conversation_id, data.call_id);
    }
  };

  const handleReject = () => {
    stopRingtone();
    setVisible(false);
    if (data.type === "incoming_group_call") {
      // group calls don't have individual reject; just ignore
    } else {
      rejectCall(data.conversation_id, data.call_id);
    }
  };

  const isGroup = data.type === "incoming_group_call";

  return (
    <Overlay onClick={handleReject}>
      <Card onClick={(e) => e.stopPropagation()}>
        {isGroup ? (
          <Avatar sx={{ backgroundColor: "#7C3AED" }}>
            <GroupsIcon sx={{ fontSize: 36 }} />
          </Avatar>
        ) : (
          <Avatar>{(data.caller_name || "?")[0]}</Avatar>
        )}
        <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 1 }}>
          {data.caller_name || t("CHAT.UNKNOWN")}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
          {isGroup ? t("CHAT.CALL_GROUP") : (data.call_type === "VIDEO" ? t("CHAT.CALL_VIDEO") : t("CHAT.CALL_AUDIO"))}
        </Typography>
        <Actions>
          <ActionBtn
            color="#22C55E"
            onClick={handleAccept}
            sx={{ opacity: isAnswering ? 0.7 : 1, cursor: isAnswering ? "not-allowed" : "pointer" }}
          >
            {isAnswering ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : isGroup ? (
              <GroupsIcon sx={{ fontSize: 28 }} />
            ) : (
              <PhoneIcon sx={{ fontSize: 28 }} />
            )}
          </ActionBtn>
          <ActionBtn
            color="#E53935"
            onClick={handleReject}
            sx={{ opacity: isRejecting ? 0.7 : 1, cursor: isRejecting ? "not-allowed" : "pointer" }}
          >
            {isRejecting ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              <CallEndIcon sx={{ fontSize: 28 }} />
            )}
          </ActionBtn>
        </Actions>
      </Card>
    </Overlay>
  );
}
