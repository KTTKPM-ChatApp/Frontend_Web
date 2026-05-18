import http from "../api/http";
import { API } from "../api/path";
import { IApiResponse } from "../interface/auth-interface";

export const searchService = {
    searchUsers(params: { q: string; offset?: number; limit?: number }) {
        const { q, offset = 0, limit = 20 } = params;
        return http.get<IApiResponse<any[]>>(
            `${API.API_USERS_SEARCH}?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`
        );
    },
};