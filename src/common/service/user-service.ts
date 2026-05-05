import http from "../api/http";
import { API } from "../api/path";

export const userService = {
    userGetMe() {
        return http.get(API.API_USERS_ME);
    },
    
    userUpdateProfile(body: any) {
        return http.put(API.API_USERS_ME, body);
    },
    
    searchUsers(query: string, limit = 20, offset = 0) {
        const params = new URLSearchParams();
        params.append('q', query);
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());
        
        return http.get(`${API.API_USERS_SEARCH}?${params.toString()}`);
    },
    
    getUserById(userId: string) {
        return http.get(API.API_USERS_PUBLIC_PROFILE(userId));
    },
};