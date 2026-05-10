export const API = {
    /* ================= AUTH ================= */
    API_AUTH_REGISTER: "/api/auth/register",
    API_AUTH_LOGIN: "/api/auth/login",
    API_AUTH_REFRESH: "/api/auth/refresh",
    API_AUTH_LOGOUT: "/api/auth/logout",
    // API_AUTH_FORGOT_PASSWORD: "/api/auth/forgot-password",
    API_AUTH_RESET_PASSWORD: "/api/auth/reset-password",

    

    /* ================= USERS ================= */
    API_USERS_ME: "/api/users/me",
    API_USERS_UPDATE_ME: "/api/users/me",
    API_USERS_SEARCH: "/api/users/search",
    API_USERS_PUBLIC_PROFILE: (userId: string) =>
        `/api/users/${userId}`,

    /* ================= FRIENDS ================= */
    API_FRIENDS_LIST: "/api/friends",
    API_FRIENDS_PENDING: "/api/friends/requests/pending",
    API_FRIENDS_SENT: "/api/friends/requests/sent",
    API_FRIENDS_SEND_REQUEST: "/api/friends/requests",
    API_FRIENDS_RESPOND_REQUEST: (requestId: string) =>
        `/api/friends/requests/${requestId}`,
    API_FRIENDS_CANCEL_REQUEST: (requestId: string) =>
        `/api/friends/requests/${requestId}`,
    API_FRIENDS_REMOVE: (friendId: string) =>
        `/api/friends/${friendId}`,
    API_FRIENDS_BLOCK: (userId: string) =>
        `/api/friends/${userId}/block`,
    API_FRIENDS_UNBLOCK: (userId: string) =>
        `/api/friends/${userId}/block`,

    /* ================= CONVERSATIONS ================= */
    API_CONVERSATIONS_LIST: "/api/conversations",
    API_CONVERSATIONS_DETAIL: (conversationId: string) =>
        `/api/conversations/${conversationId}`,
    API_CONVERSATIONS_UPDATE: (conversationId: string) =>
        `/api/conversations/${conversationId}`,
    API_CONVERSATIONS_CREATE_GROUP: "/api/conversations/group",
    API_CONVERSATIONS_DIRECT: "/api/conversations/direct",
    API_CONVERSATIONS_ADD_MEMBER: (conversationId: string) =>
        `/api/conversations/${conversationId}/members`,
    API_CONVERSATIONS_REMOVE_MEMBER: (conversationId: string, memberId: string) =>
        `/api/conversations/${conversationId}/members/${memberId}`,
    API_CONVERSATIONS_LEAVE: (conversationId: string) =>
        `/api/conversations/${conversationId}/leave`,
    API_CONVERSATIONS_UPDATE_ROLE: (conversationId: string, memberId: string) =>
        `/api/conversations/${conversationId}/members/${memberId}/role`,
    API_CONVERSATIONS_SETTINGS: (conversationId: string) =>
        `/api/conversations/${conversationId}/settings`,
    API_CONVERSATIONS_READ: (conversationId: string) =>
        `/api/conversations/${conversationId}/read`,

    /* ================= MESSAGES ================= */


    API_MESSAGES: (conversationId: string) =>
      `/api/messages/${conversationId}`,

    API_MESSAGE_DETAIL: (
      conversationId: string,
      createdAt: number | string,
      messageId: string
    ) => `/api/messages/${conversationId}/${createdAt}/${messageId}`,

    API_MESSAGE_REACTIONS: (messageId: string) =>
      `/api/messages/${messageId}/reactions`,
} as const;
