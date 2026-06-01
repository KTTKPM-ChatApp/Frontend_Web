export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type CustomOptions = Omit<RequestInit, "method" | "body"> & {
  baseUrl?: string;
  body?: any;
  skipAuth?: boolean;
  retry?: {
    attempts?: number;
    delayMs?: number;
    retryUnsafe?: boolean;
  };
};

export interface IHttpresponse<T = any> {
  statusCode: number;
  payload: T;
  data?: T;
  ok: boolean;
}

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

  if (!options?.skipAuth && typeof window !== "undefined") {
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

const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryAttempts = (options?: CustomOptions) =>
  Math.max(1, options?.retry?.attempts ?? (Number(process.env.NEXT_PUBLIC_HTTP_RETRY_ATTEMPTS) || 2));

const getRetryDelayMs = (options?: CustomOptions) =>
  Math.max(0, options?.retry?.delayMs ?? (Number(process.env.NEXT_PUBLIC_HTTP_RETRY_DELAY_MS) || 3000));

const hasIdempotencyKey = (headers: Record<string, string>) =>
  Object.keys(headers).some((key) =>
    key.toLowerCase() === "idempotency-key" || key.toLowerCase() === "x-idempotency-key"
  );

const canRetryRequest = (method: HttpMethod, headers: Record<string, string>, options?: CustomOptions) =>
  method === "GET" || Boolean(options?.retry?.retryUnsafe) || hasIdempotencyKey(headers);

const shouldRetryError = (err: any) =>
  err?.name === "AbortError" || err instanceof TypeError;

export const request = async <T = any>(
  method: HttpMethod,
  url: string,
  options?: CustomOptions
): Promise<IHttpresponse<T>> => {
  const baseUrl = options?.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    console.error("[HTTP] Missing baseUrl");
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
  const requestHeaders = {
    ...headers,
    ...optionHeaders,
  };
  const retryAttempts = getRetryAttempts(options);
  const retryDelayMs = getRetryDelayMs(options);
  const retryableRequest = canRetryRequest(method, requestHeaders, options);
  const {
    baseUrl: _baseUrl,
    body: _body,
    skipAuth: _skipAuth,
    retry: _retry,
    signal: externalSignal,
    headers: _headers,
    ...fetchOptions
  } = options ?? {};

  try {
    const isChatbotRequest = url.includes("/chatbot/");
    const timeoutMs = isChatbotRequest ? 90000 : 10000;

    for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error(`[HTTP] Request timeout after ${timeoutMs / 1000}s: ${method} ${url}`);
        controller.abort();
      }, timeoutMs);
      const abortFromCaller = () => controller.abort();

      try {
        if (externalSignal) {
          if (externalSignal.aborted) controller.abort();
          externalSignal.addEventListener("abort", abortFromCaller, { once: true });
        }

        const res = await fetch(fullUrl, {
          ...fetchOptions,
          method,
          body,
          headers: requestHeaders,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        externalSignal?.removeEventListener("abort", abortFromCaller);

        if (
          retryableRequest &&
          attempt < retryAttempts &&
          RETRYABLE_STATUS_CODES.has(res.status)
        ) {
          console.warn(`[HTTP] ${method} ${url} returned ${res.status}; retrying in ${retryDelayMs}ms (${attempt}/${retryAttempts})`);
          await sleep(retryDelayMs);
          continue;
        }

        const payload = await getResponsePayload(res);

        if (res.ok) {
          return { statusCode: res.status, ok: true, payload: payload as T };
        }

        return { statusCode: res.status, ok: false, payload: payload as T };
      } catch (err: any) {
        clearTimeout(timeoutId);
        externalSignal?.removeEventListener("abort", abortFromCaller);

        if (externalSignal?.aborted) {
          throw err;
        }

        if (retryableRequest && attempt < retryAttempts && shouldRetryError(err)) {
          console.warn(`[HTTP] ${method} ${url} failed: ${err?.message}; retrying in ${retryDelayMs}ms (${attempt}/${retryAttempts})`);
          await sleep(retryDelayMs);
          continue;
        }

        throw err;
      }
    }

    return {
      statusCode: 500,
      ok: false,
      payload: { message: "Request failed after retries" } as any,
    };
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
