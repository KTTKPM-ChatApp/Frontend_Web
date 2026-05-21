export const API = {
    /* ================= AUTH ================= */
    API_AUTH_REGISTER: "/api/auth/register",
    API_AUTH_LOGIN: "/api/auth/login",
    API_AUTH_REFRESH: "/api/auth/refresh",
    API_AUTH_LOGOUT: "/api/auth/logout",
    API_AUTH_CHANGE_PASSWORD: "/api/auth/change-password",
    API_AUTH_RESET_PASSWORD: "/api/auth/reset-password",
    // API_AUTH_FORGOT_PASSWORD: "/api/auth/forgot-password",

    

    /* ================= USERS ================= */
    API_USERS_ME: "/api/users/me",
    API_USERS_UPDATE_ME: "/api/users/me",
    API_USERS_SEARCH: "/api/users/search",
    API_USERS_PUBLIC_PROFILE: (userId: string) =>
        `/api/users/${userId}`,

    /* ================= PRESENCE ================= */
    API_PRESENCE_ONLINE: "/api/presence/online",

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
    API_CONVERSATIONS_CREATE: "/api/conversations",
    API_CONVERSATIONS_DETAIL: (conversationId: string) =>
        `/api/conversations/${conversationId}`,
    API_CONVERSATIONS_UPDATE: (conversationId: string) =>
        `/api/conversations/${conversationId}`,
    API_CONVERSATIONS_CREATE_GROUP: "/api/conversations/group",
    API_CONVERSATIONS_DIRECT: "/api/conversations/direct",
    
    // Member Management
    API_CONVERSATIONS_ADD_MEMBER: (conversationId: string) =>
        `/api/conversations/${conversationId}/members`,
    API_CONVERSATIONS_REMOVE_MEMBER: (conversationId: string, memberId: string) =>
        `/api/conversations/${conversationId}/members/${memberId}`,
    API_CONVERSATIONS_LEAVE: (conversationId: string) =>
        `/api/conversations/${conversationId}/leave`,
    API_CONVERSATIONS_MEMBERS: (conversationId: string) =>
        `/api/conversations/${conversationId}/members`,
    API_CONVERSATIONS_UPDATE_ROLE: (conversationId: string, memberId: string) =>
        `/api/conversations/${conversationId}/members/${memberId}/role`,
    API_CONVERSATIONS_TRANSFER_OWNERSHIP: (conversationId: string) =>
        `/api/conversations/${conversationId}/transfer-ownership`,
    API_CONVERSATIONS_SETTINGS: (conversationId: string) =>
        `/api/conversations/${conversationId}/settings`,
    API_CONVERSATIONS_READ: (conversationId: string) =>
        `/api/conversations/${conversationId}/read`,
    
    // Pin Management
    API_CONVERSATIONS_PIN: (conversationId: string) =>
        `/api/conversations/${conversationId}/pin`,
    API_CONVERSATIONS_UNPIN: (conversationId: string) =>
        `/api/conversations/${conversationId}/pin`,
    
    // Group Settings
    API_CONVERSATIONS_GROUP_SETTINGS: (conversationId: string) =>
        `/api/conversations/${conversationId}/group-settings`,
    API_CONVERSATIONS_DISBAND: (conversationId: string) =>
        `/api/conversations/${conversationId}/disband`,
    
    // Invitation Management
    API_CONVERSATIONS_INVITES_SEND: (conversationId: string) =>
        `/api/conversations/${conversationId}/invites`,
    API_CONVERSATIONS_INVITES_PENDING: "/api/conversations/invites/pending",
    API_CONVERSATIONS_INVITES_ACCEPT: (conversationId: string, inviteId: string) =>
        `/api/conversations/${conversationId}/invites/${inviteId}/accept`,
    API_CONVERSATIONS_INVITES_REJECT: (conversationId: string, inviteId: string) =>
        `/api/conversations/${conversationId}/invites/${inviteId}/reject`,
    API_CONVERSATIONS_INVITES_CANCEL: (conversationId: string, inviteId: string) =>
        `/api/conversations/${conversationId}/invites/${inviteId}/cancel`,
    
    // Poll Management
    API_CONVERSATIONS_POLLS_LIST: (conversationId: string) =>
        `/api/conversations/${conversationId}/polls`,
    API_CONVERSATIONS_POLLS_CREATE: (conversationId: string) =>
        `/api/conversations/${conversationId}/polls`,
    API_CONVERSATIONS_POLLS_DETAIL: (conversationId: string, pollId: string) =>
        `/api/conversations/${conversationId}/polls/${pollId}`,
    API_CONVERSATIONS_POLLS_UPDATE: (conversationId: string, pollId: string) =>
        `/api/conversations/${conversationId}/polls/${pollId}`,
    API_CONVERSATIONS_POLLS_VOTE: (conversationId: string, pollId: string) =>
        `/api/conversations/${conversationId}/polls/${pollId}/vote`,
    API_CONVERSATIONS_POLLS_WITHDRAW: (conversationId: string, pollId: string) =>
        `/api/conversations/${conversationId}/polls/${pollId}/vote`,
    API_CONVERSATIONS_POLLS_CLOSE: (conversationId: string, pollId: string) =>
        `/api/conversations/${conversationId}/polls/${pollId}/close`,
    API_CONVERSATIONS_POLLS_ADD_OPTION: (conversationId: string, pollId: string) =>
        `/api/conversations/${conversationId}/polls/${pollId}/options`,
    API_CONVERSATIONS_POLLS_REMOVE_OPTION: (conversationId: string, pollId: string, optionId: string) =>
        `/api/conversations/${conversationId}/polls/${pollId}/options/${optionId}`,
    
    // Call Management
    API_CONVERSATIONS_ICE_SERVERS: "/api/conversations/ice-servers",
    API_CONVERSATIONS_CALLS_HISTORY: (conversationId: string) =>
        `/api/conversations/${conversationId}/calls`,
    API_CONVERSATIONS_CALLS_STATE: (conversationId: string) =>
        `/api/conversations/${conversationId}/call-state`,
    API_CONVERSATIONS_CALLS_END: (conversationId: string, callId: string) =>
        `/api/conversations/${conversationId}/calls/${callId}/end`,
    API_CONVERSATION_CALL_END: (conversationId: string, callId: string) =>
        `/api/conversations/${conversationId}/calls/${callId}/end`,

    /* ================= MESSAGES ================= */


    API_MESSAGES: (conversationId: string) =>
      `/api/conversations/${conversationId}/messages`,
    API_CONVERSATIONS_MESSAGES: (conversationId: string) =>
      `/api/conversations/${conversationId}/messages`,
    API_CONVERSATIONS_SEND_MESSAGE: (conversationId: string) =>
      `/api/conversations/${conversationId}/messages`,

    API_MESSAGE_DETAIL: (
      conversationId: string,
      createdAt: number | string,
      messageId: string
    ) => `/api/messages/${conversationId}/${createdAt}/${messageId}`,

    API_MESSAGE_REACTIONS: (messageId: string) =>
      `/api/messages/${messageId}/reactions`,

    API_MESSAGES_LIST: (conversationId: string) =>
      `/api/messages/${conversationId}`,
    API_MESSAGES_SEARCH: (conversationId: string) =>
      `/api/messages/${conversationId}/search`,
    API_MESSAGES_FORWARD: "/api/messages/forward",
    API_MESSAGE_PIN: (conversationId: string, createdAt: number | string, messageId: string) =>
      `/api/messages/${conversationId}/${createdAt}/${messageId}/pin`,
    API_MESSAGE_PINS: (conversationId: string) =>
      `/api/messages/${conversationId}/pins`,
    API_MESSAGE_LOOKUP: (messageId: string) =>
      `/api/v1/messages/lookup/${messageId}`,
} as const;
