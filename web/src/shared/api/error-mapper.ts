import type { ApiErrorPayload, ApiFailureEnvelope } from '../types/api';

import { isApiFailureEnvelope } from './response';

export interface HttpErrorContext {
  status?: number;
  url?: string;
  method?: string;
}

export interface HttpClientErrorOptions extends HttpErrorContext {
  code?: string;
  details?: Record<string, unknown>;
  cause?: unknown;
}

export class HttpClientError extends Error {
  readonly status?: number;

  readonly code?: string;

  readonly details?: Record<string, unknown>;

  readonly url?: string;

  readonly method?: string;

  constructor(message: string, options: HttpClientErrorOptions = {}) {
    super(message);
    this.name = 'HttpClientError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.url = options.url;
    this.method = options.method;
    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export function mapApiErrorPayload(payload: ApiErrorPayload, context: HttpErrorContext = {}): HttpClientError {
  return new HttpClientError(payload.message, {
    ...context,
    code: payload.code,
    details: payload.details,
  });
}

export function mapApiFailureEnvelope(envelope: ApiFailureEnvelope, context: HttpErrorContext = {}): HttpClientError {
  return mapApiErrorPayload(envelope.error, context);
}

export function mapResponseToError(status: number, payload: unknown, context: HttpErrorContext = {}): HttpClientError {
  if (isApiFailureEnvelope(payload)) {
    return mapApiFailureEnvelope(payload, { ...context, status });
  }

  if (payload instanceof Error) {
    return new HttpClientError(payload.message, { ...context, status, cause: payload });
  }

  if (payload instanceof DOMException && payload.name === 'AbortError') {
    return new HttpClientError('请求已取消', { ...context, status, cause: payload });
  }

  if (typeof payload === 'string' && payload.trim().length > 0) {
    return new HttpClientError(payload, { ...context, status });
  }

  return new HttpClientError(`请求失败 (${status})`, { ...context, status, cause: payload });
}

export function mapUnknownToHttpError(error: unknown, context: HttpErrorContext = {}): HttpClientError {
  if (error instanceof HttpClientError) {
    return error;
  }

  if (error instanceof Error) {
    return new HttpClientError(error.message, { ...context, cause: error });
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new HttpClientError('请求已取消', { ...context, cause: error });
  }

  return new HttpClientError('请求失败', { ...context, cause: error });
}

