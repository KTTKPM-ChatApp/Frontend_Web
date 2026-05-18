import http from "../api/http";
import { API } from "../api/path";
import { IUserSearchResponse } from "../interface/search-interface";

export const searchService = {
    searchUsers(params: { q: string; offset?: number; limit?: number }) {
        const { q, offset = 0, limit = 20 } = params;

        return http.get<IUserSearchResponse>(
            `${API.API_USERS_SEARCH}?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`
        );
    },
}