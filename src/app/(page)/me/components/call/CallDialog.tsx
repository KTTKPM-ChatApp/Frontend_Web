"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import PhoneIcon from "@mui/icons-material/Phone";
import MinimizeIcon from "@mui/icons-material/Minimize";
import { useCallStore, SfuPeerStream } from "@/src/common/store/useCallStore";
import { endCall, endGroupCall, answerCall, rejectCall } from "@/src/common/action/call.action";
import { useTrans } from "@/src/common/utilities/hook/trans";

const Overlay = styled(Box)({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.85)",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

const VideoContainer = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 8,
  padding: 16,
});

const RemoteVideo = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  backgroundColor: "#1a1a1a",
});

const LocalVideo = styled("video")({
  position: "absolute",
  bottom: 100,
  right: 24,
  width: 160,
  height: 120,
  borderRadius: 12,
  objectFit: "cover",
  border: "2px solid rgba(255,255,255,0.3)",
  backgroundColor: "#000",
  transform: "scaleX(-1)",
});

const Controls = styled(Box)({
  position: "absolute",
  bottom: 40,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  gap: 16,
  backgroundColor: "rgba(0,0,0,0.5)",
  padding: "8px 24px",
  borderRadius: 40,
  backdropFilter: "blur(8px)",
});

const ControlBtn = styled(IconButton)({
  width: 48,
  height: 48,
  color: "#fff",
  backgroundColor: "rgba(255,255,255,0.15)",
  "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
});

const EndCallBtn = styled(IconButton)({
  width: 48,
  height: 48,
  color: "#fff",
  backgroundColor: "#E53935",
  "&:hover": { backgroundColor: "#C62828" },
});

const MinimizedBar = styled(Box)({
  position: "fixed",
  bottom: 16,
  right: 16,
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  gap: 8,
  backgroundColor: "#1a1a1a",
  color: "#fff",
  padding: "8px 16px",
  borderRadius: 24,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
});

const CallAvatar = styled(Box)({
  width: 120,
  height: 120,
  borderRadius: "50%",
  backgroundColor: "#005AE0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 48,
  fontWeight: 700,
  marginBottom: 24,
});

