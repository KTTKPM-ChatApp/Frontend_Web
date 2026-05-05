import { getSocket } from "../socket/socket";
import { syncCallState } from "./call-service";
import { useCallStore } from "../store/useCallStore";

let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Handles call state synchronization after socket reconnection
 */
export function handleCallReconnect(): void {
  const socket = getSocket();
  if (!socket) return;

  // Clear any existing timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // STOMP client doesn't have .on() method - call reconnect disabled
  // When socket reconnects, sync call state for active conversations
  // socket.on("connect", () => {
  //   syncCallStates();
  // });

  // Handle extended disconnection during active call
  // socket.on("disconnect", (reason) => {
  //   const { activeCall, screen } = useCallStore.getState();
  //   
  //   if (activeCall && (screen === "active" || screen === "connecting")) {
  //     // If disconnected for more than 30s during active call, end via HTTP
  //     reconnectTimeout = setTimeout(() => {
  //       if (!socket.connected) {
  //         endCallViaHttp(activeCall.call_id, activeCall.conversation_id);
  //       }
  //     }, 30000);
  //   }
  // });
}

/**
 * Sync call state for all conversations with active calls
 */
function syncCallStates(): void {
  const { activeCall } = useCallStore.getState();
  
  if (activeCall) {
    syncCallState(activeCall.conversation_id);
  }
}

/**
 * HTTP fallback to end call when socket is unavailable
 */
async function endCallViaHttp(callId: string, conversationId: string): Promise<void> {
  try {
    const { API } = await import("../api/path");
    const http = await import("../api/http");
    
    await http.default.post(API.API_CONVERSATION_CALL_END(conversationId, callId));
    
    // Clean up local state
    const { cleanup } = await import("./call-service");
    cleanup();
  } catch (error) {
    // Failed to end call via HTTP
  }
}

/**
 * Clean up reconnect handlers
 */
export function cleanupReconnectHandlers(): void {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
}
