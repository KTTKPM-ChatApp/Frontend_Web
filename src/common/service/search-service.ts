import http from "../api/http";
import { API } from "../api/path";
import { IUserSearchResponse } from "../interface/search-interface";

export const searchService = {
    searchUsers(params: { q: string; page?: number; limit?: number }) {
        const { q, page = 1, limit = 20 } = params;

        return http.get<IUserSearchResponse>(
            `${API.API_USERS_SEARCH}?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`
        );
    },
}