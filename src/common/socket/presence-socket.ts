import { io, Socket } from "socket.io-client";
import { useChatStore } from "../store/useChatStore";
import { usePresenceStore } from "../store/usePresenceStore";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4321";

let socket: Socket | null = null;

export function connectPresenceSocket(accessToken: string) {
  if (socket?.connected) return socket;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(apiBaseUrl, {
    path: "/socket.io",
    auth: { token: `Bearer ${accessToken}` },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 5000,
  });

  socket.on("connect", () => {
    console.log("[PresenceSocket] connected to gateway");
  });

  socket.on("presence:online", (data: { userId: string }) => {
    const userId = data?.userId;
    if (!userId) return;
    console.log("[PresenceSocket] online:", userId);

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
    console.log("[PresenceSocket] offline:", userId);

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

  return socket;
}

export function disconnectPresenceSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getPresenceSocket() {
  return socket;
}