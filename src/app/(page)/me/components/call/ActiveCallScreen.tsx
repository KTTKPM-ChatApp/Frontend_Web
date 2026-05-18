"use client";

import { useEffect, useRef, useMemo } from "react";
import { Box, Typography, IconButton, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { useCallStore } from "@/src/common/store/useCallStore";
import { useChatStore } from "@/src/common/store/useChatStore";
import { endCall, leaveCall } from "@/src/common/service/call-service";
import AppAvatar from "@/src/shared/component/Avatar";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { getcurrentUserId } from "@/src/common/utilities/utils";
import type { ConversationDto } from "@/src/common/interface/chat-interface";

const Container = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: "#1a1a2e",
  position: "relative",
});

const VideoGrid = styled(Grid)({
  flex: 1,
  padding: "16px 16px 112px",
  overflow: "auto",
  minHeight: 0,
});

const VideoTile = styled(Box)({
  position: "relative",
  width: "100%",
  aspectRatio: "16/9",
  background: "#2d2d44",
  borderRadius: 12,
  overflow: "hidden",
});

const VideoElement = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const LocalVideo = styled("video")({
  position: "absolute",
  bottom: 100,
  right: 16,
  width: 160,
  height: 120,
  borderRadius: 12,
  objectFit: "cover",
  zIndex: 10,
  border: "2px solid rgba(255,255,255,0.3)",
  transform: "scaleX(-1)",
});

const Controls = styled(Box)({
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 30,
  display: "flex",
  justifyContent: "center",
  gap: 24,
  padding: "20px 0",
  background: "rgba(0,0,0,0.5)",
});

const ControlButton = styled(IconButton)({
  width: 56,
  height: 56,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.2)",
  color: "#fff",
  "&:hover": { background: "rgba(255,255,255,0.3)" },
});

const EndButton = styled(IconButton)({
  width: 56,
  height: 56,
  borderRadius: "50%",
  background: "#ef4444",
  color: "#fff",
  "&:hover": { background: "#dc2626" },
});

const UserLabel = styled(Typography)({
  position: "absolute",
  bottom: 8,
  left: 8,
  color: "#fff",
  fontSize: 14,
  fontWeight: 500,
  background: "rgba(0,0,0,0.5)",
  padding: "4px 8px",
  borderRadius: 4,
});

const Timer = styled(Typography)({
  position: "absolute",
  top: 16,
  left: "50%",
  transform: "translateX(-50%)",
  color: "#fff",
  fontSize: 16,
  fontWeight: 500,
  background: "rgba(0,0,0,0.5)",
  padding: "4px 12px",
  borderRadius: 16,
});

function playElement(
  element: HTMLMediaElement | null,
  label: string
): void {
  if (!element) return;

  const playPromise = element.play();
  if (playPromise) {
    playPromise.catch((err) => {
      const message = err instanceof Error ? err.message : String(err);
      const isExpectedInterruption =
        err instanceof DOMException &&
        err.name === "AbortError" &&
        (message.includes("pause") || message.includes("new load request"));

      if (isExpectedInterruption) return;

      console.warn(`[ActiveCallScreen] ${label} play blocked:`, message);
    });
  }
}

function RemoteAudio({
  stream,
  userId,
}: {
  stream: MediaStream;
  userId: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAudio = stream.getAudioTracks().length > 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.srcObject = stream;
    audio.muted = false;
    audio.volume = 1;
    playElement(audio, `remote audio ${userId}`);

    const handleCanPlay = () => playElement(audio, `remote audio ${userId}`);
    const handleTrackUnmute = () => playElement(audio, `remote audio ${userId}`);
    const audioTracks = stream.getAudioTracks();

    audio.addEventListener("loadedmetadata", handleCanPlay);
    audio.addEventListener("canplay", handleCanPlay);
    audioTracks.forEach((track) => {
      track.addEventListener("unmute", handleTrackUnmute);
      if (!track.muted) {
        handleTrackUnmute();
      }
    });

    return () => {
      audio.removeEventListener("loadedmetadata", handleCanPlay);
      audio.removeEventListener("canplay", handleCanPlay);
      audioTracks.forEach((track) => {
        track.removeEventListener("unmute", handleTrackUnmute);
      });
      audio.pause();
      audio.srcObject = null;
    };
  }, [stream, userId]);

  if (!hasAudio) return null;

  return <audio ref={audioRef} autoPlay playsInline />;
}

