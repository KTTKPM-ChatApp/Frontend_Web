"use client";

import { create } from "zustand";
import type { CallStateSnapshot, CallScreen } from "@/src/types/call";

interface CallStore {
  screen: CallScreen;
  activeCall: CallStateSnapshot | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isMuted: boolean;
  isCameraOff: boolean;
  callDuration: number;
  durationInterval: ReturnType<typeof setInterval> | null;
  stateVersion: number;

  setScreen: (s: CallScreen) => void;
  setActiveCall: (state: CallStateSnapshot | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (userId: string, stream: MediaStream) => void;
  removeRemoteStream: (userId: string) => void;
  setMuted: (muted: boolean) => void;
  setCameraOff: (off: boolean) => void;
  startDurationTimer: () => void;
  stopDurationTimer: () => void;
  setStateVersion: (version: number) => void;
  reset: () => void;
}

const initialState = {
  screen: "idle" as CallScreen,
  activeCall: null,
  localStream: null,
  remoteStreams: new Map<string, MediaStream>(),
  isMuted: false,
  isCameraOff: false,
  callDuration: 0,
  durationInterval: null,
  stateVersion: 0,
};

export const useCallStore = create<CallStore>((set, get) => ({
  ...initialState,

  setScreen: (screen) => set({ screen }),

  setActiveCall: (activeCall) => set({ activeCall }),

  setLocalStream: (localStream) => set({ localStream }),

  setRemoteStream: (userId, stream) =>
    set((s) => ({
      remoteStreams: new Map(s.remoteStreams).set(userId, stream),
    })),

  removeRemoteStream: (userId) =>
    set((s) => {
      const m = new Map(s.remoteStreams);
      m.delete(userId);
      return { remoteStreams: m };
    }),

  setMuted: (isMuted) => {
    const { localStream } = get();
    localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !isMuted;
    });
    set({ isMuted });
  },

  setCameraOff: (isCameraOff) => {
    const { localStream } = get();
    localStream?.getVideoTracks().forEach((t) => {
      t.enabled = !isCameraOff;
    });
    set({ isCameraOff });
  },

  startDurationTimer: () => {
    const { durationInterval } = get();
    if (durationInterval) clearInterval(durationInterval);
    
    const interval = setInterval(() => {
      set((s) => ({ callDuration: s.callDuration + 1 }));
    }, 1000);
    
    set({ durationInterval: interval, callDuration: 0 });
  },

  stopDurationTimer: () => {
    const { durationInterval } = get();
    if (durationInterval) {
      clearInterval(durationInterval);
    }
    set({ durationInterval: null });
  },

  setStateVersion: (stateVersion) => set({ stateVersion }),

  reset: () => {
    const { durationInterval, localStream } = get();
    
    if (durationInterval) clearInterval(durationInterval);
    
    localStream?.getTracks().forEach((t) => t.stop());
    
    set(initialState);
  },
}));
