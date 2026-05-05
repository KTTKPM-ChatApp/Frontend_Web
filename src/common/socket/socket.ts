import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

let stompClient: Client | null = null;
let currentUserId: string | null = null;

export const connectSocket = (accessToken?: string, userId?: string) => {
  if (!stompClient) {
    const socket = new SockJS(`${socketUrl}/ws`);
    
    stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : {},
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
      console.log('STOMP connected:', frame);
      console.log('STOMP connected headers:', frame.headers);
      
      // Subscribe to private messages for this user
      if (currentUserId) {
        stompClient?.subscribe(`/user/${currentUserId}/queue/messages`, (message) => {
          console.log('Received private message:', message);
          const messageData = JSON.parse(message.body);
          // Trigger message event for frontend
          const event = new CustomEvent('chat:new', { detail: messageData });
          window.dispatchEvent(event);
        });

        // Subscribe to presence updates
        stompClient?.subscribe('/topic/presence-updates', (message) => {
          console.log('Received presence update:', message);
          const presenceData = JSON.parse(message.body);
          // Trigger presence event for frontend
          const event = new CustomEvent('presence:update', { detail: presenceData });
          window.dispatchEvent(event);
        });
      }
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      const event = new CustomEvent('socket:error', { detail: frame });
      window.dispatchEvent(event);
    };

    stompClient.onDisconnect = (frame) => {
      console.log('STOMP disconnected:', frame);
      const event = new CustomEvent('socket:disconnect', { detail: frame });
      window.dispatchEvent(event);
    };
  }

  currentUserId = userId || null;

  if (!stompClient.connected) {
    console.log('STOMP connecting with headers:', accessToken ? { Authorization: `Bearer ${accessToken}` } : {});
    stompClient.activate();
  }

  return stompClient;
};

export const getSocket = () => stompClient;

export const disconnectSocket = () => {
  if (!stompClient) return;
  if (stompClient.connected) {
    stompClient.deactivate();
  }
  stompClient = null;
  currentUserId = null;
};

export const sendSocketMessage = (destination: string, body: any) => {
  if (!stompClient || !stompClient.connected) {
    console.warn('Socket not connected, cannot send message');
    return false;
  }
  
  try {
    stompClient.publish({
      destination,
      body: JSON.stringify(body)
    });
    return true;
  } catch (error) {
    console.error('Failed to send socket message:', error);
    return false;
  }
};