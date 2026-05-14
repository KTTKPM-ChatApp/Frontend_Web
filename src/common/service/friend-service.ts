import http from "../api/http";
import { API } from "../api/path";
import type {
    IRespondFriendRequestPayload,
    ISendFriendRequestPayload,
} from "../interface/friend-interface";

export const friendService = {
    getFriends() {
        return http.get<{ data?: unknown[] }>(API.API_FRIENDS_LIST);
    },

    getPendingRequests() {
        return http.get<{ data?: unknown[] }>(API.API_FRIENDS_PENDING);
    },

    getSentRequests() {
        return http.get<{ data?: unknown[] }>(API.API_FRIENDS_SENT);
    },

    sendRequest(body: ISendFriendRequestPayload) {
        return http.post(API.API_FRIENDS_SEND_REQUEST, body);
    },

    respondRequest(requestId: string, body: IRespondFriendRequestPayload) {
        return http.post(API.API_FRIENDS_RESPOND_REQUEST(requestId), body);
    },

    cancelRequest(requestId: string) {
        return http.delete(API.API_FRIENDS_CANCEL_REQUEST(requestId));
    },

    removeFriend(friendId: string) {
        return http.delete(API.API_FRIENDS_REMOVE(friendId));
    },

    blockUser(userId: string) {
        return http.post(API.API_FRIENDS_BLOCK(userId));
    },

    unblockUser(userId: string) {
        return http.delete(API.API_FRIENDS_UNBLOCK(userId));
    },
};
