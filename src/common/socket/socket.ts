import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { handleCallSignal } from "../action/call.action";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

let stompClient: Client | null = null;
let currentUserId: string | null = null;
const conversationSubscriptions = new Map<string, Map<string, any>>();

const dispatchChatEvent = (eventName: string, body: string) => {
  try {
    const data = JSON.parse(body);
    const event = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent(event);
  } catch (err) {
    console.error(`Failed to parse ${eventName} event:`, err);
  }
};

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
      console.log("[STOMP] CONNECTED successfully!");
      console.log("[STOMP] currentUserId:", currentUserId);
      window.dispatchEvent(new CustomEvent("socket:connect"));

      if (currentUserId) {
        stompClient?.subscribe(
          "/user/queue/messages",
          (message: IMessage) => {
            dispatchChatEvent("chat:new", message.body);
          },
        );

        stompClient?.subscribe(
          "/user/queue/conversations",
          (message: IMessage) => {
            dispatchChatEvent("conversation:created", message.body);
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
            console.log('[STOMP presence-updates] raw message.body:', message.body);
            try {
              const data = JSON.parse(message.body);
              console.log('[STOMP presence-updates] parsed:', JSON.stringify(data));
              const event = new CustomEvent("presence:update", {
                detail: data,
              });
              window.dispatchEvent(event);
            } catch (err) {
              console.error("Failed to parse presence update:", err);
            }
          },
        );

        stompClient?.subscribe(
          "/user/queue/calls",
          (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              console.log('[STOMP incoming call]', data);
              const convId = data.conversation_id;
              if (convId) {
                let subs = conversationSubscriptions.get(convId);
                if (!subs) {
                  subs = new Map();
                  conversationSubscriptions.set(convId, subs);
                }
                if (!subs.has("call")) {
                  const callSub = stompClient!.subscribe(
                    `/topic/conv.${convId}/call`,
                    (msg: IMessage) => {
                      try {
                        const callData = JSON.parse(msg.body);
                        if (callData.type === "incoming_call" || callData.type === "incoming_group_call") {
                          const event = new CustomEvent("call:incoming", { detail: callData });
                          window.dispatchEvent(event);
                        } else if (
                          callData.type === "sfu-peer-joined" ||
                          callData.type === "sfu-peer-left" ||
                          callData.type === "sfu-active-speaker" ||
                          callData.type === "sfu-transport-state"
                        ) {
                          const event = new CustomEvent("sfu:signal", { detail: callData });
                          window.dispatchEvent(event);
                        } else {
                          handleCallSignal(callData);
                        }
                      } catch {}
                    },
                  );
                  subs.set("call", callSub);
                }
              }
              const event = new CustomEvent("call:incoming", { detail: data });
              window.dispatchEvent(event);
            } catch (err) {
              console.error("Failed to parse incoming call:", err);
            }
          },
        );
      }

      const previousConversationIds = Array.from(conversationSubscriptions.keys());
      conversationSubscriptions.clear();
      previousConversationIds.forEach((conversationId) => subscribeToConversation(conversationId));
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

function subscribeIfMissing(conversationId: string, key: string, destination: string, handler: (msg: IMessage) => void) {
  let subs = conversationSubscriptions.get(conversationId);
  if (!subs) {
    subs = new Map();
    conversationSubscriptions.set(conversationId, subs);
  }
  if (subs.has(key)) return;
  const sub = stompClient!.subscribe(destination, handler);
  subs.set(key, sub);
}

export const subscribeToConversation = (conversationId: string) => {
  if (!stompClient || !stompClient.connected || !conversationId) return;

  subscribeIfMissing(conversationId, "typing", `/topic/conv.${conversationId}/typing`, (message) => {
    try {
      const data = JSON.parse(message.body);
      const eventName = data.typing ? "chat:typing" : "chat:stop_typing";
      const event = new CustomEvent(eventName, { detail: data });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Failed to parse typing event:", err);
    }
  });

  subscribeIfMissing(conversationId, "read", `/topic/conv.${conversationId}/read`, (message) => {
    try {
      const data = JSON.parse(message.body);
      const event = new CustomEvent("message:read", { detail: data });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Failed to parse read receipt:", err);
    }
  });

  subscribeIfMissing(conversationId, "delete", `/topic/conv.${conversationId}/delete`, (message) => {
    try {
      const data = JSON.parse(message.body);
      const event = new CustomEvent("chat:deleted", { detail: data });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Failed to parse delete event:", err);
    }
  });

  subscribeIfMissing(conversationId, "pin", `/topic/conv.${conversationId}/pin`, (message) => {
    try {
      const data = JSON.parse(message.body);
      const eventName = data.pinned ? "chat:pinned" : "chat:unpinned";
      const event = new CustomEvent(eventName, { detail: data });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Failed to parse pin event:", err);
    }
  });

  subscribeIfMissing(conversationId, "system", `/topic/conv.${conversationId}/system`, (message) => {
    try {
      const data = JSON.parse(message.body);
      const event = new CustomEvent("chat:system-message", { detail: data });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Failed to parse system event:", err);
    }
  });

  subscribeIfMissing(conversationId, "messages", `/topic/conv.${conversationId}/messages`, (message) => {
    try {
      const data = JSON.parse(message.body);
      const event = new CustomEvent("chat:new", { detail: data });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Failed to parse new message event:", err);
    }
  });

  subscribeIfMissing(conversationId, "reaction", `/topic/conv.${conversationId}/reaction`, (message) => {
    try {
      const data = JSON.parse(message.body);
      const event = new CustomEvent("chat:reaction", { detail: data });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Failed to parse reaction event:", err);
    }
  });

  subscribeIfMissing(conversationId, "call", `/topic/conv.${conversationId}/call`, (message) => {
    try {
      const data = JSON.parse(message.body);
      if (data.type === "incoming_call" || data.type === "incoming_group_call") {
        const event = new CustomEvent("call:incoming", { detail: data });
        window.dispatchEvent(event);
      } else if (
        data.type === "sfu-peer-joined" ||
        data.type === "sfu-peer-left" ||
        data.type === "sfu-active-speaker" ||
        data.type === "sfu-transport-state"
      ) {
        const event = new CustomEvent("sfu:signal", { detail: data });
        window.dispatchEvent(event);
      } else {
        handleCallSignal(data);
      }
    } catch (err) {
      console.error("Failed to parse call event:", err);
    }
  });
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
