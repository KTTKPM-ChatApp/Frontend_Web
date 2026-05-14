import http from "../api/http";
import { API } from "../api/path";
import { IApiResponse, IUser } from "../interface/auth-interface";
import type { IUpdateMyProfilePayload } from "../interface/user-interface";

export const userService = {
    userGetMe() {
        return http.get<IApiResponse<IUser>>(API.API_USERS_ME);
    },
    userUpdateProfile(body: Partial<IUser> | IUpdateMyProfilePayload) {
        return http.put<IApiResponse<IUser>>(API.API_USERS_UPDATE_ME, body);
    },
    
}
