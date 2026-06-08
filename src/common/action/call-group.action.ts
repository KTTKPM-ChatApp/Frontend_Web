import { useCallStore } from "../store/useCallStore";
import { callService } from "../service/call-service";
import { sendSocketMessage } from "../socket/socket";
import { getcurrentUserId } from "../utilities/utils";
import { Device } from "mediasoup-client";

let currentUserId: string | null = null;
let localStream: MediaStream | null = null;
let iceServers: RTCIceServer[] = [];
let sfuTransportSend: any = null;
let sfuTransportRecv: any = null;

const sfuState = {
  device: null as Device | null,
  recvTransport: null as any,
};
const sfuConsumers: Map<string, any> = new Map();

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
  return iceServers;
}

function getRTCConfig(): RTCConfiguration {
  return {
    iceServers: iceServers,
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

function cleanupLocalStream() {
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
}

function cleanupSfu() {
  sfuTransportSend = null;
  sfuTransportRecv = null;
  if (sfuState.device) {
    sfuState.device = null;
  }
  sfuConsumers.clear();
}

async function getSfuWebSocketUrl(): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.replace('/ws', '') || '';
  const token = localStorage.getItem('accessToken') || '';
  const roomId = useCallStore.getState().sfuRoomId || '';
  const peerId = currentUserId || '';
  return `${baseUrl}/sfu/ws?token=${token}&roomId=${roomId}&peerId=${peerId}`;
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
    ws.onmessage = async (event) => {
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
          case 'new-consumer': {
            console.log('[SFU-WS] new-consumer', {
              producerId: msg.producerId,
              peerId: msg.peerId,
              kind: msg.kind,
            });

            const roomId = useCallStore.getState().sfuRoomId;
            if (!roomId || !sfuState.recvTransport) {
              console.warn('[SFU-WS] new-consumer: no roomId or recvTransport');
              break;
            }

            try {
              const rtpCapabilities = sfuState.device?.rtpCapabilities;
              const transportId = sfuTransportRecv.transportId;
              const consumeResult = await callService.consume(roomId, transportId, msg.producerId, rtpCapabilities);

              const consumer = await sfuState.recvTransport.consume({
                id: consumeResult.consumerId,
                producerId: consumeResult.producerId,
                kind: consumeResult.kind,
                rtpParameters: consumeResult.rtpParameters,
              });

              await callService.resumeConsumer(roomId, consumeResult.consumerId);
              sfuConsumers.set(consumeResult.consumerId, consumer);

              const remoteStream = new MediaStream([consumer.track]);

              const peerId = msg.peerId || `peer-${msg.producerId}`;
              useCallStore.getState().addOrUpdatePeerStream({
                peerId,
                userId: peerId,
                displayName: peerId,
                audio: msg.kind === 'audio' ? remoteStream : null,
                video: msg.kind === 'video' ? remoteStream : null,
                audioMuted: false,
                videoMuted: false,
              });
            } catch (err) {
              console.error('[SFU-WS] new-consumer error:', err);
            }
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
    const res = await callService.createGroupCall(conversationId);
    const roomId = res.session.sfuRoomId;
    const sessionId = res.session.id;

    useCallStore.getState().initiateCall({
      callId: sessionId,
      conversationId,
      type: "GROUP",
    });
    useCallStore.getState().setSfuRoomId(roomId);
    useCallStore.getState().setSessionId(sessionId);

    await loadIceServers();
    const stream = await getLocalStream(true);
    useCallStore.getState().setConnecting();

    const roomInfo = await callService.createSfuRoom(roomId, conversationId);
    const device = new Device();
    await device.load({ routerRtpCapabilities: roomInfo.routerRtpCapabilities });
    sfuState.device = device;

    const sendTransportParams = await callService.createSfuTransport(roomId, currentUserId!, "send");
    sfuTransportSend = sendTransportParams;

    const recvTransportParams = await callService.createSfuTransport(roomId, currentUserId!, "recv");
    sfuTransportRecv = recvTransportParams;
    sfuState.recvTransport = device.createRecvTransport({
      id: recvTransportParams.transportId,
      iceParameters: recvTransportParams.iceParameters,
      iceCandidates: recvTransportParams.iceCandidates,
      dtlsParameters: recvTransportParams.dtlsParameters,
    });
    await sfuState.recvTransport.connect({ dtlsParameters: recvTransportParams.dtlsParameters });

    const ws = await connectSfuWebSocket();

    sendSocketMessage("/app/sfu.join", {
      conversation_id: conversationId,
      sfu_room_id: roomId,
    });

    useCallStore.getState().setConnected(stream);

    const sendRtcTransport = new RTCPeerConnection(getRTCConfig());
    stream.getAudioTracks().forEach((track) => {
      sendRtcTransport.addTrack(track, stream);
    });
    stream.getVideoTracks().forEach((track) => {
      sendRtcTransport.addTrack(track, stream);
    });

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

    const roomInfo = await callService.getSfuRoom(sfuRoomId);
    const device = new Device();
    await device.load({ routerRtpCapabilities: roomInfo.routerRtpCapabilities });
    sfuState.device = device;

    const ws = await connectSfuWebSocket();

    const recvTransportParams = await callService.createSfuTransport(sfuRoomId, currentUserId!, "recv");
    sfuTransportRecv = recvTransportParams;
    sfuState.recvTransport = device.createRecvTransport({
      id: recvTransportParams.transportId,
      iceParameters: recvTransportParams.iceParameters,
      iceCandidates: recvTransportParams.iceCandidates,
      dtlsParameters: recvTransportParams.dtlsParameters,
    });
    await sfuState.recvTransport.connect({ dtlsParameters: recvTransportParams.dtlsParameters });

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
