export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;

export const DEFAULT_HTTP_TIMEOUT_MS = 15_000;

export const DEFAULT_HTTP_HEADERS = Object.freeze({
  Accept: 'application/json',
});

export const JSON_CONTENT_TYPE = 'application/json';

