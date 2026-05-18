import http from "../api/http";
import { API } from "../api/path";
import { IApiResponse } from "../interface/auth-interface";

export interface FriendUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  phone: string | null;
  friendshipStatus: "friend";
}

export interface FriendRequestItem {
  id: string;
  requestId: string;
  senderId: string;
  sender?: { id: string; displayName: string; avatarUrl: string | null } | null;
  receiverId?: string;
  receiver?: { id: string; displayName: string; avatarUrl: string | null } | null;
  message?: string;
  status: string;
  createdAt: string;
}

export const friendService = {
  /** Returns the full IHttpresponse so callers can access .payload.data */
  getFriends() {
    return http.get<IApiResponse<FriendUser[]>>(API.API_FRIENDS_LIST);
  },

  getPendingRequests() {
    return http.get<IApiResponse<FriendRequestItem[]>>(API.API_FRIENDS_PENDING);
  },

  getSentRequests() {
    return http.get<IApiResponse<FriendRequestItem[]>>(API.API_FRIENDS_SENT);
  },

  /** useFriendStore calls sendRequest({ userId, message }) */
  sendRequest(payload: { userId: string; message?: string }) {
    return http.post<IApiResponse<any>>(API.API_FRIENDS_SEND_REQUEST, {
      receiverId: payload.userId,
      message: payload.message,
    });
  },

  /** useFriendStore calls respondRequest(requestId, { action }) */
  respondRequest(requestId: string, body: { action: string }) {
    return http.put<IApiResponse<any>>(API.API_FRIENDS_RESPOND_REQUEST(requestId), body);
  },

  /** Keep alias for backward compat */
  respondToRequest(requestId: string, action: "accepted" | "rejected") {
    return http.put<IApiResponse<any>>(API.API_FRIENDS_RESPOND_REQUEST(requestId), { action });
  },

  cancelRequest(requestId: string) {
    return http.delete<IApiResponse<any>>(API.API_FRIENDS_CANCEL_REQUEST(requestId));
  },

  removeFriend(friendId: string) {
    return http.delete<IApiResponse<any>>(API.API_FRIENDS_REMOVE(friendId));
  },

  blockUser(userId: string, reason?: string) {
    return http.post<IApiResponse<any>>(API.API_FRIENDS_BLOCK(userId), { reason });
  },

  unblockUser(userId: string) {
    return http.delete<IApiResponse<any>>(API.API_FRIENDS_UNBLOCK(userId));
  },
};
