import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { authService } from "../service/auth-service";

/**
 * Initialize stores by fetching latest data from server on app mount
 * This ensures data is synced with server after page refresh
 *
 * Call this in the app initialization (e.g., in Providers component with useEffect)
 */
export const initializeStores = async () => {
  try {
    const tokenData = useAuthStore.getState().tokenData;
    const chatState = useChatStore.getState();

    // If user has token, refresh auth data from server
    if (tokenData?.accessToken) {
      try {
        const response = await authService.authRefresh({
          refreshToken: tokenData.refreshToken,
        });

        if (response.data?.data?.user) {
          useAuthStore.getState().setAuthData(response.data);
          useAuthStore.getState().setTokenData(response.data.data.tokens);
        }
      } catch (error) {
        console.warn("Failed to refresh auth data:", error);
        // If refresh fails, keep the old data from localStorage
      }
    }

    // Fetch conversations list if user is authenticated
    if (tokenData?.accessToken && !chatState.conversationFetched) {
      try {
        // Use the fetchListConversation method from store
        await useChatStore.getState().fetchListConversation({ page: 1, limit: 20 });

        // Set first conversation as active if available
        const updatedState = useChatStore.getState();
        if (updatedState.listConversation.length > 0) {
          useChatStore.getState().setActiveConversationId(updatedState.listConversation[0]?.id);
        }
      } catch (error) {
        console.warn("Failed to fetch conversations:", error);
        useChatStore.getState().setError("Không thể tải danh sách cuộc trò chuyện");
      }
    }
  } catch (error) {
    console.error("Error initializing stores:", error);
  }
};
