import { useCallStore } from "../store/useCallStore";
import { callService, IceServer } from "../service/call-service";
import { getSocket, sendSocketMessage } from "../socket/socket";
import { getcurrentUserId } from "../utilities/utils";

let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let iceServers: IceServer[] = [];
let currentUserId: string | null = null;
let sfuTransportSend: any = null;
let sfuTransportRecv: any = null;
const sfuProducers: Map<string, string> = new Map();
const sfuConsumers: Map<string, any> = new Map();

export function initCallUser() {
  currentUserId = getcurrentUserId();
}

export async function loadIceServers(): Promise<RTCIceServer[]> {
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

function cleanupSfu() {
  sfuTransportSend = null;
  sfuTransportRecv = null;
  sfuProducers.clear();
  sfuConsumers.clear();
}

export async function startCall(conversationId: string, type: "AUDIO" | "VIDEO") {
  const store = useCallStore.getState();
  if (store.active) return;

  try {
    const callResult = await callService.startCall(conversationId, type);
    useCallStore.getState().initiateCall({
      callId: callResult.id,
      conversationId,
      type,
    });

    await loadIceServers();
    useCallStore.getState().setConnecting();
    const stream = await getLocalStream(type === "VIDEO");
    useCallStore.getState().setConnected(stream);

    peerConnection = new RTCPeerConnection(getRTCConfig());
    stream.getTracks().forEach((track) => peerConnection!.addTrack(track, stream));

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

    sendSocketMessage("/app/call.offer", {
      conversation_id: conversationId,
      sdp: peerConnection.localDescription,
    });
  } catch (err: any) {
    useCallStore.getState().setError(err.message || "Failed to start call");
    endCall(conversationId);
  }
}

export async function answerCall(conversationId: string, callId: string) {
  const store = useCallStore.getState();

  try {
    await callService.joinCall(conversationId, callId);
    useCallStore.getState().setConnecting();

    await loadIceServers();
    const stream = await getLocalStream(store.type === "VIDEO");
    useCallStore.getState().setConnected(stream);

    peerConnection = new RTCPeerConnection(getRTCConfig());
    stream.getTracks().forEach((track) => peerConnection!.addTrack(track, stream));

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
  } catch (err: any) {
    useCallStore.getState().setError(err.message || "Failed to answer call");
    endCall(conversationId);
  }
}

export async function rejectCall(conversationId: string, callId: string) {
  try {
    await callService.rejectCall(conversationId, callId);
    sendSocketMessage("/app/call.hangup", {
      conversation_id: conversationId,
    });
  } catch {}
  useCallStore.getState().resetCall();
}

export async function endCall(conversationId?: string) {
  const store = useCallStore.getState();
  const convId = conversationId || store.conversationId;
  const callId = store.callId;

  if (callId && convId) {
    try {
      await callService.endCall(convId, callId);
    } catch {}
    sendSocketMessage("/app/call.hangup", {
      conversation_id: convId,
    });
  }

  cleanupPeerConnection();
  cleanupLocalStream();
  useCallStore.getState().setEnded();
  setTimeout(() => useCallStore.getState().resetCall(), 1000);
}

export function handleCallSignal(data: any) {
  const store = useCallStore.getState();
  const peer = peerConnection;

  if (!store.active) return;

  if (data.sender_id === currentUserId) return;

  switch (data.type) {
    case "offer": {
      if (!peer) return;
      const offer = new RTCSessionDescription(data.sdp);
      peer.setRemoteDescription(offer).then(async () => {
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        sendSocketMessage("/app/call.answer", {
          conversation_id: store.conversationId,
          sdp: peer.localDescription,
        });
      });
      break;
    }
    case "answer": {
      if (!peer) return;
      const answer = new RTCSessionDescription(data.sdp);
      peer.setRemoteDescription(answer);
      break;
    }
    case "ice-candidate": {
      if (!peer || !data.candidate) return;
      const candidate = new RTCIceCandidate(data.candidate);
      peer.addIceCandidate(candidate);
      break;
    }
    case "hangup": {
      cleanupPeerConnection();
      cleanupLocalStream();
      useCallStore.getState().setEnded();
      setTimeout(() => useCallStore.getState().resetCall(), 1000);
      break;
    }
  }
}

// ─── SFU / Group Call Actions ───────────────────────────────────────

async function getSfuWebSocketUrl(): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.replace('/ws', '') || '';
  const token = localStorage.getItem('accessToken');
  return `${baseUrl}/sfu/ws?token=${token}&roomId=${useCallStore.getState().sfuRoomId}&peerId=${currentUserId}`;
}

