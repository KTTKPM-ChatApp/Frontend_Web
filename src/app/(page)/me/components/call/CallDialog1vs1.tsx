"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, IconButton, Typography, CircularProgress, keyframes } from "@mui/material";
import { styled } from "@mui/material/styles";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import PhoneIcon from "@mui/icons-material/Phone";
import MinimizeIcon from "@mui/icons-material/Minimize";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import { useCallStore } from "@/src/common/store/useCallStore";
import { endCall, answerCall, rejectCall } from "@/src/common/action/call.action";
import { useTrans } from "@/src/common/utilities/hook/trans";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.04); opacity: 0.4; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const wave = keyframes`
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
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  animation: `${fadeIn} 0.3s ease-out`,
});

const AudioOverlay = styled(Overlay)({
  background: "linear-gradient(135deg, #005AE0 0%, #0068FF 50%, #0077FF 100%)",
});

const VideoOverlay = styled(Overlay)({
  backgroundColor: "#000",
});

const TopInfo = styled(Box)({
  position: "absolute",
  top: 48,
  left: 0,
  right: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  zIndex: 10,
});

const AvatarContainer = styled(Box)({
  position: "relative",
  marginBottom: 16,
});

const PulseRingOuter = styled(Box)({
  position: "absolute",
  top: -20,
  left: -20,
  right: -20,
  bottom: -20,
  borderRadius: "50%",
  border: "3px solid rgba(255,255,255,0.3)",
  animation: `${pulse} 2s ease-in-out infinite`,
});

const PulseRingInner = styled(Box)({
  position: "absolute",
  top: -10,
  left: -10,
  right: -10,
  bottom: -10,
  borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.15)",
  animation: `${pulse} 2s ease-in-out infinite 0.3s`,
});

const AvatarCircle = styled(Box)({
  width: 96,
  height: 96,
  borderRadius: "50%",
  backgroundColor: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#005AE0",
  fontSize: 40,
  fontWeight: 700,
  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  position: "relative",
  zIndex: 1,
  animation: `${float} 3s ease-in-out infinite`,
});

const WaveContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 3,
  height: 20,
  marginTop: 8,
});

const WaveBar = styled(Box)<{ delay: number }>(({ delay }) => ({
  width: 3,
  height: "100%",
  backgroundColor: "rgba(255,255,255,0.6)",
  borderRadius: 3,
  animation: `${wave} 0.8s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const Controls = styled(Box)({
  position: "absolute",
  bottom: 48,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  gap: 20,
  backgroundColor: "rgba(0,0,0,0.4)",
  padding: "10px 28px",
  borderRadius: 40,
  backdropFilter: "blur(12px)",
  zIndex: 10,
});

const ControlBtn = styled(IconButton)({
  width: 50,
  height: 50,
  color: "#fff",
  backgroundColor: "rgba(255,255,255,0.2)",
  backdropFilter: "blur(4px)",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.35)",
    transform: "scale(1.05)",
  },
  "&:active": { transform: "scale(0.95)" },
});

const EndCallBtn = styled(IconButton)({
  width: 56,
  height: 56,
  color: "#fff",
  backgroundColor: "#EF4444",
  boxShadow: "0 4px 16px rgba(239,68,68,0.4)",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#DC2626",
    transform: "scale(1.05)",
    boxShadow: "0 6px 24px rgba(239,68,68,0.5)",
  },
  "&:active": { transform: "scale(0.95)" },
});

const VideoContainer = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const RemoteVideo = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  backgroundColor: "#000",
});

const LocalVideo = styled("video")({
  position: "absolute",
  bottom: 120,
  right: 20,
  width: 140,
  height: 200,
  borderRadius: 16,
  objectFit: "cover",
  border: "2px solid rgba(255,255,255,0.3)",
  backgroundColor: "#000",
  transform: "scaleX(-1)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
  zIndex: 5,
});

const MinimizedBar = styled(Box)({
  position: "fixed",
  bottom: 20,
  right: 20,
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  gap: 10,
  backgroundColor: "#1a1a2e",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: 28,
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  transition: "all 0.2s ease",
  "&:hover": { transform: "scale(1.02)" },
});

