import { io, Socket } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4321";

let socket: Socket | null = null;
let currentUserId: string | null = null;

export const connectSocket = (accessToken?: string, userId?: string) => {
  currentUserId = userId || null;

  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(socketUrl, {
    path: "/socket.io",
    auth: {
      token: accessToken ? `Bearer ${accessToken}` : "",
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 5000,
    withCredentials: false,
  });

  socket.on("connect", () => {
    console.log("Socket.IO connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket.IO connection error:", err.message);
    const event = new CustomEvent("socket:error", { detail: err });
    window.dispatchEvent(event);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket.IO disconnected:", reason);
    const event = new CustomEvent("socket:disconnect", { detail: reason });
    window.dispatchEvent(event);
  });

  // Forward real-time events to window CustomEvents
  socket.on("chat:new", (data) => {
    const event = new CustomEvent("chat:new", { detail: data });
    window.dispatchEvent(event);
  });

  socket.on("chat:typing", (data) => {
    const event = new CustomEvent("chat:typing", { detail: data });
    window.dispatchEvent(event);
  });

  socket.on("chat:stop_typing", (data) => {
    const event = new CustomEvent("chat:stop_typing", { detail: data });
    window.dispatchEvent(event);
  });

  socket.on("presence:online", (data) => {
    const event = new CustomEvent("presence:update", {
      detail: { ...data, online: true },
    });
    window.dispatchEvent(event);
  });

  socket.on("presence:offline", (data) => {
    const event = new CustomEvent("presence:update", {
      detail: { ...data, online: false },
    });
    window.dispatchEvent(event);
  });

  socket.on("message:read", (data) => {
    const event = new CustomEvent("message:read", { detail: data });
    window.dispatchEvent(event);
  });

  socket.on("conversation:created", (data) => {
    const event = new CustomEvent("conversation:created", { detail: data });
    window.dispatchEvent(event);
  });

  if (socket.connect) socket.connect();

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
  currentUserId = null;
};

export const sendSocketMessage = (
  destination: string,
  body: any
): boolean => {
  if (!socket || !socket.connected) {
    console.warn("Socket not connected, cannot send message");
    return false;
  }

  try {
    // Map StompJS-style destinations to Socket.IO events
    // e.g. "/app/chat.send" -> "chat:send"
    const event = destination.replace("/app/", "").replace(".", ":");
    socket.emit(event, body);
    return true;
  } catch (error) {
    console.error("Failed to send socket message:", error);
    return false;
  }
};

/** Join a conversation room */
export const joinConversation = (conversationId: string) => {
  if (socket?.connected) {
    socket.emit("chat:join", { conversation_id: conversationId });
  }
};

/** Send a typing indicator */
export const sendTyping = (conversationId: string) => {
  if (socket?.connected) {
    socket.emit("chat:typing", { conversation_id: conversationId });
  }
};

/** Stop typing indicator */
export const stopTyping = (conversationId: string) => {
  if (socket?.connected) {
    socket.emit("chat:stop_typing", { conversation_id: conversationId });
  }
};