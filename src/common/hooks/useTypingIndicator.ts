import { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { ChatTypingUpdatePayload, TypingIndicatorState } from "../interface/typing-interface";
import { createTypingIndicatorService, formatTypingIndicator } from "../service/typingIndicatorService";

type UseTypingIndicatorOptions = {
  socket: Client | null;
  conversationId: string;
  myUserId: string;
  enabled?: boolean;
  throttleMs?: number;
};

export const useTypingIndicator = ({
  socket,
  conversationId,
  myUserId,
  enabled = true,
  throttleMs = 1000,
}: UseTypingIndicatorOptions) => {
  const service = useMemo(
    () =>
      socket
        ? createTypingIndicatorService({
            socket,
            throttleMs,
          })
        : null,
    [socket, throttleMs],
  );
  const [state, setState] = useState<TypingIndicatorState>({
    users: [],
    text: "",
    visible: false,
  });
  const latestPayloadRef = useRef<ChatTypingUpdatePayload | null>(null);

  useEffect(() => {
    if (!enabled || !service) return;

    const unsubscribe = service.subscribe((payload) => {
      if (payload.conversation_id !== conversationId) {
        return;
      }

      latestPayloadRef.current = payload;
      setState(formatTypingIndicator(payload.users || [], myUserId));
    });

    return unsubscribe;
  }, [conversationId, enabled, myUserId, service]);

  return {
    typingUsers: state.users,
    typingText: state.text,
    isTypingVisible: state.visible,
    latestTypingPayload: latestPayloadRef.current,
    emitTyping: (username: string) =>
      service?.emitTyping({
        conversation_id: conversationId,
        username,
      }) || false,
  };
};
