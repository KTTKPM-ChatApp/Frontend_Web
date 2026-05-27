import { io, Socket } from "socket.io-client";
import { useChatStore } from "../store/useChatStore";
import { usePresenceStore } from "../store/usePresenceStore";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4321";

let socket: Socket | null = null;
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Socket.IO presence connection — FALLBACK ONLY.
 * Primary presence comes via STOMP /topic/presence-updates (socket.ts).
 * This Socket.IO client connects after a 5s delay and only serves as backup
 * to catch presence events that STOMP might miss during reconnection.
 */
export function connectPresenceSocket(accessToken: string) {
  if (socket?.connected) return socket;

  // Delay Socket.IO connection to prioritize STOMP
  if (fallbackTimer) clearTimeout(fallbackTimer);

  fallbackTimer = setTimeout(() => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    socket = io(apiBaseUrl, {
      path: "/socket.io",
      auth: { token: `Bearer ${accessToken}` },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 10000,
      reconnectionAttempts: 3,
    });

    socket.on("connect", () => {
      console.log("[PresenceSocket] connected as fallback");
    });

    socket.on("presence:online", (data: { userId: string }) => {
      const userId = data?.userId;
      if (!userId) return;

      usePresenceStore.getState().updatePresence(userId, {
        user_id: userId,
        status: "online",
        last_seen_at: Date.now(),
      });

      useChatStore.setState((state) => {
        if (state.onlineUserIds.includes(userId)) return state;
        return { onlineUserIds: [...state.onlineUserIds, userId] };
      });
    });

    socket.on("presence:offline", (data: { userId: string }) => {
      const userId = data?.userId;
      if (!userId) return;

      usePresenceStore.getState().updatePresence(userId, {
        user_id: userId,
        status: "offline",
        last_seen_at: Date.now(),
      });

      useChatStore.setState((state) => {
        if (!state.onlineUserIds.includes(userId)) return state;
        return { onlineUserIds: state.onlineUserIds.filter(id => id !== userId) };
      });
    });

    socket.on("disconnect", (reason: string) => {
      console.log("[PresenceSocket] disconnected:", reason);
    });

    socket.on("connect_error", (err: Error) => {
      console.warn("[PresenceSocket] connect error:", err.message);
    });
  }, 5000);

  return undefined;
}

export function disconnectPresenceSocket() {
  if (fallbackTimer) {
    clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getPresenceSocket() {
  return socket;
}