const PeerTile = styled(Box)({
  position: "relative",
  flex: "1 1 30%",
  minWidth: 200,
  minHeight: 200,
  backgroundColor: "#2a2a2a",
  borderRadius: 12,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const PeerVideo = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const PeerAvatar = styled(Box)({
  width: 64,
  height: 64,
  borderRadius: "50%",
  backgroundColor: "#005AE0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 28,
  fontWeight: 600,
});

const PeerName = styled(Typography)({
  position: "absolute",
  bottom: 8,
  left: 8,
  color: "#fff",
  fontSize: 12,
  backgroundColor: "rgba(0,0,0,0.5)",
  padding: "2px 8px",
  borderRadius: 8,
});

export default function CallDialog() {
  const t = useTrans();
  const {
    status,
    type,
    localStream,
    remoteStream,
    minimized,
    conversationId,
    callId,
    callerName,
    peerStreams,
    sfuRoomId,
    sessionId,
    callStartTime,
  } = useCallStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (status !== "connected") {
      setElapsed("");
      return;
    }
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
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    peerStreams.forEach((peer) => {
      const el = peerVideoRefs.current.get(peer.peerId);
      if (el) {
        const stream = peer.video || peer.audio;
        if (stream) el.srcObject = stream;
      }
    });
  }, [peerStreams]);

  const handleEndCall = useCallback(() => {
    if (type === "GROUP" && conversationId && sessionId) {
      endGroupCall(conversationId, sessionId);
    } else {
      endCall();
    }
  }, [type, conversationId, sessionId]);

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

  const handleMinimize = useCallback(() => {
    useCallStore.getState().setMinimized(true);
  }, []);

  if (minimized) {
    return (
      <MinimizedBar onClick={() => useCallStore.getState().setMinimized(false)}>
        <PhoneIcon sx={{ fontSize: 18, color: "#22C55E" }} />
        <Typography sx={{ fontSize: 13 }}>
          {type === "GROUP"
            ? t("CHAT.CALL_GROUP")
            : type === "VIDEO"
              ? t("CHAT.CALL_VIDEO")
              : t("CHAT.CALL_AUDIO")}
        </Typography>
      </MinimizedBar>
    );
  }

  if (status === "ringing") {
    return (
      <Overlay>
        <CallAvatar>{(callerName || "?")[0]}</CallAvatar>
        <Typography sx={{ color: "#fff", fontSize: 24, fontWeight: 600, mb: 1 }}>
          {callerName || ""}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 14, mb: 4 }}>
          {type === "GROUP" ? t("CHAT.CALL_GROUP_INCOMING") : t("CHAT.CALLING")}
        </Typography>
        <Controls>
          <EndCallBtn onClick={() => {
            if (conversationId && callId) rejectCall(conversationId, callId);
          }}>
            <CallEndIcon />
          </EndCallBtn>
          {(type === "VIDEO" || type === "GROUP") ? (
            <ControlBtn
              onClick={() => {
                if (conversationId && callId) answerCall(conversationId, callId);
              }}
              sx={{ backgroundColor: "#22C55E", "&:hover": { backgroundColor: "#16A34A" } }}
            >
              <VideocamIcon />
            </ControlBtn>
          ) : (
            <ControlBtn
              onClick={() => {
                if (conversationId && callId) answerCall(conversationId, callId);
              }}
              sx={{ backgroundColor: "#22C55E", "&:hover": { backgroundColor: "#16A34A" } }}
            >
              <PhoneIcon />
            </ControlBtn>
          )}
        </Controls>
      </Overlay>
    );
  }

  if (status === "connecting") {
    return (
      <Overlay>
        <CallAvatar>{(callerName || "?")[0]}</CallAvatar>
        <Typography sx={{ color: "#fff", fontSize: 24, fontWeight: 600, mb: 1 }}>
          {callerName || ""}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 14, mb: 4 }}>
          {t("CHAT.CONNECTING")}
        </Typography>
        <Controls>
          <EndCallBtn onClick={handleEndCall}>
            <CallEndIcon />
          </EndCallBtn>
        </Controls>
      </Overlay>
    );
  }

  if (status === "reconnecting") {
    return (
      <Overlay>
        <CallAvatar>{(callerName || "?")[0]}</CallAvatar>
        <Typography sx={{ color: "#fff", fontSize: 24, fontWeight: 600, mb: 1 }}>
          {callerName || ""}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
          <CircularProgress size={16} sx={{ color: "#FFA000" }} />
          <Typography sx={{ color: "#FFA000", fontSize: 14 }}>
            {t("CHAT.RECONNECTING")}
          </Typography>
        </Box>
        <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 14, mb: 4 }}>
          {elapsed}
        </Typography>
        <Controls>
          <EndCallBtn onClick={handleEndCall}>
            <CallEndIcon />
          </EndCallBtn>
        </Controls>
      </Overlay>
    );
  }

  if (status === "connected") {
    if (type === "GROUP") {
      return (
        <Overlay>
          <VideoContainer>
            {peerStreams.map((peer) => (
              <PeerTile key={peer.peerId}>
                {peer.video ? (
                  <PeerVideo
                    ref={(el) => { if (el) peerVideoRefs.current.set(peer.peerId, el); }}
                    autoPlay playsInline
                  />
                ) : (
                  <PeerAvatar>{peer.displayName[0]}</PeerAvatar>
                )}
                <PeerName>
                  {peer.displayName}
                  {peer.audioMuted && <MicOffIcon sx={{ fontSize: 12, ml: 0.5 }} />}
                </PeerName>
              </PeerTile>
            ))}
            <PeerTile>
              <LocalVideo
                ref={localVideoRef}
                autoPlay playsInline muted
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)",
                  position: "static",
                  border: "none",
                  borderRadius: 0,
                }}
              />
              <PeerName>{t("CHAT.YOU")}</PeerName>
            </PeerTile>
          </VideoContainer>
          <Controls>
            <ControlBtn onClick={handleToggleAudio}>
              {audioMuted ? <MicOffIcon /> : <MicIcon />}
            </ControlBtn>
            <EndCallBtn onClick={handleEndCall}>
              <CallEndIcon />
            </EndCallBtn>
            <ControlBtn onClick={handleToggleVideo}>
              {videoMuted ? <VideocamOffIcon /> : <VideocamIcon />}
            </ControlBtn>
            <ControlBtn onClick={handleMinimize}>
              <MinimizeIcon />
            </ControlBtn>
          </Controls>
        </Overlay>
      );
    }

    if (type === "VIDEO") {
      return (
        <Overlay>
          <VideoContainer>
            <RemoteVideo ref={remoteVideoRef} autoPlay playsInline />
            <LocalVideo ref={localVideoRef} autoPlay playsInline muted />
          </VideoContainer>
          <Controls>
            <ControlBtn onClick={handleToggleAudio}>
              {audioMuted ? <MicOffIcon /> : <MicIcon />}
            </ControlBtn>
            <EndCallBtn onClick={handleEndCall}>
              <CallEndIcon />
            </EndCallBtn>
            <ControlBtn onClick={handleToggleVideo}>
              {videoMuted ? <VideocamOffIcon /> : <VideocamIcon />}
            </ControlBtn>
            <ControlBtn onClick={handleMinimize}>
              <MinimizeIcon />
            </ControlBtn>
          </Controls>
        </Overlay>
      );
    }

    return (
      <Overlay>
        <CallAvatar>{(callerName || "?")[0]}</CallAvatar>
        <Typography sx={{ color: "#fff", fontSize: 24, fontWeight: 600, mb: 1 }}>
          {callerName || t("CHAT.CALL_AUDIO")}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 14, mb: 4 }}>
          {elapsed || t("CHAT.IN_CALL")}
        </Typography>
        <Controls>
          <ControlBtn onClick={handleToggleAudio}>
            {audioMuted ? <MicOffIcon /> : <MicIcon />}
          </ControlBtn>
          <EndCallBtn onClick={handleEndCall}>
            <CallEndIcon />
          </EndCallBtn>
          <ControlBtn onClick={handleMinimize}>
            <MinimizeIcon />
          </ControlBtn>
        </Controls>
      </Overlay>
    );
  }

  return null;
}
