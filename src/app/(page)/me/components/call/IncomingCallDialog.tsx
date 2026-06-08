"use client";

import { useEffect, useState, useRef } from "react";
import { Box, Typography, keyframes } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import PhoneIcon from "@mui/icons-material/Phone";
import CallEndIcon from "@mui/icons-material/CallEnd";
import GroupsIcon from "@mui/icons-material/Groups";
import { CircularProgress } from "@mui/material";
import { answerCall, rejectCall, handleIncomingGroupCall, endCall } from "@/src/common/action/call.action";
import { useCallStore } from "@/src/common/store/useCallStore";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { playRingtone, stopRingtone } from "@/src/common/service/ringtone";

const pulseRing = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 0.4; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const waveAnimation = keyframes`
  0% { transform: scaleX(0.3); }
  50% { transform: scaleX(1); }
  100% { transform: scaleX(0.3); }
`;

const Overlay = styled(Box)({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "linear-gradient(135deg, #005AE0 0%, #0068FF 50%, #0077FF 100%)",
  zIndex: 9998,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  animation: `${fadeIn} 0.3s ease-out`,
  overflowY: "auto",
  paddingTop: "env(safe-area-inset-top, 0px)",
  paddingBottom: "env(safe-area-inset-bottom, 0px)",
});

const ContentWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  width: "100%",
  paddingTop: 80,
  "@media (max-width: 767px)": {
    paddingTop: 40,
  },
});

const AvatarContainer = styled(Box)({
  position: "relative",
  marginBottom: 32,
});

const PulseRing = styled(Box)({
  position: "absolute",
  top: -12,
  left: -12,
  right: -12,
  bottom: -12,
  borderRadius: "50%",
  border: "3px solid rgba(255,255,255,0.4)",
  animation: `${pulseRing} 1.5s ease-in-out infinite`,
});

const PulseRing2 = styled(Box)({
  position: "absolute",
  top: -24,
  left: -24,
  right: -24,
  bottom: -24,
  borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.2)",
  animation: `${pulseRing} 1.5s ease-in-out infinite 0.3s`,
});

const Avatar = styled(Box)({
  width: 140,
  height: 140,
  borderRadius: "50%",
  backgroundColor: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#005AE0",
  fontSize: 56,
  fontWeight: 700,
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  position: "relative",
  zIndex: 1,
  animation: `${float} 3s ease-in-out infinite`,
  "@media (max-width: 767px)": {
    width: 100,
    height: 100,
    fontSize: 40,
  },
});

const CallerInfo = styled(Box)({
  textAlign: "center",
  marginBottom: 48,
});

const WaveContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  marginTop: 16,
  height: 24,
});

const Wave = styled(Box)<{ delay: number }>(({ delay }) => ({
  width: 4,
  height: "100%",
  backgroundColor: "rgba(255,255,255,0.7)",
  borderRadius: 4,
  animation: `${waveAnimation} 1s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const Actions = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 48,
  marginBottom: 80,
  paddingBottom: 40,
  "@media (max-width: 767px)": {
    gap: 32,
    marginBottom: 40,
    paddingBottom: 24,
  },
});

const ActionBtn = styled(Box)<{ color: string; bgcolor?: string }>(({ color, bgcolor }) => ({
  width: 72,
  height: 72,
  borderRadius: "50%",
  backgroundColor: bgcolor || "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: color,
  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
  "@media (max-width: 767px)": {
    width: 64,
    height: 64,
  },
}));

const CallTypeBadge = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  backgroundColor: "rgba(255,255,255,0.15)",
  padding: "6px 16px",
  borderRadius: 20,
  marginTop: 12,
});

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

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopRingtone();
    setVisible(false);

    const store = useCallStore.getState();
    const wasInExistingCall = store.active && store.status !== "idle";

    if (wasInExistingCall) {
      endCall();
    }

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

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopRingtone();
    setVisible(false);
    if (data.type === "incoming_group_call") {
    } else {
      rejectCall(data.conversation_id, data.call_id);
    }
  };

  const isGroup = data.type === "incoming_group_call";
  const isVideo = data.call_type === "VIDEO";
  const callerInitial = (data.caller_name || "?")[0].toUpperCase();

  return (
    <Overlay onClick={handleReject}>
      <ContentWrapper>
        <AvatarContainer>
          <PulseRing />
          <PulseRing2 />
          <Avatar>
            {isGroup ? (
              <GroupsIcon sx={{ fontSize: 56, color: "#005AE0" }} />
            ) : (
              <Typography sx={{ color: "#005AE0", fontWeight: 700, fontSize: 48 }}>
                {callerInitial}
              </Typography>
            )}
          </Avatar>
        </AvatarContainer>

        <CallerInfo>
          <Typography
            sx={{
              color: "#fff",
              fontSize: 28,
              fontWeight: 600,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {data.caller_name || t("CHAT.UNKNOWN")}
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              mt: 0.5,
            }}
          >
            {isGroup ? "Cuộc gọi nhóm" : isVideo ? "Cuộc gọi video" : "Cuộc gọi thoại"}
          </Typography>
          {!isGroup && (
            <WaveContainer>
              <Wave delay={0} />
              <Wave delay={0.2} />
              <Wave delay={0.4} />
              <Wave delay={0.6} />
              <Wave delay={0.8} />
            </WaveContainer>
          )}
        </CallerInfo>

        <Actions>
          <ActionBtn bgcolor="#fff" color="#EF4444" onClick={handleReject}>
            {isRejecting ? (
              <CircularProgress size={28} sx={{ color: "#EF4444" }} />
            ) : (
              <CallEndIcon sx={{ fontSize: 28 }} />
            )}
          </ActionBtn>

          <ActionBtn bgcolor="#22C55E" color="#fff" onClick={handleAccept}>
            {isAnswering ? (
              <CircularProgress size={28} sx={{ color: "#fff" }} />
            ) : isGroup ? (
              <GroupsIcon sx={{ fontSize: 28 }} />
            ) : (
              <PhoneIcon sx={{ fontSize: 28 }} />
            )}
          </ActionBtn>
        </Actions>
      </ContentWrapper>
    </Overlay>
  );
}