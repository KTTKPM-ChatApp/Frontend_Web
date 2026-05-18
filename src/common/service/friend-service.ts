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
  getFriends() {
    return http.get<IApiResponse<FriendUser[]>>(API.API_FRIENDS_LIST).then(r => r.payload);
  },

  getPendingRequests() {
    return http.get<IApiResponse<FriendRequestItem[]>>(API.API_FRIENDS_PENDING).then(r => r.payload);
  },

  getSentRequests() {
    return http.get<IApiResponse<FriendRequestItem[]>>(API.API_FRIENDS_SENT).then(r => r.payload);
  },

  sendRequest(receiverId: string, message?: string) {
    return http.post<IApiResponse<any>>(API.API_FRIENDS_SEND_REQUEST, { receiverId, message }).then(r => r.payload);
  },

  respondToRequest(requestId: string, action: "accepted" | "rejected") {
    return http.put<IApiResponse<any>>(API.API_FRIENDS_RESPOND_REQUEST(requestId), { action }).then(r => r.payload);
  },

  cancelRequest(requestId: string) {
    return http.delete<IApiResponse<any>>(API.API_FRIENDS_CANCEL_REQUEST(requestId)).then(r => r.payload);
  },

  removeFriend(friendId: string) {
    return http.delete<IApiResponse<any>>(API.API_FRIENDS_REMOVE(friendId)).then(r => r.payload);
  },

  blockUser(userId: string, reason?: string) {
    return http.post<IApiResponse<any>>(API.API_FRIENDS_BLOCK(userId), { reason }).then(r => r.payload);
  },

  unblockUser(userId: string) {
    return http.delete<IApiResponse<any>>(API.API_FRIENDS_UNBLOCK(userId)).then(r => r.payload);
  },
};
