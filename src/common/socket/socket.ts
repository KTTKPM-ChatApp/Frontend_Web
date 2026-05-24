import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

let stompClient: Client | null = null;
let currentUserId: string | null = null;
const conversationSubscriptions = new Map<string, any[]>();

export const connectSocket = (accessToken?: string, userId?: string) => {
  currentUserId = userId || null;

  if (stompClient && stompClient.connected) {
    return stompClient;
  }

  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${socketUrl}/ws`),
    connectHeaders: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
    debug: (str) => console.log("[STOMP]", str),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      console.log("STOMP connected");

      if (currentUserId) {
        stompClient?.subscribe(
          `/user/${currentUserId}/queue/messages`,
          (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              const event = new CustomEvent("chat:new", { detail: data });
              window.dispatchEvent(event);
            } catch (err) {
              console.error("Failed to parse user message:", err);
            }
          },
        );

        stompClient?.subscribe(
          "/topic/new-conversations",
          (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              console.log("[new-conversations raw]", JSON.stringify(data));
              const event = new CustomEvent("conversation:created", { detail: data });
              window.dispatchEvent(event);
            } catch (err) {
              console.error("Failed to parse conversation notification:", err);
            }
          },
        );

        stompClient?.subscribe(
          `/topic/user-messages/${currentUserId}`,
          (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              const event = new CustomEvent("chat:new", { detail: data });
              window.dispatchEvent(event);
            } catch (err) {
              console.error("Failed to parse user message notification:", err);
            }
          },
        );

        stompClient?.subscribe(
          `/topic/user-conversations/${currentUserId}`,
          (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              if (data.type === "MEMBER_REMOVED") {
                const event = new CustomEvent("conversation:removed", { detail: data });
                window.dispatchEvent(event);
              }
            } catch (err) {
              console.error("Failed to parse user conversation event:", err);
            }
          },
        );

        stompClient?.subscribe(
          "/topic/presence-updates",
          (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              const event = new CustomEvent("presence:update", {
                detail: data,
              });
              window.dispatchEvent(event);
            } catch (err) {
              console.error("Failed to parse presence update:", err);
            }
          },
        );
      }
    },
    onStompError: (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
      const event = new CustomEvent("socket:error", {
        detail: { message: frame.headers["message"] },
      });
      window.dispatchEvent(event);
    },
    onWebSocketClose: (event) => {
      console.log("STOMP disconnected:", event.reason);
      const evt = new CustomEvent("socket:disconnect", {
        detail: event.reason,
      });
      window.dispatchEvent(evt);
    },
  });

  stompClient.activate();
  return stompClient;
};

export const getSocket = () => stompClient;

export const disconnectSocket = () => {
  conversationSubscriptions.forEach((subs) => {
    subs.forEach((sub) => sub.unsubscribe());
  });
  conversationSubscriptions.clear();

  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
  currentUserId = null;
};

export const sendSocketMessage = (destination: string, body: any): boolean => {
  if (!stompClient || !stompClient.connected) {
    console.warn("STOMP not connected, cannot send message");
    return false;
  }

  try {
    stompClient.publish({
      destination,
      body: JSON.stringify(body),
    });
    return true;
  } catch (error) {
    console.error("Failed to send STOMP message:", error);
    return false;
  }
};

export const subscribeToConversation = (conversationId: string) => {
  if (!stompClient || !stompClient.connected || !conversationId) return;
  if (conversationSubscriptions.has(conversationId)) return;

  const typingSub = stompClient.subscribe(
    `/topic/conv.${conversationId}/typing`,
    (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const eventName = data.typing ? "chat:typing" : "chat:stop_typing";
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
      } catch (err) {
        console.error("Failed to parse typing event:", err);
      }
    },
  );

  const readSub = stompClient.subscribe(
    `/topic/conv.${conversationId}/read`,
    (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const event = new CustomEvent("message:read", { detail: data });
        window.dispatchEvent(event);
      } catch (err) {
        console.error("Failed to parse read receipt:", err);
      }
    },
  );

  const deleteSub = stompClient.subscribe(
    `/topic/conv.${conversationId}/delete`,
    (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const event = new CustomEvent("chat:deleted", { detail: data });
        window.dispatchEvent(event);
      } catch (err) {
        console.error("Failed to parse delete event:", err);
      }
    },
  );

  const pinSub = stompClient.subscribe(
    `/topic/conv.${conversationId}/pin`,
    (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const eventName = data.pinned ? "chat:pinned" : "chat:unpinned";
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
      } catch (err) {
        console.error("Failed to parse pin event:", err);
      }
    },
  );

  const systemSub = stompClient.subscribe(
    `/topic/conv.${conversationId}/system`,
    (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const event = new CustomEvent("chat:system-message", { detail: data });
        window.dispatchEvent(event);
      } catch (err) {
        console.error("Failed to parse system event:", err);
      }
    },
  );

  const messageSub = stompClient.subscribe(
    `/topic/conv.${conversationId}/messages`,
    (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const event = new CustomEvent("chat:new", { detail: data });
        window.dispatchEvent(event);
      } catch (err) {
        console.error("Failed to parse new message event:", err);
      }
    },
  );

  conversationSubscriptions.set(conversationId, [typingSub, readSub, deleteSub, pinSub, systemSub, messageSub]);
};

export const unsubscribeFromConversation = (conversationId: string) => {
  const subs = conversationSubscriptions.get(conversationId);
  if (subs) {
    subs.forEach((sub) => sub.unsubscribe());
    conversationSubscriptions.delete(conversationId);
  }
};

export const joinConversation = (conversationId: string) => {
  if (stompClient?.connected) {
    sendSocketMessage("/app/chat/join", {
      conversation_id: conversationId,
    });
  }
};

export const sendTyping = (conversationId: string) => {
  if (stompClient?.connected) {
    sendSocketMessage("/app/chat/typing", {
      conversation_id: conversationId,
    });
  }
};

export const stopTyping = (conversationId: string) => {
  if (stompClient?.connected) {
    sendSocketMessage("/app/chat/stop_typing", {
      conversation_id: conversationId,
    });
  }
};
