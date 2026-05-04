// src/common/utilities/utils.ts

export const TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const EXPIRES_IN_KEY = "expiresIn";
export const CURRENT_USER_ID_KEY = "currentUserId";
export const LOGIN_PATH = "/login"; // nếu route login của em khác thì đổi ở đây

export const isClientSide = (): boolean => typeof window !== "undefined";

export const getSessionToken = (): string | null => {
  if (!isClientSide()) return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (!isClientSide()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getCurrentUserId = (): string | null => {
  if (!isClientSide()) return null;
  return localStorage.getItem(CURRENT_USER_ID_KEY);
};
export const getTokenExpiresIn = () => {
  if (!isClientSide()) return null;
  return localStorage.getItem(EXPIRES_IN_KEY);
}

// giữ alias cũ để tránh vỡ import cũ
export const getcurrentUserId = getCurrentUserId;

export const setSessionToken = (
  token: string,
  currentUserId?: string | null
): void => {
  if (!isClientSide()) return;
  localStorage.setItem(TOKEN_KEY, token);

  if (currentUserId) {
    localStorage.setItem(CURRENT_USER_ID_KEY, String(currentUserId));
  }
};

export const setRefreshToken = (token: string): void => {
  if (!isClientSide()) return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const setSessionTokenExpiresIn = (
  expiresIn: number | string
): void => {
  if (!isClientSide()) return;
  localStorage.setItem(EXPIRES_IN_KEY, String(expiresIn));
};

export const setAuthStorage = (params: {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number | string | null;
  currentUserId?: string | null;
}): void => {
  setSessionToken(params.accessToken, params.currentUserId);

  if (params.refreshToken) {
    setRefreshToken(params.refreshToken);
  }

  if (params.expiresIn !== undefined && params.expiresIn !== null) {
    setSessionTokenExpiresIn(params.expiresIn);
  }
};

export const removeSessionToken = (): void => {
  if (!isClientSide()) return;
  localStorage.removeItem(TOKEN_KEY);
};

export const removeRefreshToken = (): void => {
  if (!isClientSide()) return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const removeSessionTokenExpiresIn = (): void => {
  if (!isClientSide()) return;
  localStorage.removeItem(EXPIRES_IN_KEY);
};

export const removeCurrentUserId = (): void => {
  if (!isClientSide()) return;
  localStorage.removeItem(CURRENT_USER_ID_KEY);
};

export const clearAuthStorage = (): void => {
  removeSessionToken();
  removeRefreshToken();
  removeSessionTokenExpiresIn();
  removeCurrentUserId();
};

export const redirectToLogin = (): void => {
  if (!isClientSide()) return;
  if (window.location.pathname !== LOGIN_PATH) {
    window.location.href = LOGIN_PATH;
  }
};