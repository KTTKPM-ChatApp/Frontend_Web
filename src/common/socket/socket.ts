import { io, Socket } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

let socketInstance: Socket | null = null;

export const connectSocket = (accessToken?: string) => {
  if (!socketInstance) {
    socketInstance = io(socketUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      path: "/socket.io",
    });

    socketInstance.on("connect", () => {
      console.log("[Socket] Connected:", socketInstance?.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message, err);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });
  }

  if (accessToken) {
    socketInstance.auth = {
      token: `Bearer ${accessToken}`,
    };
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (!socketInstance) return;
  socketInstance.removeAllListeners();
  socketInstance.disconnect();
  socketInstance = null;
};