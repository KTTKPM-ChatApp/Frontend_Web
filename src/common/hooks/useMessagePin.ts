import { useCallback } from 'react';
import { useChatStore } from '../store/useChatStore';
import { chatService } from '../service/chat-service';

/**
 * Custom hook for message pin/unpin operations
 * Handles optimistic updates and socket synchronization
 */
export const useMessagePin = () => {
  const {
    addPinnedMessage,
    removePinnedMessage,
    isMessagePinned,
    updateMessage,
    currentUserId,
  } = useChatStore();

  /**
   * Pin a message with optimistic update
   * Flow:
   * 1. Optimistic update: add to pinned set locally
   * 2. Call API
   * 3. On success: socket will confirm (no action needed)
   * 4. On error: revert optimistic update
   */
  const pinMessage = useCallback(
    async (conversationId: string, createdAt: number, messageId: string) => {
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      // Check if already pinned to avoid duplicate
      if (isMessagePinned(conversationId, messageId)) {
        return;
      }

      // Optimistic update
      addPinnedMessage(conversationId, messageId);
      updateMessage(conversationId, messageId, {
        isPinned: true,
        pinnedAt: Date.now(),
      });

      try {
        const response = await chatService.pinMessage(conversationId, createdAt, messageId);
        // Success - socket will emit chat:message:pinned
        // No additional action needed - socket handler will sync
      } catch (error: any) {
        // Show error notification
        const errorMessage = error?.response?.data?.message || error?.message || 'Không thể ghim tin nhắn';
        alert(errorMessage);
        // Revert optimistic update on error
        removePinnedMessage(conversationId, messageId);
        updateMessage(conversationId, messageId, {
          isPinned: false,
          pinnedAt: undefined,
        });
        throw error;
      }
    },
    [isMessagePinned, addPinnedMessage, updateMessage, removePinnedMessage, currentUserId],
  );

  /**
   * Unpin a message with optimistic update
   * Flow:
   * 1. Optimistic update: remove from pinned set locally
   * 2. Call API
   * 3. On success: socket will confirm (no action needed)
   * 4. On error: revert optimistic update
   */
  const unpinMessage = useCallback(
    async (conversationId: string, createdAt: number, messageId: string) => {
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      // Check if not pinned to avoid unnecessary call
      if (!isMessagePinned(conversationId, messageId)) {
        return;
      }

      // Optimistic update
      removePinnedMessage(conversationId, messageId);
      updateMessage(conversationId, messageId, {
        isPinned: false,
        pinnedAt: undefined,
      });

      try {
        await chatService.unpinMessage(conversationId, createdAt, messageId);
        // Success - socket will emit chat:message:unpinned
        // No additional action needed - socket handler will sync
      } catch (error: any) {
        // Show error notification
        const errorMessage = error?.response?.data?.message || error?.message || 'Không thể bỏ ghim tin nhắn';
        alert(errorMessage);
        // Revert optimistic update
        addPinnedMessage(conversationId, messageId);
        updateMessage(conversationId, messageId, {
          isPinned: true,
          pinnedAt: Date.now(),
        });
        throw error;
      }
    },
    [isMessagePinned, removePinnedMessage, updateMessage, addPinnedMessage, currentUserId],
  );

  /**
   * Toggle pin status of a message
   */
  const togglePin = useCallback(
    async (conversationId: string, createdAt: number, messageId: string) => {
      if (isMessagePinned(conversationId, messageId)) {
        await unpinMessage(conversationId, createdAt, messageId);
      } else {
        await pinMessage(conversationId, createdAt, messageId);
      }
    },
    [isMessagePinned, pinMessage, unpinMessage],
  );

  return {
    pinMessage,
    unpinMessage,
    togglePin,
    isMessagePinned,
  };
};

export default useMessagePin;
