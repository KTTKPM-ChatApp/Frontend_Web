import http from "../api/http";
import { API } from "../api/path";
import { IApiResponse, IUser } from "../interface/auth-interface";

export const userService = {
    userGetMe() {
        return http.get<IApiResponse<IUser>>(API.API_USERS_ME);
    },
    userUpdateProfile(body: Partial<IUser>) {
        return http.put<IApiResponse<IUser>>(API.API_USERS_UPDATE_ME, body);
    },
    
}