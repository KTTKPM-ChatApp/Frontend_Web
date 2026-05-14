import http from "../api/http";
import { API } from "../api/path";

export const searchService = {
    searchUsers(params: { q: string; page?: number; limit?: number }) {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        
        const offset = ((params.page || 1) - 1) * (params.limit || 20);
        queryParams.append('offset', offset.toString());
        
        return http.get<any>(`${API.API_USERS_SEARCH}?${queryParams.toString()}`);
    },
};