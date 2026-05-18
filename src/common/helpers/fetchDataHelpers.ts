import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { userService } from "../service/user-service";
import { getRefreshToken, getSessionToken } from "../utilities/utils";

/**
 * FETCH AUTH DATA từ server
 * Gọi hàm này trong useEffect của auth-related pages
 */
export const fetchAuthData = async () => {
    try {
        const authStore = useAuthStore.getState();
        authStore.setLoadingAuth(true);
        authStore.setErrorAuth(null);
        const userData = await userService.userGetMe();
        // Backend returns raw user object directly (not wrapped in { data: {...} })
        const rawPayload = userData?.payload as any;
        const user = rawPayload?.data ?? rawPayload ?? null;
        if (user?.id) {
            authStore.setAuthData({
                success: true,
                data: {
                    accessToken: String(getSessionToken()),
                    refreshToken: String(getRefreshToken()),
                    user: {
                        ...user,
                        avatarUrl: user.avatarUrl ?? undefined,
                    },
                },
                meta: rawPayload?.meta ?? null,
                message: rawPayload?.message,
                timestamp: rawPayload?.timestamp,
            });
        }
    } catch (error: unknown) {
        console.error("Failed to fetch auth data:", error);
        useAuthStore
            .getState()
            .setErrorAuth((error as Error)?.message || "Lỗi khi tải thông tin người dùng");
    } finally {
        useAuthStore.getState().setLoadingAuth(false);
    }
};
/**
 * FETCH CONVERSATIONS từ server
 * Gọi hàm này trong useEffect của chat/message pages
 */
export const fetchConversations = async (params = { page: 1, limit: 20 }) => {
    try {
        useChatStore.getState().setConversationLoading(true);
        useChatStore.getState().setError(null);

        // Gọi method từ store
        await useChatStore.getState().fetchListConversation(params);

        // Set active conversation nếu có
        const { listConversation } = useChatStore.getState();
        if (listConversation.length > 0) {
            useChatStore.getState().setActiveConversationId(listConversation[0]?.id || null);
        }
    } catch (error: unknown) {
        console.error("Failed to fetch conversations:", error);
        useChatStore.getState().setError((error as Error)?.message || "Không thể tải danh sách cuộc trò chuyện");
    }
};

/**
 * FETCH ALL DATA (Auth + Chat)
 * Gọi hàm này trong root layout hoặc main page khi cần fetch toàn bộ dữ liệu
 */
export const fetchAllData = async () => {
    try {
        // Fetch auth data first
        await fetchAuthData();

        // Sau đó fetch conversations
        await fetchConversations();
    } catch (error) {
        console.error("Failed to fetch all data:", error);
    }
};
