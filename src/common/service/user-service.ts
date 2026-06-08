import http from "../api/http";
import { API } from "../api/path";
import { IApiResponse, IUser } from "../interface/auth-interface";
import type { IUpdateMyProfilePayload } from "../interface/user-interface";

export const userService = {
    userGetMe() {
        return http.get<IApiResponse<IUser>>(API.API_USERS_ME);
    },
    userUpdateProfile(body: IUpdateMyProfilePayload) {
        return http.put<IApiResponse<IUser>>(API.API_USERS_UPDATE_ME, body);
    },
    searchUsers(query: string, limit: number = 20, offset: number = 0) {
        const params = new URLSearchParams({
            q: query,
            limit: limit.toString(),
            offset: offset.toString(),
        });
        return http.get<IApiResponse<any[]>>(`${API.API_USERS_SEARCH}?${params}`);
    },
    getUserById(userId: string) {
        return http.get<IApiResponse<IUser>>(API.API_USERS_PUBLIC_PROFILE(userId));
    },
}
