import http from "../api/http";
import { API } from "../api/path";
import {
  IApiResponse,
  IAuthResponse,
  ILoginPayload,
  IRefreshPayload,
  IRefreshResponse,
  IRegisterPayload,
  IRegisterResponse,
  IUpdateUserPayload,
} from "../interface/auth-interface";

export const authService = {
  authRegister(body: IRegisterPayload) {
    return http.post<IRegisterResponse>(API.API_AUTH_REGISTER, body, {
      skipAuth: true,
    });
  },

  authLogin(body: ILoginPayload) {
    return http.post<IApiResponse<IAuthResponse>>(API.API_AUTH_LOGIN, body, {
      skipAuth: true,
    });
  },

  authRefresh(body: IRefreshPayload) {
    return http.post<IApiResponse<IRefreshResponse>>(API.API_AUTH_REFRESH, body, {
      skipAuth: true,
    });
  },

  authLogout() {
    return http.post(API.API_AUTH_LOGOUT);
  },

  updateUserProfile(body: IUpdateUserPayload) {
    return http.put<IApiResponse<any>>(API.API_USERS_ME, body);
  },

  changePassword(oldPassword: string, newPassword: string) {
    return http.post<IApiResponse<any>>(API.API_AUTH_CHANGE_PASSWORD, { oldPassword, newPassword });
  },
};