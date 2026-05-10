import { API } from "./path";
import {
  clearAuthStorage,
  getRefreshToken,
  getSessionToken,
  isClientSide,
  redirectToLogin,
  setRefreshToken,
  setSessionToken,
  setSessionTokenExpiresIn,
} from "../utilities/utils";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type CustomOptions = Omit<RequestInit, "method" | "body"> & {
  baseUrl?: string;
  body?: any;
  skipAuth?: boolean;
  _retry?: boolean;
};

export interface IHttpresponse<T = any> {
  statusCode: number;
  payload: T;
  ok: boolean;
}

/** Chuẩn hoá baseUrl + path để tránh double slash */
const joinUrl = (baseUrl: string, path: string) => {
  const b = baseUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
};

/**
 * Nếu baseUrl đã có /api mà path cũng có /api => bỏ bớt 1 cái
 * - baseUrl: http://localhost:3000/api + path: /api/auth/register -> /auth/register
 */
const normalizeApiPath = (baseUrl: string, path: string) => {
  const baseHasApi = /\/api\/?$/.test(baseUrl);
  const pathHasApi = /^\/?api(\/|$)/.test(path);

  if (baseHasApi && pathHasApi) {
    const trimmed = path.replace(/^\/?api/, "");
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  return path.startsWith("/") ? path : `/${path}`;
};

const toHeaderRecord = (headers?: HeadersInit): Record<string, string> => {
  if (!headers) return {};

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers as Record<string, string>;
};

const buildBodyAndHeaders = (options?: CustomOptions) => {
  let body: BodyInit | undefined = undefined;

  if (options?.body instanceof FormData) {
    body = options.body;
  } else if (options?.body !== undefined) {
    body = JSON.stringify(options.body);
  }

  const headers: Record<string, string> =
    body instanceof FormData ? {} : { "Content-Type": "application/json" };

  if (isClientSide() && !options?.skipAuth) {
    const token = getSessionToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return { body, headers };
};

const getResponsePayload = async (res: Response) => {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await res.json();
  }

  const text = await res.text();
  return text ? text : null;
};

const isRefreshEndpoint = (url: string) => {
  return /\/api\/auth\/refresh\/?$/.test(url) || /\/auth\/refresh\/?$/.test(url);
};

const extractRefreshPayload = (raw: any) => {
  // hỗ trợ cả 2 kiểu:
  // 1) { accessToken, expiresIn }
  // 2) { data: { accessToken, expiresIn } }
  return raw?.data ?? raw?.payload ?? raw;
};

const handleAuthExpired = () => {
  clearAuthStorage();
  redirectToLogin();
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (
  baseUrl?: string
): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  const finalBaseUrl = baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!refreshToken || !finalBaseUrl) {
    handleAuthExpired();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const apiPath = normalizeApiPath(finalBaseUrl, API.API_AUTH_REFRESH);
      const fullUrl = joinUrl(finalBaseUrl, apiPath);

      const res = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const raw = await getResponsePayload(res);

      if (!res.ok) {
        throw raw;
      }

      const refreshData = extractRefreshPayload(raw);
      const newAccessToken = refreshData?.accessToken;

      if (!newAccessToken) {
        throw new Error("Refresh response missing accessToken");
      }

      setSessionToken(newAccessToken);

      if (
        refreshData?.expiresIn !== undefined &&
        refreshData?.expiresIn !== null
      ) {
        setSessionTokenExpiresIn(refreshData.expiresIn);
      }

      // nếu backend có trả refreshToken mới thì lưu luôn
      if (refreshData?.refreshToken) {
        setRefreshToken(refreshData.refreshToken);
      }

      return newAccessToken as string;
    })()
      .catch((err) => {
        console.error("Refresh token error:", err);
        handleAuthExpired();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const request = async <T = any>(
  method: HttpMethod,
  url: string,
  options?: CustomOptions
): Promise<IHttpresponse<T>> => {
  const baseUrl = options?.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4321";

  if (!baseUrl) {
    return {
      statusCode: 500,
      ok: false,
      payload: { message: "Missing API base URL" } as any,
    };
  }

  const apiPath = normalizeApiPath(baseUrl, url);
  const fullUrl = joinUrl(baseUrl, apiPath);

  const { body, headers } = buildBodyAndHeaders(options);
  const optionHeaders = toHeaderRecord(options?.headers);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      method,
      headers: { ...headers, ...optionHeaders },
      body,
    });

    const payload = await getResponsePayload(res);

    if (res.ok) {
      return { statusCode: res.status, ok: true, payload: payload as T };
    }

    const shouldTryRefresh =
      res.status === 401 &&
      !options?.skipAuth &&
      !options?._retry &&
      !isRefreshEndpoint(url);

    if (shouldTryRefresh) {
      const newAccessToken = await refreshAccessToken(baseUrl);

      if (newAccessToken) {
        return request<T>(method, url, {
          ...options,
          _retry: true,
          headers: {
            ...optionHeaders,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }
    }

    if (res.status === 401 && isRefreshEndpoint(url)) {
      handleAuthExpired();
    }

    return { statusCode: res.status, ok: false, payload: payload as T };
  } catch (err: any) {
    console.error("HTTP error:", err);

    return {
      statusCode: 500,
      ok: false,
      payload: { message: err?.message ?? "Network error" } as any,
    };
  }
};

const http = {
  get<T>(url: string, options?: Omit<CustomOptions, "body">) {
    return request<T>("GET", url, options);
  },

  post<T>(url: string, body?: any, options?: Omit<CustomOptions, "body">) {
    return request<T>("POST", url, { ...options, body });
  },

  put<T>(url: string, body?: any, options?: Omit<CustomOptions, "body">) {
    return request<T>("PUT", url, { ...options, body });
  },

  delete<T>(url: string, options?: Omit<CustomOptions, "body">) {
    return request<T>("DELETE", url, options);
  },

  deleteBody<T>(url: string, body?: any, options?: Omit<CustomOptions, "body">) {
    return request<T>("DELETE", url, { ...options, body });
  },
  patch<T = any>(path: string, body?: any, options?: CustomOptions) {
    return request<T>("PATCH", path, {
      ...options,
      body,
    });
  },
};

export default http;