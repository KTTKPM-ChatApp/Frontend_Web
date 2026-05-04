import { useEffect, useState } from "react";
import { chatService } from "../service/chat-service";
import { UiMessage } from "../interface/chat-interface";
import { normalizeMessage } from "../helpers/chat.helpers";
import { useChatStore } from "../store/useChatStore";

export const usePinnedMessages = (conversationId: string) => {
  const [pinnedMessages, setPinnedMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const addPinnedMessage = useChatStore((s) => s.addPinnedMessage);

  const fetchPinnedMessages = async () => {
    if (!conversationId || !currentUserId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await chatService.fetchPinnedMessages(conversationId);
      const items = res?.payload?.data?.items || [];
      
      // Backend returns PinnedMessageDto[] with structure: { message, pinnedBy, pinnedAt }
      // Extract the message object from each item
      const messageObjects = items.map((item: any) => {
        return item.message;
      });
      
      const normalized = messageObjects.map((msg: any) => {
        return normalizeMessage(msg);
      });
      setPinnedMessages(normalized);

      // Sync pinned message IDs to Zustand store for persistence across components
      // Clear existing pinned set for this conversation
      const pinnedSet = new Set<string>();
      normalized.forEach((msg) => {
        if (msg.messageId) {
          pinnedSet.add(msg.messageId);
        }
      });

      // Update store with the fetched pinned set
      useChatStore.setState((state) => {

        // Also update message objects to have isPinned=true
        const messages = state.messagesByConversation[conversationId] || [];
        const updatedMessages = messages.map((msg) => {
          if (pinnedSet.has(msg.messageId)) {
            return { ...msg, isPinned: true, pinnedAt: msg.pinnedAt || Date.now() };
          }
          return msg;
        });

        return {
          pinnedMessagesByConversation: {
            ...state.pinnedMessagesByConversation,
            [conversationId]: pinnedSet,
          },
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: updatedMessages,
          },
        };
      });
    } catch (err: any) {
      setError(err?.message || "Không lấy được tin nhắn đã ghim");
      setPinnedMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPinnedMessages();
  }, [conversationId, currentUserId]);

  return {
    pinnedMessages,
    loading,
    error,
    refetch: fetchPinnedMessages,
  };
};
