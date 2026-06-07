import { useCallStore } from "../store/useCallStore";
import { callService, IceServer } from "../service/call-service";
import { sendSocketMessage, subscribeToConversation } from "../socket/socket";
import { getcurrentUserId } from "../utilities/utils";
import { playRingtone, playBusyTone, stopRingtone } from "../service/ringtone";

let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let iceServers: IceServer[] = [];
let currentUserId: string | null = null;
let pendingOffer: { sdp: RTCSessionDescriptionInit; senderId: string } | null = null;
let pendingIceCandidates: RTCIceCandidateInit[] = [];
let ringingTimeoutId: ReturnType<typeof setTimeout> | null = null;

export function initCallUser() {
  currentUserId = getcurrentUserId();
}

async function loadIceServers(): Promise<RTCIceServer[]> {
  try {
    const config = await callService.getIceServers();
    iceServers = config.iceServers || [];
  } catch {
    iceServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ];
  }
  return iceServers.map((s) => ({
    urls: s.urls,
    username: s.username,
    credential: s.credential,
  }));
}

function getRTCConfig(): RTCConfiguration {
  return {
    iceServers: iceServers.map((s) => ({
      urls: s.urls,
      username: s.username,
      credential: s.credential,
    })),
    iceCandidatePoolSize: 10,
  };
}

async function getLocalStream(video: boolean): Promise<MediaStream> {
  if (localStream) return localStream;
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video,
  });
  return localStream;
}

export function cleanupLocalStream() {
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
}

export function cleanupPeerConnection() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
}

function clearPendingOffer() {
  pendingOffer = null;
}

function clearPendingIceCandidates() {
  pendingIceCandidates = [];
}

function setupRingingTimeout(conversationId: string) {
  clearRingingTimeout();
  ringingTimeoutId = setTimeout(() => {
    const store = useCallStore.getState();
    if (store.status === "ringing" || store.status === "connecting") {
      endCall(conversationId);
    }
    ringingTimeoutId = null;
  }, 30000);
}

function clearRingingTimeout() {
  if (ringingTimeoutId) {
    clearTimeout(ringingTimeoutId);
    ringingTimeoutId = null;
  }
}

function setupIceStateHandler(pc: RTCPeerConnection) {
  pc.oniceconnectionstatechange = () => {
    const state = pc.iceConnectionState;
    const callStore = useCallStore.getState();
    if (state === "connected") {
      if (callStore.status === "connecting" || callStore.status === "reconnecting") {
        callStore.setConnected(localStream!);
      }
    } else if (state === "disconnected") {
      if (callStore.status === "connected") {
        callStore.setReconnecting();
      }
    } else if (state === "failed") {
      endCall();
    }
  };
}

