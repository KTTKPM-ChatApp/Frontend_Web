import { v4 as uuidv4 } from "uuid";
import { getSocket, sendSocketMessage } from "../socket/socket";
import { getIceServers } from "./ice-server.service";
import { destroyAllPeers, destroyPeer, createPeer, hasPeer, feedSignal } from "./peer-manager";
import { useCallStore } from "../store/useCallStore";
import { getcurrentUserId } from "../utilities/utils";
import type {
  CallStateSnapshot,
  CallConversationType,
  CallSignalPayload,
  CallType,
  CallStatus,
  CallParticipantStatus,
} from "@/src/types/call";
import type SimplePeer from "simple-peer";
import { handleCallReconnect } from "./call-reconnect.service";
import i18n from "../i18n/i18n";

const ringtoneAudio: HTMLAudioElement | null = null;

interface CallStartedPayload {
  call_id: string;
  conversation_id: string;
  conversation_type?: CallConversationType;
  call_type: CallType;
  initiator_id: string;
  participant_ids: string[];
  started_at: number;
}

interface CallAcceptedPayload {
  call_id: string;
  conversation_id: string;
  user_id: string;
  accepted_at: number;
  participants: Record<string, CallParticipantStatus>;
  status: CallStatus;
  state_version: number;
}

interface CallLeftPayload {
  call_id: string;
  conversation_id: string;
  user_id: string;
  reason: string;
  left_at: number;
}

interface CallEndedPayload {
  call_id: string;
  conversation_id: string;
  user_id: string;
  reason: string;
  ended_at: number;
}

interface CallRejectedPayload {
  call_id: string;
  conversation_id: string;
  user_id: string;
  reason: string;
  rejected_at: number;
}

interface CallStateUpdatedPayload {
  conversation_id: string;
  state: CallStateSnapshot | null;
  requested_by?: string;
  updated_at: number;
  reason?: string;
  details: Record<string, unknown>;
}

interface WsErrorPayload {
  code?: string;
  details?: {
    retry_after?: number;
  };
}

type SimplePeerCandidateSignal = SimplePeer.SignalData & {
  type?: "candidate";
  candidate?: RTCIceCandidateInit | string;
};

function toBackendCandidate(signal: SimplePeer.SignalData): {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
} {
  const candidateSignal = signal as SimplePeerCandidateSignal;
  const rawCandidate = candidateSignal.candidate;

  if (!rawCandidate) return {};

  const candidateInit: RTCIceCandidateInit =
    typeof rawCandidate === "string"
      ? { candidate: rawCandidate }
      : rawCandidate;

  return {
    candidate: JSON.stringify(candidateInit),
    sdpMid: candidateInit.sdpMid,
    sdpMLineIndex: candidateInit.sdpMLineIndex,
  };
}

function fromBackendCandidate(payload: CallSignalPayload): SimplePeer.SignalData | null {
  if (!payload.candidate) return null;

  try {
    const candidateText = payload.candidate.trim();
    const parsedCandidate = candidateText.startsWith("{")
      ? (JSON.parse(candidateText) as RTCIceCandidateInit)
      : ({
          candidate: candidateText,
          sdpMid: payload.sdp_mid,
          sdpMLineIndex: payload.sdp_mline_index,
        } satisfies RTCIceCandidateInit);

    return {
      type: "candidate",
      candidate: parsedCandidate,
    } as SimplePeer.SignalData;
  } catch (error) {
    console.error("[call:signal:received] Failed to parse ICE candidate:", error);
    return null;
  }
}

function playRingtone(): void {
  if (typeof window === "undefined") return;
  // TODO: Add actual ringtone.mp3 file to public/sounds/
  // Temporarily disabled to avoid 404 error
  // if (!ringtoneAudio) {
  //   ringtoneAudio = new Audio("/sounds/ringtone.mp3");
  //   ringtoneAudio.loop = true;
  // }
  // ringtoneAudio.play().catch(() => {});
}

function stopRingtone(): void {
  if (ringtoneAudio) {
    ringtoneAudio.pause();
    ringtoneAudio.currentTime = 0;
  }
}

function showToast(message: string): void {
  // TODO: Implement proper toast notification
}

