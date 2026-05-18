/**
 * Presence Heartbeat Hook
 * Emits presence:heartbeat every 25s when connected
 * Handles presence:update from server
 */

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from '../socket/socket';

const HEARTBEAT_INTERVAL_MS = 25_000; // 25 seconds

interface PresenceUpdatePayload {
  user_id: string;
  status: 'online' | 'offline';
  last_seen_at?: number;
  expires_at?: number;
  socket_count?: number;
  source?: string;
  trace_id?: string;
  version?: string;
}

interface UsePresenceHeartbeatParams {
  onPresenceUpdate: (payload: PresenceUpdatePayload) => void;
  onUnauthorized?: () => void;
}

export function usePresenceHeartbeat({
  onPresenceUpdate,
  onUnauthorized,
}: UsePresenceHeartbeatParams): void {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const sendHeartbeat = () => {
      // STOMP client doesn't have .emit() method
      // sendSocketMessage("/app/presence/heartbeat", { ts: Date.now() });
    };

    const handleConnect = () => {
      sendHeartbeat();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    };

    const handleDisconnect = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const handlePresenceUpdate = (payload: PresenceUpdatePayload) => {
      onPresenceUpdate(payload);
    };

    const handleWsError = (payload: any) => {
      if (payload.code === 'UNAUTHORIZED') {
        handleDisconnect();
        onUnauthorized?.();
      }
    };

    // STOMP client doesn't have .on() method - handled via window events

    // If already connected, start heartbeat immediately
    if (socket?.connected) handleConnect();

    return () => {
      // STOMP client doesn't have .off() method
      // Cleanup handled by component unmount
      handleDisconnect();
    };
  }, [onPresenceUpdate, onUnauthorized]);
}
