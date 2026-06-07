import http from "../api/http";
import { API } from "../api/path";

export interface IceServer {
  urls: string;
  username?: string;
  credential?: string;
}

export interface StartCallResponse {
  id: string;
  conversationId: string;
  startedBy: string;
  type: "AUDIO" | "VIDEO";
  status: "ONGOING" | "ENDED";
  startedAt: string;
  participants: { userId: string; joinedAt: string }[];
}

export interface GroupCallSessionResponse {
  id: string;
  conversationId: string;
  sfuRoomId: string;
  startedBy: string;
  hostId: string;
  status: string;
  startedAt: string;
  participants: {
    userId: string;
    displayName: string;
    joinedAt: string;
    audioMuted: boolean;
    videoMuted: boolean;
  }[];
}

export interface TransportResponse {
  transportId: string;
  iceParameters: any;
  iceCandidates: any[];
  dtlsParameters: any;
}

export interface ProduceResponse {
  producerId: string;
}

export interface ConsumeResponse {
  consumerId: string;
  producerId: string;
  kind: "audio" | "video";
  rtpParameters: any;
  type: string;
}

export interface RoomResponse {
  roomId: string;
  conversationId: string;
  routerRtpCapabilities: any;
}

export const callService = {
  async getIceServers(): Promise<{ iceServers: IceServer[] }> {
    const res = await http.get<{ iceServers: IceServer[] }>(API.API_ICE_SERVERS);
    return res.payload;
  },

  async startCall(conversationId: string, type: "AUDIO" | "VIDEO"): Promise<StartCallResponse> {
    const res = await http.post<StartCallResponse>(API.API_CALLS_START(conversationId), { type });
    return res.payload;
  },

  async getCallHistory(conversationId: string, page = 1, limit = 20) {
    const res = await http.get(`${API.API_CALLS_HISTORY(conversationId)}?page=${page}&limit=${limit}`);
    return res.payload;
  },

  async getCallState(conversationId: string) {
    const res = await http.get(API.API_CALLS_STATE(conversationId));
    return res.payload;
  },

  async joinCall(conversationId: string, callId: string) {
    const res = await http.post(API.API_CALLS_JOIN(conversationId, callId), {});
    return res.payload;
  },

  async endCall(conversationId: string, callId: string, reason?: string) {
    const res = await http.post(API.API_CALLS_END(conversationId, callId), { reason });
    return res.payload;
  },

  async rejectCall(conversationId: string, callId: string) {
    const res = await http.post(API.API_CALLS_REJECT(conversationId, callId), {});
    return res.payload;
  },

  async getActiveGroupCall(conversationId: string): Promise<GroupCallSessionResponse | null> {
    const res = await http.get<GroupCallSessionResponse>(API.API_GROUP_CALLS_ACTIVE(conversationId));
    return res.payload;
  },

  async createGroupCall(conversationId: string): Promise<GroupCallSessionResponse> {
    const res = await http.post<GroupCallSessionResponse>(API.API_GROUP_CALLS_CREATE(conversationId), {});
    return res.payload;
  },

  async joinGroupCall(conversationId: string, sessionId: string) {
    const res = await http.post(API.API_GROUP_CALLS_JOIN(conversationId, sessionId), {});
    return res.payload;
  },

  async leaveGroupCall(conversationId: string, sessionId: string) {
    const res = await http.post(API.API_GROUP_CALLS_LEAVE(conversationId, sessionId), {});
    return res.payload;
  },

  async endGroupCall(conversationId: string, sessionId: string) {
    const res = await http.post(API.API_GROUP_CALLS_END(conversationId, sessionId), {});
    return res.payload;
  },

  async createSfuRoom(roomId: string, conversationId: string): Promise<RoomResponse> {
    const res = await http.post<RoomResponse>(API.API_SFU_ROOMS, { roomId, conversationId });
    return res.payload;
  },

  async createSfuTransport(roomId: string, peerId: string, direction: "send" | "recv"): Promise<TransportResponse> {
    const res = await http.post<TransportResponse>(API.API_SFU_CREATE_TRANSPORT(roomId), { peerId, direction });
    return res.payload;
  },

  async connectSfuTransport(roomId: string, transportId: string, dtlsParameters: any) {
    const res = await http.post(API.API_SFU_CONNECT_TRANSPORT(roomId), { transportId, dtlsParameters });
    return res.payload;
  },

  async produce(roomId: string, transportId: string, kind: "audio" | "video", rtpParameters: any, appData?: any): Promise<ProduceResponse> {
    const res = await http.post<ProduceResponse>(API.API_SFU_PRODUCE(roomId), { transportId, kind, rtpParameters, appData });
    return res.payload;
  },

  async consume(roomId: string, transportId: string, producerId: string, rtpCapabilities: any): Promise<ConsumeResponse> {
    const res = await http.post<ConsumeResponse>(API.API_SFU_CONSUME(roomId), { transportId, producerId, rtpCapabilities });
    return res.payload;
  },

  async resumeConsumer(roomId: string, consumerId: string) {
    const res = await http.post(API.API_SFU_RESUME_CONSUMER(roomId), { consumerId });
    return res.payload;
  },

  async closeProducer(roomId: string, producerId: string) {
    const res = await http.post(API.API_SFU_CLOSE_PRODUCER(roomId), { producerId });
    return res.payload;
  },
};
