import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { authService } from "../service/auth-service";

export const initializeStores = async () => {
  try {
    const authState = useAuthStore.getState();
    const authData = authState.authData;
    const chatState = useChatStore.getState();

    const accessToken = authData?.data?.accessToken;
    const refreshToken = authData?.data?.refreshToken;

    if (accessToken && refreshToken) {
      try {
        const response = await authService.authRefresh({ refreshToken });
        const refreshData = response?.payload?.data;
        if (refreshData?.accessToken && authData) {
          const updatedAuth = {
            ...authData,
            data: {
              ...authData.data!,
              accessToken: refreshData.accessToken,
              refreshToken: refreshData.refreshToken ?? refreshToken,
            },
          };
          useAuthStore.getState().setAuthData(updatedAuth);
        }
      } catch (error) {
        console.warn("Failed to refresh token:", error);
      }
    }

    if (accessToken && !chatState.conversationFetched) {
      try {
        await useChatStore.getState().fetchListConversation({ page: 1, limit: 20 });

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
