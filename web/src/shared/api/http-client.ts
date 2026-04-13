import { DEFAULT_HTTP_HEADERS, DEFAULT_HTTP_TIMEOUT_MS, JSON_CONTENT_TYPE } from '../constants/http';
import type { HttpClientOptions, HttpMethod, HttpRequestConfig } from '../types/api';

import { appendQueryString, joinUrl } from '../utils/url';

import { mapResponseToError, mapUnknownToHttpError } from './error-mapper';
import { isApiFailureEnvelope, isApiSuccessEnvelope } from './response';

export class HttpClient {
  private readonly baseUrl?: string;

  private readonly timeoutMs: number;

  private readonly headers: Record<string, string>;

  private readonly fetchImpl: typeof fetch;

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = options.baseUrl;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_HTTP_TIMEOUT_MS;
    this.headers = { ...DEFAULT_HTTP_HEADERS, ...(options.headers ?? {}) };
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async request<TResponse = unknown, TBody = unknown>(config: HttpRequestConfig<TBody>): Promise<TResponse> {
    const url = appendQueryString(joinUrl(config.baseUrl ?? this.baseUrl, config.path), config.query);
    const method = config.method ?? 'GET';
    const timeoutMs = config.timeoutMs ?? this.timeoutMs;
    const headers = {
      ...this.headers,
      ...(config.headers ?? {}),
    };
    const controller = new AbortController();
    const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (config.signal) {
        if (config.signal.aborted) {
          controller.abort();
        } else {
          config.signal.addEventListener('abort', () => controller.abort(), { once: true });
        }
      }

      const response = await this.fetchImpl(url, {
        method,
        headers,
        body: createRequestBody(config.body, headers, method),
        credentials: config.credentials,
        mode: config.mode,
        cache: config.cache,
        redirect: config.redirect,
        referrer: config.referrer,
        referrerPolicy: config.referrerPolicy,
        integrity: config.integrity,
        signal: controller.signal,
      });

      const payload = await readResponsePayload(response, config.responseKind);

      if (isApiFailureEnvelope(payload)) {
        throw mapResponseToError(response.status, payload, {
          url,
          method,
        });
      }

      if (!response.ok) {
        throw mapResponseToError(response.status, payload, {
          url,
          method,
        });
      }

      if (isApiSuccessEnvelope<TResponse>(payload)) {
        return payload.data;
      }

      return payload as TResponse;
    } catch (error) {
      throw mapUnknownToHttpError(error, {
        url,
        method,
      });
    } finally {
      globalThis.clearTimeout(timer);
    }
  }

  get<TResponse = unknown>(config: Omit<HttpRequestConfig, 'method' | 'body'>): Promise<TResponse> {
    return this.request<TResponse>({
      ...config,
      method: 'GET',
    });
  }

  post<TResponse = unknown, TBody = unknown>(config: Omit<HttpRequestConfig<TBody>, 'method'>): Promise<TResponse> {
    return this.request<TResponse, TBody>({
      ...config,
      method: 'POST',
    });
  }

  put<TResponse = unknown, TBody = unknown>(config: Omit<HttpRequestConfig<TBody>, 'method'>): Promise<TResponse> {
    return this.request<TResponse, TBody>({
      ...config,
      method: 'PUT',
    });
  }

  patch<TResponse = unknown, TBody = unknown>(config: Omit<HttpRequestConfig<TBody>, 'method'>): Promise<TResponse> {
    return this.request<TResponse, TBody>({
      ...config,
      method: 'PATCH',
    });
  }

  delete<TResponse = unknown>(config: Omit<HttpRequestConfig, 'method' | 'body'>): Promise<TResponse> {
    return this.request<TResponse>({
      ...config,
      method: 'DELETE',
    });
  }
}

export function createHttpClient(options: HttpClientOptions = {}): HttpClient {
  return new HttpClient(options);
}

export const httpClient = createHttpClient();

function createRequestBody<TBody>(body: TBody | undefined, headers: Record<string, string>, method: HttpMethod): BodyInit | undefined {
  if (body === undefined || body === null || method === 'GET' || method === 'HEAD') {
    return undefined;
  }

  if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer || body instanceof URLSearchParams) {
    return body;
  }

  if (ArrayBuffer.isView(body)) {
    return body as BodyInit;
  }

  if (typeof body === 'string') {
    return body;
  }

  if (!headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = JSON_CONTENT_TYPE;
  }

  return JSON.stringify(body);
}

async function readResponsePayload(response: Response, responseKind?: HttpRequestConfig['responseKind']): Promise<unknown> {
  if (response.status === 204 || responseKind === 'void') {
    return undefined;
  }

  if (responseKind === 'text') {
    return response.text();
  }

  if (responseKind === 'blob') {
    return response.blob();
  }

  if (responseKind === 'arrayBuffer') {
    return response.arrayBuffer();
  }

  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
