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
import FlipCameraIosIcon from "@mui/icons-material/FlipCameraIos";
import { useCallStore, SfuPeerStream } from "@/src/common/store/useCallStore";
import { endGroupCall } from "@/src/common/action/call.action";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { userService } from "@/src/common/service/user-service";
import { resolveMediaUrl } from "@/src/common/helpers/displayMedia.helpers";
import AppAvatar from "@/src/shared/component/Avatar";

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
  paddingTop: "env(safe-area-inset-top, 0px)",
  paddingBottom: "env(safe-area-inset-bottom, 0px)",
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
  "@media (max-width: 767px)": {
    gap: 8,
    padding: 8,
  },
});

const PeerTile = styled(Box)<{ $count?: number }>(({ $count = 2 }) => {
  const cols = $count <= 1 ? 1 : $count <= 4 ? 2 : 3;
  const pct = `${100 / cols}%`;
  return {
    position: "relative",
    flex: `1 1 calc(${pct} - 12px)`,
    maxWidth: `calc(${pct} - 12px)`,
    aspectRatio: cols === 1 ? "16/9" : "1",
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: cols === 1 ? 240 : 180,
    transition: "all 0.2s ease",
    "@media (max-width: 767px)": {
      minHeight: cols === 1 ? 160 : 120,
      flex: `1 1 calc(${pct} - 8px)`,
      maxWidth: `calc(${pct} - 8px)`,
      borderRadius: 12,
    },
  };
});

const PeerVideo = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const PeerAvatarWrap = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
  "@media (max-width: 767px)": {
    gap: 12,
    padding: "8px 16px",
    bottom: 32,
  },
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
  "@media (max-width: 767px)": {
    width: 44,
    height: 44,
  },
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
  "@media (max-width: 767px)": {
    width: 48,
    height: 48,
  },
});

