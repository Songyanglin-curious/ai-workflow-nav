export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type HttpResponseKind = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'void';

export type QueryValue = string | number | boolean | null | undefined | Array<string | number | boolean>;

export type QueryParams = Record<string, QueryValue>;

export type ApiMeta = Record<string, unknown>;

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccessEnvelope<TData, TMeta = ApiMeta> {
  success: true;
  data: TData;
  meta: TMeta;
}

export interface ApiFailureEnvelope<TMeta = ApiMeta> {
  success: false;
  error: ApiErrorPayload;
  meta: TMeta;
}

export type ApiEnvelope<TData, TMeta = ApiMeta> = ApiSuccessEnvelope<TData, TMeta> | ApiFailureEnvelope<TMeta>;

export interface HttpRequestConfig<TBody = unknown> {
  path: string;
  method?: HttpMethod;
  baseUrl?: string;
  query?: QueryParams;
  headers?: Record<string, string>;
  body?: TBody;
  timeoutMs?: number;
  responseKind?: HttpResponseKind;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  cache?: RequestCache;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  integrity?: string;
}

export interface HttpClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
  fetchImpl?: typeof fetch;
}

