export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type CustomOptions = Omit<RequestInit, "method" | "body"> & {
  baseUrl?: string;
  body?: any;
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

  // Add authentication token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
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

export const request = async <T = any>(
  method: HttpMethod,
  url: string,
  options?: CustomOptions
): Promise<IHttpresponse<T>> => {
  const baseUrl = options?.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  
  if (!baseUrl) {
    console.error('[HTTP] Missing baseUrl');
    return {
      statusCode: 500,
      ok: false,
      payload: { message: "Missing baseUrl" } as any,
    };
  }

  const apiPath = normalizeApiPath(baseUrl, url);
  const fullUrl = joinUrl(baseUrl, apiPath);

  const { headers, body } = buildBodyAndHeaders(options);
  const optionHeaders = toHeaderRecord(options?.headers);

  try {
    // Add timeout for request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`[HTTP] Request timeout after 10s: ${method} ${url}`);
      controller.abort();
    }, 10000);

    const res = await fetch(fullUrl, {
      ...options,
      method,
      body,
      headers: {
        ...headers,
        ...optionHeaders,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const payload = await getResponsePayload(res);

    if (res.ok) {
      return { statusCode: res.status, ok: true, payload: payload as T };
    }

    return { statusCode: res.status, ok: false, payload: payload as T };
  } catch (err: any) {
    console.error("[HTTP] Request error:", err);
    console.error("[HTTP] Error details:", err?.message, err?.stack);

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