export default function CallDialog1vs1() {
  const t = useTrans();
  const {
    status, type, localStream, remoteStream, minimized,
    conversationId, callId, callerName,
    callStartTime, isEnding, isRejecting,
  } = useCallStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (status !== "connected") { setElapsed(""); return; }
    const interval = setInterval(() => {
      if (callStartTime) {
        const diff = Math.floor((Date.now() - callStartTime) / 1000);
        const min = Math.floor(diff / 60);
        const sec = diff % 60;
        setElapsed(`${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status, callStartTime]);

  useEffect(() => {
    if (localVideoRef.current && localStream)
      localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream)
      remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(console.warn);
    }
  }, [remoteStream]);

  const handleEndCall = useCallback(() => {
    endCall();
  }, []);

  const handleToggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = audioMuted));
      setAudioMuted(!audioMuted);
    }
  }, [localStream, audioMuted]);

  const handleToggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = videoMuted));
      setVideoMuted(!videoMuted);
    }
  }, [localStream, videoMuted]);

  const handleToggleSpeaker = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
      const speakerDevice = audioOutputs.find(d =>
        d.label.toLowerCase().includes('speaker') ||
        d.label.toLowerCase().includes('loa') ||
        d.label.toLowerCase().includes('built-in')
      );
      const targetDeviceId = speakerOn ? 'default' : (speakerDevice?.deviceId || 'default');
      const audioEls = [remoteAudioRef.current];
      await Promise.all(audioEls.map(el => el?.setSinkId(targetDeviceId)));
      setSpeakerOn(!speakerOn);
    } catch (err) {
      console.warn('[Speaker] toggle failed:', err);
    }
  }, [speakerOn]);

  const handleMinimize = useCallback(() => {
    useCallStore.getState().setMinimized(true);
  }, []);

  if (minimized) {
    return (
      <MinimizedBar onClick={() => useCallStore.getState().setMinimized(false)}>
        <PhoneIcon sx={{ fontSize: 18, color: "#22C55E" }} />
        <Typography sx={{ fontSize: 13 }}>
          {type === "VIDEO" ? t("CHAT.CALL_VIDEO") : t("CHAT.CALL_AUDIO")}
        </Typography>
        {elapsed && <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{elapsed}</Typography>}
      </MinimizedBar>
    );
  }

  if (status === "ringing") {
    return (
      <AudioOverlay>
        <TopInfo sx={{ top: 80 }}>
          <AvatarContainer>
            <PulseRingOuter />
            <PulseRingInner />
            <AvatarCircle>{(callerName || "?")[0].toUpperCase()}</AvatarCircle>
          </AvatarContainer>
          <Typography sx={{ color: "#fff", fontSize: 26, fontWeight: 600, textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            {callerName || ""}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14, mt: 0.5 }}>
            {t("CHAT.CALL_AUDIO")}
          </Typography>
        </TopInfo>
        <Controls>
          <EndCallBtn disabled={isRejecting} onClick={() => {
            if (conversationId && callId) rejectCall(conversationId, callId);
          }}>
            {isRejecting ? <CircularProgress size={26} sx={{ color: "#fff" }} /> : <CallEndIcon />}
          </EndCallBtn>
          <ControlBtn
            onClick={() => { if (conversationId && callId) answerCall(conversationId, callId); }}
            sx={{ backgroundColor: "#22C55E", width: 56, height: 56, "&:hover": { backgroundColor: "#16A34A" } }}
          >
            {type === "VIDEO" ? <VideocamIcon /> : <PhoneIcon />}
          </ControlBtn>
        </Controls>
      </AudioOverlay>
    );
  }

  if (status === "connecting") {
    return (
      <AudioOverlay>
        <TopInfo sx={{ top: 80 }}>
          <AvatarContainer>
            <PulseRingOuter />
            <AvatarCircle>{(callerName || "?")[0].toUpperCase()}</AvatarCircle>
          </AvatarContainer>
          <Typography sx={{ color: "#fff", fontSize: 26, fontWeight: 600 }}>
            {callerName || ""}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14, mt: 0.5 }}>
            {t("CHAT.CONNECTING")}
          </Typography>
        </TopInfo>
        <Controls>
          <EndCallBtn onClick={handleEndCall} disabled={isEnding}>
            {isEnding ? <CircularProgress size={26} sx={{ color: "#fff" }} /> : <CallEndIcon />}
          </EndCallBtn>
        </Controls>
      </AudioOverlay>
    );
  }

  if (status === "reconnecting") {
    return (
      <AudioOverlay>
        <TopInfo sx={{ top: 80 }}>
          <AvatarContainer>
            <AvatarCircle>{(callerName || "?")[0].toUpperCase()}</AvatarCircle>
          </AvatarContainer>
          <Typography sx={{ color: "#fff", fontSize: 26, fontWeight: 600 }}>
            {callerName || ""}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <CircularProgress size={14} sx={{ color: "#FFA000" }} />
            <Typography sx={{ color: "#FFA000", fontSize: 14, fontWeight: 600 }}>
              {t("CHAT.RECONNECTING")}
            </Typography>
          </Box>
          {elapsed && (
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 13, mt: 1 }}>
              {elapsed}
            </Typography>
          )}
        </TopInfo>
        <Controls>
          <EndCallBtn onClick={handleEndCall} disabled={isEnding}>
            {isEnding ? <CircularProgress size={26} sx={{ color: "#fff" }} /> : <CallEndIcon />}
          </EndCallBtn>
        </Controls>
      </AudioOverlay>
    );
  }

  if (status === "connected" && type === "VIDEO") {
    return (
      <VideoOverlay>
        <TopInfo sx={{ top: 16, flexDirection: "row", justifyContent: "center", gap: 1 }}>
          <Typography sx={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
            {callerName || t("CHAT.CALL_VIDEO")}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>· {elapsed}</Typography>
        </TopInfo>
        <VideoContainer>
          <RemoteVideo ref={remoteVideoRef} autoPlay playsInline />
          <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
          <LocalVideo ref={localVideoRef} autoPlay playsInline muted />
        </VideoContainer>
        <Controls>
          <ControlBtn onClick={handleToggleAudio}>
            {audioMuted ? <MicOffIcon /> : <MicIcon />}
          </ControlBtn>
          <ControlBtn onClick={handleToggleSpeaker} sx={speakerOn ? { backgroundColor: "#22C55E", "&:hover": { backgroundColor: "#16A34A" } } : {}}>
            {speakerOn ? <VolumeUpIcon /> : <VolumeDownIcon />}
          </ControlBtn>
          <EndCallBtn onClick={handleEndCall} disabled={isEnding}>
            {isEnding ? <CircularProgress size={26} sx={{ color: "#fff" }} /> : <CallEndIcon />}
          </EndCallBtn>
          <ControlBtn onClick={handleMinimize}>
            <MinimizeIcon />
          </ControlBtn>
        </Controls>
      </VideoOverlay>
    );
  }

  if (status !== "connected") return null;

  return (
    <AudioOverlay>
      <TopInfo sx={{ top: 80 }}>
        <AvatarContainer>
          <PulseRingOuter />
          <PulseRingInner />
          <AvatarCircle>{(callerName || "?")[0].toUpperCase()}</AvatarCircle>
        </AvatarContainer>
        <Typography sx={{ color: "#fff", fontSize: 28, fontWeight: 600, textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          {callerName || t("CHAT.CALL_AUDIO")}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 15, mt: 0.5 }}>
          {elapsed || t("CHAT.IN_CALL")}
        </Typography>
        <WaveContainer>
          <WaveBar delay={0} />
          <WaveBar delay={0.15} />
          <WaveBar delay={0.3} />
          <WaveBar delay={0.45} />
          <WaveBar delay={0.6} />
        </WaveContainer>
      </TopInfo>
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
      <Controls>
        <ControlBtn onClick={handleToggleAudio}>
          {audioMuted ? <MicOffIcon /> : <MicIcon />}
        </ControlBtn>
        <ControlBtn onClick={handleToggleSpeaker} sx={speakerOn ? { backgroundColor: "#22C55E", "&:hover": { backgroundColor: "#16A34A" } } : {}}>
          {speakerOn ? <VolumeUpIcon /> : <VolumeDownIcon />}
        </ControlBtn>
        <EndCallBtn onClick={handleEndCall} disabled={isEnding}>
          {isEnding ? <CircularProgress size={26} sx={{ color: "#fff" }} /> : <CallEndIcon />}
        </EndCallBtn>
        <ControlBtn onClick={handleMinimize}>
          <MinimizeIcon />
        </ControlBtn>
      </Controls>
    </AudioOverlay>
  );
}