function showCallSummary(duration: number, reason?: string): void {
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const reasonText = reason ? ` · ${reason}` : "";
  showToast(i18n.t("CALL.CALL_ENDED_WITH_DURATION", { duration: timeStr, reason: reasonText }));
}

let isCleaningUp = false;
let cleanupPromise: Promise<void> | null = null;

export async function startCall(
  conversationId: string,
  conversationType: CallConversationType,
  callType: CallType,
  participantIds: string[]
): Promise<void> {
  const socket = getSocket();
  if (!socket) return;

  // Wait for any ongoing cleanup to complete
  if (isCleaningUp && cleanupPromise) {
    try {
      await cleanupPromise;
    } catch {
      // Cleanup failed, continue anyway
    }
  }

  // Double check after waiting
  if (isCleaningUp) {
    showToast(i18n.t("CALL.WAIT_PLEASE"));
    return;
  }

  let localStream: MediaStream | null = null;
  
  try {
    const callId = uuidv4();
    const currentUserId = getcurrentUserId() || "";
    
    // Add small delay to ensure previous cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === "video",
    });

    // Set call state first
    useCallStore.getState().setActiveCall({
      call_id: callId,
      conversation_id: conversationId,
      conversation_type: conversationType,
      call_type: callType,
      status: "ringing",
      initiator_id: currentUserId,
      participants: Object.fromEntries(
        [
          ...(currentUserId
            ? [[currentUserId, "accepted" as CallParticipantStatus]]
            : []),
          ...participantIds.map(
            (id) => [id, "invited" as CallParticipantStatus] as const
          ),
        ]
      ),
      started_at: Date.now(),
    });
    
    // Then set stream (if this fails, stream cleanup will happen in finally)
    useCallStore.getState().setLocalStream(localStream);
    useCallStore.getState().setScreen("calling");

    // Socket.IO emit disabled for STOMP compatibility
    // sendSocketMessage("/app/call/start", { ... });
  } catch (err) {
    // CRITICAL: Clean up stream if any error occurs
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    showToast(i18n.t("CALL.MEDIA_ERROR"));
    
    // Also clean up any partial state
    useCallStore.getState().reset();
  }
}

export async function acceptCall(): Promise<void> {
  const socket = getSocket();
  if (!socket) return;

  const { activeCall } = useCallStore.getState();
  if (!activeCall) return;

  stopRingtone();

  try {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: activeCall.call_type === "video",
    });

    useCallStore.getState().setLocalStream(localStream);
    useCallStore.getState().setScreen("connecting");

    // Socket.IO emit disabled for STOMP compatibility
    // socket.emit("call:accept", {
    //   call_id: activeCall.call_id,
    //   conversation_id: activeCall.conversation_id,
    //   accepted_at: Date.now(),
    // });
  } catch (err) {
    showToast(i18n.t("CALL.MEDIA_ERROR"));
    rejectCall("media_error");
  }
}

export async function rejectCall(reason?: string): Promise<void> {
  const socket = getSocket();
  if (!socket) return;

  const { activeCall } = useCallStore.getState();
  if (!activeCall) return;

  // Socket.IO emit disabled for STOMP compatibility
  // socket.emit("call:reject", {
  //   call_id: activeCall.call_id,
  //   conversation_id: activeCall.conversation_id,
  //   reason,
  //   rejected_at: Date.now(),
  // });

  await cleanup();
}

export async function endCall(reason?: string): Promise<void> {
  const socket = getSocket();
  if (!socket) return;

  const { activeCall } = useCallStore.getState();
  if (!activeCall) return;

  // Socket.IO emit disabled for STOMP compatibility
    // socket.emit("call:end", { ... });

  await cleanup();
}

export async function leaveCall(reason?: string): Promise<void> {
  const socket = getSocket();
  if (!socket) return;

  const { activeCall } = useCallStore.getState();
  if (!activeCall) return;

  // Socket.IO emit disabled for STOMP compatibility
    // socket.emit("call:leave", { ... });

  await cleanup();
}

export function syncCallState(conversationId: string): void {
  const socket = getSocket();
  if (!socket) return;

  // Socket.IO emit disabled for STOMP compatibility
  // socket.emit("call:state:request", { ... });
}

