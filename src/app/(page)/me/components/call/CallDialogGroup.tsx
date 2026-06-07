"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, IconButton, Typography, CircularProgress, keyframes } from "@mui/material";
import { styled } from "@mui/material/styles";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MinimizeIcon from "@mui/icons-material/Minimize";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import { useCallStore, SfuPeerStream } from "@/src/common/store/useCallStore";
import { endGroupCall } from "@/src/common/action/call.action";
import { useTrans } from "@/src/common/utilities/hook/trans";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const speakingGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,90,224,0.4); }
  50% { box-shadow: 0 0 0 6px rgba(0,90,224,0); }
`;

const Overlay = styled(Box)({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#0d0d0d",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  animation: `${fadeIn} 0.3s ease-out`,
});

const TopInfo = styled(Box)({
  position: "absolute",
  top: 12,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  gap: 8,
  zIndex: 10,
});

const GroupGrid = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  padding: 16,
  width: "100%",
  height: "100%",
  overflowY: "auto",
});

const PeerTile = styled(Box)({
  position: "relative",
  flex: "1 1 calc(50% - 12px)",
  maxWidth: "calc(50% - 12px)",
  aspectRatio: "1",
  backgroundColor: "#1a1a2e",
  borderRadius: 16,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 180,
  transition: "all 0.2s ease",
});

const PeerVideo = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const PeerAvatarCircle = styled(Box)({
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
  boxShadow: "0 4px 12px rgba(0,90,224,0.3)",
});

const PeerNamelabel = styled(Typography)({
  position: "absolute",
  bottom: 8,
  left: 8,
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
  backgroundColor: "rgba(0,0,0,0.6)",
  padding: "4px 10px",
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  gap: 4,
});

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

const LocalVideo = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transform: "scaleX(-1)",
});

export default function CallDialogGroup() {
  const t = useTrans();
  const {
    status, localStream, minimized,
    conversationId, sessionId,
    peerStreams, callStartTime, isEnding,
  } = useCallStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const peerVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
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
    peerStreams.forEach((peer) => {
      const videoEl = peerVideoRefs.current.get(peer.peerId);
      if (videoEl) {
        const stream = peer.video || peer.audio;
        if (stream) videoEl.srcObject = stream;
      }
      const audioEl = peerAudioRefs.current.get(peer.peerId);
      if (audioEl && peer.audio) {
        audioEl.srcObject = peer.audio;
        audioEl.play().catch(console.warn);
      }
    });
  }, [peerStreams]);

  const handleEndCall = useCallback(() => {
    if (conversationId && sessionId)
      endGroupCall(conversationId, sessionId);
  }, [conversationId, sessionId]);

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
      const audioEls = Array.from(peerAudioRefs.current.values());
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
        <Typography sx={{ fontSize: 13 }}>{t("CHAT.CALL_GROUP")}</Typography>
        {elapsed && <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{elapsed}</Typography>}
      </MinimizedBar>
    );
  }

  if (status !== "connected") return null;

  return (
    <Overlay>
      <TopInfo>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 }}>
          {peerStreams.length + 1} participants
        </Typography>
        {elapsed && (
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>· {elapsed}</Typography>
        )}
      </TopInfo>
      <GroupGrid>
        {peerStreams.map((peer) => (
          <PeerTile key={peer.peerId}>
            {peer.video ? (
              <PeerVideo
                ref={(el) => { if (el) peerVideoRefs.current.set(peer.peerId, el); }}
                autoPlay playsInline
              />
            ) : (
              <PeerAvatarCircle>
                {peer.displayName[0].toUpperCase()}
              </PeerAvatarCircle>
            )}
            <audio
              ref={(el) => { if (el) peerAudioRefs.current.set(peer.peerId, el); }}
              autoPlay playsInline
            />
            <PeerNamelabel>
              {peer.displayName}
              {peer.audioMuted && <MicOffIcon sx={{ fontSize: 11, opacity: 0.7 }} />}
            </PeerNamelabel>
          </PeerTile>
        ))}
        <PeerTile sx={{ border: "2px solid rgba(255,255,255,0.1)" }}>
          <LocalVideo
            ref={localVideoRef}
            autoPlay playsInline muted
          />
          <PeerNamelabel>{t("CHAT.YOU")}</PeerNamelabel>
        </PeerTile>
      </GroupGrid>
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
