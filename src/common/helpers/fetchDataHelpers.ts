import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { authService } from "../service/auth-service";
import { userService } from "../service/user-service";
import { getRefreshToken, getSessionToken, getTokenExpiresIn } from "../utilities/utils";
import { string } from "yup";

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
        
        if (userData?.ok && userData?.payload) {
            const user = userData.payload;
            authStore.setAuthData({
                success: true,
                data: {
                    user: {
                        ...user,
                        avatarUrl: user.avatarUrl ?? null,
                    },
                    tokens: authStore.authData?.data?.tokens ?? {
                        accessToken: String(getSessionToken()),
                        refreshToken: String(getRefreshToken()) ,
                        expiresIn: Number(getTokenExpiresIn()),
                    },
                },
                meta: null,
                message: userData?.payload?.message,
                timestamp: userData?.payload?.timestamp,
            });
        }
    } catch (error: any) {
        console.error("Failed to fetch auth data:", error);
        useAuthStore
            .getState()
            .setErrorAuth(error?.message || "Lỗi khi tải thông tin người dùng");
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
        console.log('fetchConversations called with params:', params);
        await useChatStore.getState().fetchListConversation(params);

        // Set active conversation nếu có
        const { listConversation } = useChatStore.getState();
        if (listConversation.length > 0) {
            useChatStore.getState().setActiveConversationId(listConversation[0]?.id || null);
        }
    } catch (error: any) {
        console.error("Failed to fetch conversations:", error);
        useChatStore.getState().setError(error?.message || "Không thể tải danh sách cuộc trò chuyện");
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