export async function startCall(conversationId: string, type: "AUDIO" | "VIDEO") {
  const store = useCallStore.getState();
  if (store.active) return;

  useCallStore.getState().setStarting(true);
  try {
    const callResult = await callService.startCall(conversationId, type);
    useCallStore.getState().initiateCall({
      callId: callResult.id,
      conversationId,
      type,
    });
    setupRingingTimeout(conversationId);

    await loadIceServers();
    useCallStore.getState().setConnecting();
    const stream = await getLocalStream(type === "VIDEO");

    peerConnection = new RTCPeerConnection(getRTCConfig());
    stream.getTracks().forEach((track) => peerConnection!.addTrack(track, stream));
    setupIceStateHandler(peerConnection);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSocketMessage("/app/call.ice-candidate", {
          conversation_id: conversationId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    peerConnection.ontrack = (event) => {
      useCallStore.getState().setRemoteStream(event.streams[0]);
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    subscribeToConversation(conversationId);
    sendSocketMessage("/app/call.offer", {
      conversation_id: conversationId,
      sdp: peerConnection.localDescription,
    });
  } catch (err: any) {
    useCallStore.getState().setError(err.message || "Failed to start call");
    endCall(conversationId);
  } finally {
    useCallStore.getState().setStarting(false);
  }
}

export async function answerCall(conversationId: string, callId: string) {
  const store = useCallStore.getState();

  useCallStore.getState().setAnswering(true);
  try {
    try {
      await callService.joinCall(conversationId, callId);
    } catch (err) {
      console.warn('[Call] joinCall failed (non-fatal):', err);
    }
    useCallStore.getState().setConnecting();

    await loadIceServers();
    const stream = await getLocalStream(store.type === "VIDEO");

    peerConnection = new RTCPeerConnection(getRTCConfig());
    stream.getTracks().forEach((track) => peerConnection!.addTrack(track, stream));
    setupIceStateHandler(peerConnection);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSocketMessage("/app/call.ice-candidate", {
          conversation_id: conversationId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    peerConnection.ontrack = (event) => {
      useCallStore.getState().setRemoteStream(event.streams[0]);
    };

    subscribeToConversation(conversationId);

    const answerParams = pendingOffer
      ? { sdp: pendingOffer.sdp, candidates: pendingIceCandidates }
      : await new Promise<{ sdp: RTCSessionDescriptionInit; candidates: RTCIceCandidateInit[] } | null>((resolve) => {
          const check = setInterval(() => {
            if (pendingOffer) {
              clearInterval(check);
              clearTimeout(timer);
              resolve({ sdp: pendingOffer.sdp, candidates: pendingIceCandidates });
            }
          }, 200);
          const timer = setTimeout(() => {
            clearInterval(check);
            resolve(null);
          }, 6000);
        });

    if (answerParams) {
      const offer = new RTCSessionDescription(answerParams.sdp);
      await peerConnection.setRemoteDescription(offer);
      for (const candidate of answerParams.candidates) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {}
      }
      pendingIceCandidates = [];
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      sendSocketMessage("/app/call.answer", {
        conversation_id: conversationId,
        sdp: peerConnection.localDescription,
      });
      pendingOffer = null;
    }
  } catch (err: any) {
    useCallStore.getState().setError(err.message || "Failed to answer call");
    endCall(conversationId);
  } finally {
    useCallStore.getState().setAnswering(false);
  }
}

export async function rejectCall(conversationId: string, callId: string) {
  useCallStore.getState().setRejecting(true);
  try {
    await callService.rejectCall(conversationId, callId);
    sendSocketMessage("/app/call.hangup", {
      conversation_id: conversationId,
    });
  } catch (err) {
    console.warn('[Call] rejectCall failed:', err);
  } finally {
    clearPendingOffer();
    clearPendingIceCandidates();
    clearRingingTimeout();
    stopRingtone();
    useCallStore.getState().setRejecting(false);
    useCallStore.getState().resetCall();
  }
}

function getLastCallInfo(): { callId: string | null; convId: string | null } {
  try {
    const callId = localStorage.getItem('lastCallId');
    const convId = localStorage.getItem('lastConvId');
    return { callId, convId };
  } catch {
    return { callId: null, convId: null };
  }
}

function clearLastCallInfo() {
  try {
    localStorage.removeItem('lastCallId');
    localStorage.removeItem('lastConvId');
  } catch {}
}

export async function endCall(conversationId?: string) {
  const store = useCallStore.getState();
  const convId = conversationId || store.conversationId;
  let callId = store.callId;

  useCallStore.getState().setEnding(true);

  if (!callId) {
    const last = getLastCallInfo();
    callId = last.callId ?? null;
  }

  if (callId && convId) {
    try {
      await callService.endCall(convId, callId);
    } catch {
      console.warn('[Call] HTTP endCall failed — call may stay ONGOING in DB');
    }
  }

  if (convId) {
    sendSocketMessage("/app/call.hangup", {
      conversation_id: convId,
    });
  }

  clearPendingOffer();
  clearPendingIceCandidates();
  clearRingingTimeout();
  stopRingtone();
  const wasConnected = useCallStore.getState().status === "connected";
  cleanupPeerConnection();
  cleanupLocalStream();
  useCallStore.getState().setEnded();
  if (wasConnected) {
    playBusyTone();
  }
  if (callId && convId) {
    localStorage.setItem('lastCallId', callId);
    localStorage.setItem('lastConvId', convId);
  }
  useCallStore.getState().setEnding(false);
  setTimeout(() => {
    clearLastCallInfo();
    useCallStore.getState().resetCall();
  }, 1000);
}

export function handleCallSignal(data: any) {
  const store = useCallStore.getState();
  const peer = peerConnection;

  if (data.sender_id === currentUserId) return;

  if (!store.active) {
    if (data.type === "offer") {
      pendingOffer = { sdp: data.sdp, senderId: data.sender_id };
    } else if (data.type === "ice-candidate" && data.candidate) {
      pendingIceCandidates.push(data.candidate);
    }
    return;
  }

  switch (data.type) {
    case "offer": {
      if (!peer) return;
      if (peer.signalingState !== "stable") {
        return;
      }
      const offer = new RTCSessionDescription(data.sdp);
      peer.setRemoteDescription(offer).then(async () => {
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        sendSocketMessage("/app/call.answer", {
          conversation_id: store.conversationId,
          sdp: peer.localDescription,
        });
      }).catch((err) => {
        console.warn('[Call] Failed to process offer:', err);
      });
      break;
    }
    case "answer": {
      if (!peer) return;
      const answer = new RTCSessionDescription(data.sdp);
      peer.setRemoteDescription(answer).catch((err) => {
        console.warn('[Call] Failed to process answer:', err);
      });
      break;
    }
    case "ice-candidate": {
      if (!data.candidate) return;
      if (!peer) {
        pendingIceCandidates.push(data.candidate);
        return;
      }
      const candidate = new RTCIceCandidate(data.candidate);
      peer.addIceCandidate(candidate).catch(() => {});
      break;
    }
    case "hangup": {
      clearPendingOffer();
      clearPendingIceCandidates();
      clearRingingTimeout();
      stopRingtone();
      const wasConnected = useCallStore.getState().status === "connected";
      cleanupPeerConnection();
      cleanupLocalStream();
      useCallStore.getState().setEnded();
      if (wasConnected) {
        playBusyTone();
      }
      setTimeout(() => useCallStore.getState().resetCall(), 1000);
      break;
    }
  }
}