async function connectSfuWebSocket(): Promise<WebSocket> {
  const url = await getSfuWebSocketUrl();
  const ws = new WebSocket(url);

  return new Promise((resolve, reject) => {
    ws.onopen = () => {
      console.log('[SFU-WS] Connected');
      resolve(ws);
    };
    ws.onerror = (err) => {
      console.error('[SFU-WS] Error:', err);
      reject(err);
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'peer-joined': {
            useCallStore.getState().addPeerStream({
              peerId: msg.peerId,
              userId: msg.userId,
              displayName: msg.displayName || msg.peerId,
              audio: null,
              video: null,
              audioMuted: false,
              videoMuted: false,
            });
            break;
          }
          case 'peer-left': {
            useCallStore.getState().removePeerStream(msg.peerId);
            break;
          }
          case 'active-speaker': {
            useCallStore.getState().setSpeaking(msg.peerId === currentUserId);
            break;
          }
          case 'room-joined': {
            console.log('[SFU-WS] Joined room, existing peers:', msg.peers);
            msg.peers.forEach((peerId: string) => {
              useCallStore.getState().addPeerStream({
                peerId,
                userId: peerId,
                displayName: peerId,
                audio: null,
                video: null,
                audioMuted: false,
                videoMuted: false,
              });
            });
            break;
          }
        }
      } catch {}
    };
  });
}

export async function startGroupCall(conversationId: string) {
  const store = useCallStore.getState();
  if (store.active) return;

  try {
    const session = await callService.createGroupCall(conversationId);
    const roomId = session.sfuRoomId;
    const sessionId = session.id;

    useCallStore.getState().initiateCall({
      callId: sessionId,
      conversationId,
      type: "GROUP",
    });
    useCallStore.getState().setSfuRoomId(roomId);
    useCallStore.getState().setSessionId(sessionId);

    await loadIceServers();
    const stream = await getLocalStream(true);
    useCallStore.getState().setConnected(stream);
    useCallStore.getState().setConnecting();

    await callService.createSfuRoom(roomId, conversationId);

    const ws = await connectSfuWebSocket();

    const sendTransport = await callService.createSfuTransport(roomId, currentUserId!, "send");
    sfuTransportSend = sendTransport;

    const recvTransport = await callService.createSfuTransport(roomId, currentUserId!, "recv");
    sfuTransportRecv = recvTransport;

    const sendRtcTransport = new RTCPeerConnection(getRTCConfig());
    await sendRtcTransport.setRemoteDescription({
      type: 'offer',
      sdp: new Blob([JSON.stringify(sendTransport.dtlsParameters)]).toString(),
    });

    sendSocketMessage("/app/sfu.join", {
      conversation_id: conversationId,
      sfu_room_id: roomId,
    });

    useCallStore.getState().setConnected(stream);

    stream.getAudioTracks().forEach((track) => {
      if (sfuTransportSend) {
        const sender = sendRtcTransport.addTrack(track, stream);
      }
    });

    if (true) {
      stream.getVideoTracks().forEach((track) => {
        if (sfuTransportSend) {
          const sender = sendRtcTransport.addTrack(track, stream);
        }
      });
    }

    const offer = await sendRtcTransport.createOffer();
    await sendRtcTransport.setLocalDescription(offer);

    ws.send(JSON.stringify({ type: 'new-consumer', producerId: currentUserId, peerId: currentUserId, kind: 'audio' }));
  } catch (err: any) {
    useCallStore.getState().setError(err.message || "Failed to start group call");
    useCallStore.getState().resetCall();
  }
}

export async function handleIncomingGroupCall(conversationId: string, sessionId: string, sfuRoomId: string) {
  try {
    await callService.joinGroupCall(conversationId, sessionId);
    useCallStore.getState().setConnecting();

    useCallStore.getState().setSfuRoomId(sfuRoomId);
    useCallStore.getState().setSessionId(sessionId);

    await loadIceServers();
    const stream = await getLocalStream(true);
    useCallStore.getState().setConnected(stream);

    const ws = await connectSfuWebSocket();

    const recvTransport = await callService.createSfuTransport(sfuRoomId, currentUserId!, "recv");
    sfuTransportRecv = recvTransport;

    sendSocketMessage("/app/sfu.join", {
      conversation_id: conversationId,
      sfu_room_id: sfuRoomId,
    });

    useCallStore.getState().setConnected(stream);
  } catch (err: any) {
    useCallStore.getState().setError(err.message || "Failed to join group call");
    useCallStore.getState().resetCall();
  }
}

export async function endGroupCall(conversationId: string, sessionId: string) {
  try {
    await callService.leaveGroupCall(conversationId, sessionId);
    sendSocketMessage("/app/sfu.leave", {
      conversation_id: conversationId,
      sfu_room_id: useCallStore.getState().sfuRoomId,
    });
  } catch {}

  cleanupLocalStream();
  cleanupSfu();
  useCallStore.getState().setEnded();
  setTimeout(() => useCallStore.getState().resetCall(), 1000);
}

export function handleSfuSignal(data: any) {
  const store = useCallStore.getState();
  if (!store.active || store.type !== "GROUP") return;

  switch (data.type) {
    case "sfu-peer-joined":
      useCallStore.getState().addPeerStream({
        peerId: data.sender_id,
        userId: data.sender_id,
        displayName: data.sender_id,
        audio: null,
        video: null,
        audioMuted: false,
        videoMuted: false,
      });
      break;

    case "sfu-peer-left":
      useCallStore.getState().removePeerStream(data.sender_id);
      break;

    case "sfu-active-speaker":
      useCallStore.getState().setSpeaking(data.active_peer_id === currentUserId);
      break;
  }
}
