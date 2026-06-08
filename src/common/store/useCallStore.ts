import { create } from "zustand";

export interface SfuPeerStream {
  peerId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  audio: MediaStream | null;
  video: MediaStream | null;
  audioMuted: boolean;
  videoMuted: boolean;
}

export interface CallState {
  callId: string | null;
  conversationId: string | null;
  callerId: string | null;
  callerName: string | null;
  callerAvatarUrl: string | null;
  type: "AUDIO" | "VIDEO" | "GROUP" | null;
  status: "idle" | "ringing" | "connecting" | "connected" | "reconnecting" | "ended";
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  active: boolean;
  minimized: boolean;
  error: string | null;
  sfuRoomId: string | null;
  sessionId: string | null;
  peerStreams: SfuPeerStream[];
  isSpeaking: boolean;
  audioMuted: boolean;
  videoMuted: boolean;
  callStartTime: number | null;
  // Loading states
  isStarting: boolean;
  isEnding: boolean;
  isRejecting: boolean;
  isAnswering: boolean;
}

export interface CallSetters {
  initiateCall: (params: {
    callId: string;
    conversationId: string;
    type: "AUDIO" | "VIDEO" | "GROUP";
    callerName?: string;
    callerAvatarUrl?: string | null;
  }) => void;
  receiveCall: (params: {
    callId: string;
    conversationId: string;
    callerId: string;
    callerName: string;
    callerAvatarUrl?: string | null;
    type: "AUDIO" | "VIDEO" | "GROUP";
    sfuRoomId?: string;
    sessionId?: string;
  }) => void;
  setConnecting: () => void;
  setConnected: (stream: MediaStream) => void;
  setRemoteStream: (stream: MediaStream) => void;
  setLocalStream: (stream: MediaStream) => void;
  setSfuRoomId: (roomId: string) => void;
  setSessionId: (sessionId: string) => void;
  addPeerStream: (peer: SfuPeerStream) => void;
  removePeerStream: (peerId: string) => void;
  updatePeerStream: (peerId: string, updates: Partial<SfuPeerStream>) => void;
  addOrUpdatePeerStream: (peer: SfuPeerStream) => void;
  setSpeaking: (speaking: boolean) => void;
  setAudioMuted: (muted: boolean) => void;
  setVideoMuted: (muted: boolean) => void;
  setEnded: () => void;
  setReconnecting: () => void;
  setCallStartTime: (time: number) => void;
  setMinimized: (value: boolean) => void;
  setCallerInfo: (name: string, avatarUrl?: string | null) => void;
  setError: (error: string | null) => void;
  setStarting: (value: boolean) => void;
  setEnding: (value: boolean) => void;
  setRejecting: (value: boolean) => void;
  setAnswering: (value: boolean) => void;
  resetCall: () => void;
}

export type CallStore = CallState & CallSetters;

export const initialCallState: CallState = {
  callId: null,
  conversationId: null,
  callerId: null,
  callerName: null,
  callerAvatarUrl: null,
  type: null,
  status: "idle",
  localStream: null,
  remoteStream: null,
  active: false,
  minimized: false,
  error: null,
  sfuRoomId: null,
  sessionId: null,
  peerStreams: [],
  isSpeaking: false,
  audioMuted: false,
  videoMuted: false,
  callStartTime: null,
  isStarting: false,
  isEnding: false,
  isRejecting: false,
  isAnswering: false,
};

export const useCallStore = create<CallStore>((set) => ({
  ...initialCallState,

  initiateCall: (params) =>
    set({
      callId: params.callId,
      conversationId: params.conversationId,
      callerId: null,
      callerName: params.callerName ?? null,
      callerAvatarUrl: params.callerAvatarUrl ?? null,
      type: params.type,
      status: "ringing",
      active: true,
      minimized: false,
      error: null,
    }),

  receiveCall: (params) =>
    set({
      callId: params.callId,
      conversationId: params.conversationId,
      callerId: params.callerId,
      callerName: params.callerName,
      callerAvatarUrl: params.callerAvatarUrl ?? null,
      type: params.type,
      status: "ringing",
      active: true,
      minimized: false,
      error: null,
      sfuRoomId: params.sfuRoomId || null,
      sessionId: params.sessionId || null,
    }),

  setConnecting: () => set({ status: "connecting" }),

  setConnected: (stream) =>
    set({ status: "connected", localStream: stream, callStartTime: Date.now() }),

  setReconnecting: () => set({ status: "reconnecting" }),

  setCallStartTime: (time) => set({ callStartTime: time }),

  setRemoteStream: (stream) => set({ remoteStream: stream }),

  setLocalStream: (stream) => set({ localStream: stream }),

  setSfuRoomId: (roomId) => set({ sfuRoomId: roomId }),

  setSessionId: (sessionId) => set({ sessionId }),

  addPeerStream: (peer) =>
    set((state) => {
      if (state.peerStreams.some((p) => p.peerId === peer.peerId)) return state;
      return { peerStreams: [...state.peerStreams, peer] };
    }),

  removePeerStream: (peerId) =>
    set((state) => ({
      peerStreams: state.peerStreams.filter((p) => p.peerId !== peerId),
    })),

  updatePeerStream: (peerId, updates) =>
    set((state) => ({
      peerStreams: state.peerStreams.map((p) =>
        p.peerId === peerId ? { ...p, ...updates } : p
      ),
    })),

  addOrUpdatePeerStream: (peer) =>
    set((state) => {
      const existing = state.peerStreams.find((p) => p.peerId === peer.peerId);
      if (existing) {
        return {
          peerStreams: state.peerStreams.map((p) =>
            p.peerId === peer.peerId ? { ...p, ...peer } : p
          ),
        };
      }
      return { peerStreams: [...state.peerStreams, peer] };
    }),

  setSpeaking: (speaking) => set({ isSpeaking: speaking }),

  setAudioMuted: (muted) => set({ audioMuted: muted }),

  setVideoMuted: (muted) => set({ videoMuted: muted }),

  setEnded: () =>
    set({
      status: "ended",
      active: false,
      localStream: null,
      remoteStream: null,
      peerStreams: [],
      sfuRoomId: null,
      sessionId: null,
      callStartTime: null,
    }),

  setMinimized: (value) => set({ minimized: value }),

  setCallerInfo: (name: string, avatarUrl?: string | null) => set({ callerName: name, callerAvatarUrl: avatarUrl ?? null }),

  setError: (error) => set({ error }),

  setStarting: (value) => set({ isStarting: value }),
  setEnding: (value) => set({ isEnding: value }),
  setRejecting: (value) => set({ isRejecting: value }),
  setAnswering: (value) => set({ isAnswering: value }),

  resetCall: () => set(initialCallState),
}));
