import { useEffect, useRef } from 'react';
import { getSocket, sendSocketMessage } from '../socket/socket';

const HEARTBEAT_INTERVAL_MS = 25_000;

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
      sendSocketMessage("/app/presence/heartbeat", { ts: Date.now() });
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

    const handlePresenceUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.event === 'UNAUTHORIZED') {
        handleDisconnect();
        onUnauthorized?.();
      }
      onPresenceUpdate({
        user_id: detail?.userId ?? detail?.user_id ?? '',
        status: detail?.event === 'USER_ONLINE' || detail?.event === 'online'
          ? 'online' : 'offline',
        last_seen_at: Date.now(),
      });
    };

    window.addEventListener('presence:update', handlePresenceUpdate);

    if (socket?.connected) handleConnect();

    return () => {
      window.removeEventListener('presence:update', handlePresenceUpdate);
      handleDisconnect();
    };
  }, [onPresenceUpdate, onUnauthorized]);
}