function emitSignal(
  activeCall: CallStateSnapshot,
  targetUserId: string,
  signal: SimplePeer.SignalData
): void {
  const socket = getSocket();
  if (!socket) return;

  const signalPayload = signal as Partial<
    RTCSessionDescriptionInit & RTCIceCandidateInit
  >;
  const candidatePayload = toBackendCandidate(signal);

  let signalType: "offer" | "answer" | "ice-candidate" | "renegotiate";
  
  if (signalPayload.type === "offer" || signalPayload.type === "answer") {
    signalType = signalPayload.type;
  } else {
    signalType = "ice-candidate";
  }

  // Socket.IO emit disabled for STOMP compatibility
  // socket.emit("call:signal", { ... });
}

export function cleanup(): Promise<void> {
  if (isCleaningUp) {
    return cleanupPromise || Promise.resolve();
  }

  isCleaningUp = true;
  
  cleanupPromise = new Promise((resolve) => {
    // Perform cleanup asynchronously to avoid blocking
    setTimeout(() => {
      try {
        stopRingtone();
        destroyAllPeers();
        useCallStore.getState().reset();
      } catch (error) {
        // Log error but don't reject the promise
      } finally {
        isCleaningUp = false;
        cleanupPromise = null;
        resolve();
      }
    }, 50);
  });

  return cleanupPromise;
}