function RemoteVideo({
  stream,
  userId,
  group,
}: {
  stream: MediaStream;
  userId: string;
  group?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = stream.getVideoTracks().length > 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    video.muted = true;
    playElement(video, `remote video ${userId}`);

    const handleCanPlay = () => playElement(video, `remote video ${userId}`);
    const handleTrackUnmute = () => playElement(video, `remote video ${userId}`);
    const videoTracks = stream.getVideoTracks();

    video.addEventListener("loadedmetadata", handleCanPlay);
    video.addEventListener("canplay", handleCanPlay);
    videoTracks.forEach((track) => {
      track.addEventListener("unmute", handleTrackUnmute);
      if (!track.muted) {
        handleTrackUnmute();
      }
    });

    return () => {
      video.removeEventListener("loadedmetadata", handleCanPlay);
      video.removeEventListener("canplay", handleCanPlay);
      videoTracks.forEach((track) => {
        track.removeEventListener("unmute", handleTrackUnmute);
      });
      video.pause();
      video.srcObject = null;
    };
  }, [stream, userId]);

  if (!hasVideo) return null;

  return (
    <VideoElement
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={group ? undefined : { width: "100%", height: "100%" }}
    />
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Helper function to get user display name
function getUserDisplayName(userId: string, members: ConversationDto["members"]): string {
  const member = members?.find((m) => m.userId === userId);
  return member?.nickname || member?.fullName || userId.slice(0, 8);
}

// Helper function to get conversation display name
function getConversationDisplayName(conversation: ConversationDto | null, members: ConversationDto["members"], currentUserId: string): string {
  if (!conversation) return "";
  
  const isGroup = conversation.type === "group";
  if (isGroup) {
    return conversation.name ?? "";
  }
  
  const otherMember = members?.find((m) => m.userId !== currentUserId);
  return otherMember?.nickname || otherMember?.fullName || conversation.name || "";
}

export default function ActiveCallScreen() {
  const t = useTrans();
  const localStream = useCallStore((s) => s.localStream);
  const remoteStreams = useCallStore((s) => s.remoteStreams);
  const activeCall = useCallStore((s) => s.activeCall);
  const isMuted = useCallStore((s) => s.isMuted);
  const isCameraOff = useCallStore((s) => s.isCameraOff);
  const callDuration = useCallStore((s) => s.callDuration);
  const setMuted = useCallStore((s) => s.setMuted);
  const setCameraOff = useCallStore((s) => s.setCameraOff);

  // Get conversation and user data
  const listConversation = useChatStore((s) => s.listConversation);
  const conversationDetail = useChatStore(
    (s) => s.conversationDetailById?.[activeCall?.conversation_id || ""] ?? null
  );
  const currentUserId = getcurrentUserId() || "";
  
  const currentConversation =
    conversationDetail ?? listConversation.find((n) => n.id === activeCall?.conversation_id);
  const members = currentConversation?.members ?? [];

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const isGroup = activeCall?.conversation_type === "group";
  const isVideo = activeCall?.call_type === "video";
  
  const remoteEntries = useMemo(() => Array.from(remoteStreams.entries()), [remoteStreams]);
  const isConnecting = remoteEntries.length === 0;

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      playElement(localVideoRef.current, "local video");
    }
  }, [localStream]);

  useEffect(() => {
    // Remote streams updated
  }, [remoteStreams]);

  const handleEndCall = () => {
    if (isGroup && activeCall?.initiator_id !== currentUserId) {
      leaveCall();
    } else {
      endCall();
    }
  };

  return (
    <Container>
      {/* Call Header with Conversation Name */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            background: "rgba(0,0,0,0.5)",
            padding: "8px 16px",
            borderRadius: 20,
            textAlign: "center",
          }}
        >
          {getConversationDisplayName(currentConversation, members, currentUserId) || t("CALL.CALLING")}
        </Typography>
      </Box>

      <Timer>{formatDuration(callDuration)}</Timer>

      {isVideo && localStream && (
        <LocalVideo ref={localVideoRef} autoPlay muted playsInline />
      )}

      {isConnecting ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 2,
            pb: "112px",
          }}
        >
          <Typography sx={{ color: "#fff", fontSize: 18 }}>
            {t("CALL.CONNECTING")}
          </Typography>
        </Box>
      ) : isGroup ? (
        <VideoGrid container spacing={2}>
          {remoteEntries.map(([userId, stream]) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={userId}>
              <VideoTile>
                <RemoteAudio stream={stream} userId={userId} />
                {isVideo ? (
                  <RemoteVideo stream={stream} userId={userId} group />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AppAvatar name={getUserDisplayName(userId, members)} size={80} fontSize={32} />
                  </Box>
                )}
                <UserLabel>{getUserDisplayName(userId, members)}</UserLabel>
              </VideoTile>
            </Grid>
          ))}
        </VideoGrid>
      ) : (
        <Box
          sx={{
            flex: 1,
            position: "relative",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {remoteEntries.map(([userId, stream]) => (
            <Box
              key={userId}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pb: "112px",
                boxSizing: "border-box",
              }}
            >
              <RemoteAudio stream={stream} userId={userId} />
              {isVideo ? (
                <RemoteVideo stream={stream} userId={userId} />
              ) : (
                <Box sx={{ textAlign: "center" }}>
                  <AppAvatar name={getUserDisplayName(userId, members)} size={150} fontSize={60} />
                  <Typography sx={{ color: "#fff", mt: 2, fontSize: 20 }}>
                    {getUserDisplayName(userId, members)}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Controls>
        <ControlButton onClick={() => setMuted(!isMuted)}>
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </ControlButton>

        {isVideo && (
          <ControlButton onClick={() => setCameraOff(!isCameraOff)}>
            {isCameraOff ? <VideocamOffIcon /> : <VideocamIcon />}
          </ControlButton>
        )}

        <EndButton onClick={handleEndCall}>
          <CallEndIcon />
        </EndButton>
      </Controls>
    </Container>
  );
}
