import http from "../api/http";
import { API } from "../api/path";

export const authService = {
  authRegister: (body: { username: string; email: string; password: string; displayName: string }) => {
    return http.post(API.API_AUTH_REGISTER, body);
  },

  authLogin: (body: { email: string; password: string }) => {
    return http.post(API.API_AUTH_LOGIN, body);
  },

  authRefresh: (body: { refreshToken: string }) => {
    return http.post(API.API_AUTH_REFRESH, body);
  },

  authLogout: () => {
    return http.post(API.API_AUTH_LOGOUT);
  },
};