export function registerCallHandlers(myUserId: string): () => void {
  const socket = getSocket();
  if (!socket) return () => {};

  // Register reconnect handling
  handleCallReconnect();

  const handleCallStarted = (payload: CallStartedPayload) => {
    if (payload.initiator_id === myUserId) return;

    useCallStore.getState().setActiveCall({
      call_id: payload.call_id,
      conversation_id: payload.conversation_id,
      conversation_type: payload.conversation_type ?? "direct",
      call_type: payload.call_type,
      status: "ringing",
      initiator_id: payload.initiator_id,
      participants: Object.fromEntries(
        [
          [payload.initiator_id, "accepted" as CallParticipantStatus],
          ...payload.participant_ids.map(
            (id) =>
              [
                id,
                id === payload.initiator_id
                  ? "accepted"
                  : "invited",
              ] as const
          ),
        ]
      ),
      started_at: payload.started_at,
    });

    useCallStore.getState().setScreen("incoming");
    playRingtone();
  };

  const handleCallAccepted = async (payload: CallAcceptedPayload) => {
    stopRingtone();
    const currentCall = useCallStore.getState().activeCall;
    if (currentCall?.call_id === payload.call_id) {
      useCallStore.getState().setActiveCall({
        ...currentCall,
        status: payload.status,
        participants: payload.participants,
      });
      useCallStore.getState().setStateVersion(payload.state_version);
    }

    if (payload.user_id === myUserId) {
      return;
    }

    const { activeCall, localStream } = useCallStore.getState();
    if (!activeCall || !localStream) {
      return;
    }

    // Check if call is now ongoing
    if (payload.status === "ongoing" && payload.participants[myUserId] === "accepted") {
      useCallStore.getState().setScreen("connecting");

      const iceServers = await getIceServers();

      createPeer({
        userId: payload.user_id,
        initiator: true,
        localStream,
        iceServers,
        onSignal: (signal) => emitSignal(activeCall, payload.user_id, signal),
        onStream: (stream) => {
          useCallStore.getState().setRemoteStream(payload.user_id, stream);
          useCallStore.getState().setScreen("active");
          useCallStore.getState().startDurationTimer();
        },
        onClose: () => useCallStore.getState().removeRemoteStream(payload.user_id),
      });
    }
  };

  const handleCallSignalReceived = async (payload: CallSignalPayload) => {
    if (payload.sender_id === myUserId) {
      return;
    }
    if (payload.target_user_id && payload.target_user_id !== myUserId) {
      return;
    }

    const { activeCall, localStream, stateVersion } = useCallStore.getState();
    if (!activeCall || !localStream) {
      return;
    }
    if (payload.call_id !== activeCall.call_id) {
      return;
    }

    // Drop stale signals
    if (payload.state_version && payload.state_version < stateVersion) {
      return;
    }

    const iceServers = await getIceServers();

    if (!hasPeer(payload.sender_id)) {
      createPeer({
        userId: payload.sender_id,
        initiator: false,
        localStream,
        iceServers,
        onSignal: (signal) => emitSignal(activeCall, payload.sender_id, signal),
        onStream: (stream) => {
          useCallStore.getState().setRemoteStream(payload.sender_id, stream);
          useCallStore.getState().setScreen("active");
          useCallStore.getState().startDurationTimer();
        },
        onClose: () =>
          useCallStore.getState().removeRemoteStream(payload.sender_id),
      });
    }

    let signalData: SimplePeer.SignalData;

    if (payload.signal_type === "offer" || payload.signal_type === "answer") {
      signalData = {
        type: payload.signal_type,
        sdp: payload.sdp,
      };
    } else if (payload.signal_type === "ice-candidate") {
      const candidateSignal = fromBackendCandidate(payload);
      if (!candidateSignal) return;
      signalData = candidateSignal;
    } else {
      return;
    }

    feedSignal(payload.sender_id, signalData);
  };

  const handleCallRejected = (_payload: CallRejectedPayload) => {
    showToast(i18n.t("CALL.REJECTED"));
    cleanup();
  };

  const handleCallLeft = (payload: CallLeftPayload) => {
    destroyPeer(payload.user_id);
    useCallStore.getState().removeRemoteStream(payload.user_id);
    
    // Show appropriate message based on reason
    if (payload.reason === "removed_from_conversation") {
      showToast(i18n.t("CALL.USER_REMOVED"));
    } else {
      showToast(i18n.t("CALL.USER_LEFT"));
    }
  };

  const handleCallEnded = (payload: CallEndedPayload) => {
    const { activeCall } = useCallStore.getState();
    const duration = activeCall
      ? payload.ended_at - activeCall.started_at
      : 0;

    cleanup();
    useCallStore.getState().setScreen("ended");
    
    // Show appropriate message based on reason
    let reasonMessage = "";
    switch (payload.reason) {
      case "rejected":
        reasonMessage = i18n.t("CALL.CALL_REJECTED");
        break;
      case "timed_out":
        reasonMessage = i18n.t("CALL.CALL_TIMEOUT");
        break;
      case "all_left":
        reasonMessage = i18n.t("CALL.ALL_LEFT");
        break;
      case "hangup":
        reasonMessage = i18n.t("CALL.CALL_HANGUP");
        break;
      default:
        reasonMessage = payload.reason || i18n.t("CALL.CALL_HANGUP");
    }
    
    showCallSummary(duration, reasonMessage);
    setTimeout(() => useCallStore.getState().setScreen("idle"), 3000);
  };

  const handleCallStateUpdated = (payload: CallStateUpdatedPayload) => {
    if (!payload.state) {
      if (useCallStore.getState().screen !== "idle") cleanup();
      return;
    }

    const { stateVersion } = useCallStore.getState();
    
    // Validate state version to prevent stale state overwrites
    if (payload.state.version !== undefined && payload.state.version < stateVersion) {
      // Ignore stale state updates
      return;
    }

    // Update state version first
    if (payload.state.version !== undefined) {
      useCallStore.getState().setStateVersion(payload.state.version);
    }

    useCallStore.getState().setActiveCall(payload.state);

    if (
      payload.state.status === "ringing" &&
      useCallStore.getState().screen === "idle" &&
      payload.state.participants[myUserId] === "invited"
    ) {
      useCallStore.getState().setScreen("incoming");
      playRingtone();
    }
  };

  const handleWsError = (payload: WsErrorPayload) => {
    if (payload.code === "RATE_LIMITED") {
      showToast(
        i18n.t("CALL.RATE_LIMITED", { retry_after: payload.details?.retry_after ?? 30 })
      );
    }
    if (payload.code === "FORBIDDEN") {
      if (payload.details && "conversation_id" in payload.details) {
        showToast(i18n.t("CALL.FORBIDDEN_MEMBER"));
      } else {
        showToast(i18n.t("CALL.FORBIDDEN_ACCESS"));
      }
      cleanup();
    }
  };

  // STOMP client doesn't have .on() method - call events handled via window events

  return () => {
    // STOMP client doesn't have .off() method
    // Cleanup handled by component unmount
  };
}
