export const API = {
    /* ================= AUTH ================= */
    API_AUTH_REGISTER: "/api/auth/register",
    API_AUTH_LOGIN: "/api/auth/login",
    API_AUTH_REFRESH: "/api/auth/refresh",
    API_AUTH_LOGOUT: "/api/auth/logout",

    /* ================= USERS ================= */
    API_USERS_ME: "/api/users/me",
    API_USERS_SEARCH: "/api/users/search",
    API_USERS_PUBLIC_PROFILE: (userId: string) => `/api/users/${userId}`,

    /* ================= CONVERSATIONS ================= */
    API_CONVERSATIONS_LIST: "/api/conversations",
    API_CONVERSATIONS_DETAIL: (conversationId: string) => `/api/conversations/${conversationId}`,
    API_CONVERSATIONS_CREATE: "/api/conversations",
    API_CONVERSATIONS_MESSAGES: (conversationId: string) => `/api/conversations/${conversationId}/messages`,
    API_CONVERSATIONS_SEND_MESSAGE: (conversationId: string) => `/api/conversations/${conversationId}/messages`,
} as const;