const MiniAvatar = styled(Box)({
  flexShrink: 0,
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
  padding: "6px 16px 6px 6px",
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
  const [controlsVisible, setControlsVisible] = useState(true);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY = useRef<number>(0);
  const wakeLockRef = useRef<any>(null);

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
    if (status !== "connected" && status !== "reconnecting") return;
    setControlsVisible(true);
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    autoHideRef.current = setTimeout(() => setControlsVisible(false), 5000);
    return () => { if (autoHideRef.current) clearTimeout(autoHideRef.current); };
  }, [status]);

  useEffect(() => {
    if (status !== "connected" && status !== "ringing" && status !== "connecting" && status !== "reconnecting") {
      if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; }
      return;
    }
    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then((wl) => { wakeLockRef.current = wl; }).catch(() => {});
    }
    return () => { if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; } };
  }, [status]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    if (status === "connected" || status === "reconnecting") {
      autoHideRef.current = setTimeout(() => setControlsVisible(false), 5000);
    }
  }, [status]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 80) {
      useCallStore.getState().setMinimized(true);
    }
  }, []);

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

  useEffect(() => {
    peerStreams.forEach((peer) => {
      if (peer.avatarUrl || !peer.userId) return;
      userService.getUserById(peer.userId).then((res) => {
        if (res?.ok) {
          const user = (res.payload as any)?.data ?? res.payload;
          if (user?.avatarUrl) {
            useCallStore.getState().updatePeerStream(peer.peerId, { avatarUrl: user.avatarUrl });
          }
        }
      }).catch(() => {});
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

  const handleSwitchCamera = useCallback(async () => {
    if (!localStream) return;
    const newFacing = cameraFacingMode === "user" ? "environment" : "user";
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: newFacing, width: { ideal: 360, max: 720 }, height: { ideal: 480, max: 1280 }, frameRate: { ideal: 24, max: 30 } },
      });
      const newTrack = newStream.getVideoTracks()[0];
      const oldTracks = localStream.getVideoTracks();
      oldTracks.forEach((t) => { localStream.removeTrack(t); t.stop(); });
      localStream.addTrack(newTrack);
      useCallStore.getState().setLocalStream(localStream);
      setCameraFacingMode(newFacing);
    } catch (err) {
      console.warn("[SwitchCamera] failed:", err);
    }
  }, [localStream, cameraFacingMode]);

  const handleMinimize = useCallback(() => {
    useCallStore.getState().setMinimized(true);
  }, []);

  if (minimized) {
    return (
      <MinimizedBar onClick={() => useCallStore.getState().setMinimized(false)}>
        <MiniAvatar><AppAvatar src={resolveMediaUrl(peerStreams[0]?.avatarUrl)} name={peerStreams[0]?.displayName || "Group"} size={32} /></MiniAvatar>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{t("CHAT.CALL_GROUP")}</Typography>
        {elapsed && <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{elapsed}</Typography>}
      </MinimizedBar>
    );
  }

  const { isSpeaking } = useCallStore();
  const totalParticipants = peerStreams.length + 1;

  if (status === "ringing" || status === "connecting") {
    return (
      <Overlay>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 3 }}>
          <AppAvatar name={t("CHAT.CALL_GROUP")} isGroup size={96} sx={{ width: { xs: 72, md: 96 }, height: { xs: 72, md: 96 }, fontSize: { xs: 30, md: 40 }, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} />
          <Typography sx={{ color: "#fff", fontSize: { xs: 20, md: 26 }, fontWeight: 600, textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            {t("CHAT.CALL_GROUP")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CircularProgress size={14} sx={{ color: "rgba(255,255,255,0.7)" }} />
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>
              {status === "connecting" ? t("CHAT.CONNECTING") : "Đang kết nối..."}
            </Typography>
          </Box>
        </Box>
        <Controls sx={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)" }}>
          <EndCallBtn onClick={handleEndCall} disabled={isEnding}>
            {isEnding ? <CircularProgress size={26} sx={{ color: "#fff" }} /> : <CallEndIcon />}
          </EndCallBtn>
        </Controls>
      </Overlay>
    );
  }

  if (status === "reconnecting") {
    return (
      <Overlay>
        <GroupGrid>
          {peerStreams.map((peer) => (
            <PeerTile key={peer.peerId} $count={totalParticipants}>
              {peer.video ? (
                <PeerVideo
                  ref={(el) => { if (el) peerVideoRefs.current.set(peer.peerId, el); }}
                  autoPlay playsInline
                />
              ) : (
                <PeerAvatarWrap>
                  <AppAvatar src={resolveMediaUrl(peer.avatarUrl)} name={peer.displayName} size={64} sx={{ width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 }, fontSize: { xs: 22, md: 28 }, boxShadow: "0 4px 12px rgba(0,90,224,0.3)" }} />
                </PeerAvatarWrap>
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
          <PeerTile $count={totalParticipants} sx={{ border: "2px solid rgba(255,255,255,0.1)" }}>
            <LocalVideo
              ref={localVideoRef}
              autoPlay playsInline muted
            />
            <PeerNamelabel>{t("CHAT.YOU")}</PeerNamelabel>
          </PeerTile>
        </GroupGrid>
        <Box sx={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", alignItems: "center", gap: 1, backgroundColor: "rgba(255,160,0,0.2)", padding: "8px 16px", borderRadius: 20 }}>
          <CircularProgress size={12} sx={{ color: "#FFA000" }} />
          <Typography sx={{ color: "#FFA000", fontSize: 13, fontWeight: 600 }}>{t("CHAT.RECONNECTING")}</Typography>
        </Box>
        <Controls sx={{ opacity: controlsVisible ? 1 : 0, transition: "opacity 0.3s", pointerEvents: controlsVisible ? "auto" : "none" }}>
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
          <ControlBtn onClick={handleSwitchCamera}>
            <FlipCameraIosIcon />
          </ControlBtn>
          <ControlBtn onClick={handleMinimize}>
            <MinimizeIcon />
          </ControlBtn>
        </Controls>
      </Overlay>
    );
  }

  if (status !== "connected") return null;

  return (
    <Overlay onClick={showControls} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <TopInfo sx={{ opacity: controlsVisible ? 1 : 0, transition: "opacity 0.3s" }}>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 }}>
          {totalParticipants} participants
        </Typography>
        {elapsed && (
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>· {elapsed}</Typography>
        )}
      </TopInfo>
      <GroupGrid>
        {peerStreams.map((peer) => (
          <PeerTile key={peer.peerId} $count={totalParticipants}>
            {peer.video ? (
              <PeerVideo
                ref={(el) => { if (el) peerVideoRefs.current.set(peer.peerId, el); }}
                autoPlay playsInline
              />
            ) : (
              <PeerAvatarWrap>
                <AppAvatar src={resolveMediaUrl(peer.avatarUrl)} name={peer.displayName} size={64} sx={{ width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 }, fontSize: { xs: 22, md: 28 }, boxShadow: "0 4px 12px rgba(0,90,224,0.3)" }} />
              </PeerAvatarWrap>
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
        <PeerTile $count={totalParticipants} sx={{ border: isSpeaking ? "2px solid #005AE0" : "2px solid rgba(255,255,255,0.1)", animation: isSpeaking ? `${speakingGlow} 1.5s ease-in-out infinite` : "none" }}>
          <LocalVideo
            ref={localVideoRef}
            autoPlay playsInline muted
          />
          <PeerNamelabel>{t("CHAT.YOU")}</PeerNamelabel>
        </PeerTile>
      </GroupGrid>
      <Controls sx={{ opacity: controlsVisible ? 1 : 0, transition: "opacity 0.3s", pointerEvents: controlsVisible ? "auto" : "none" }}>
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
        <ControlBtn onClick={handleSwitchCamera}>
          <FlipCameraIosIcon />
        </ControlBtn>
        <ControlBtn onClick={handleMinimize}>
          <MinimizeIcon />
        </ControlBtn>
      </Controls>
    </Overlay>
  );
}
