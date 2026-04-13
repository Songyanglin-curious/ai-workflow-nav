import type { ApiEnvelope, ApiFailureEnvelope, ApiSuccessEnvelope } from '../types/api';

import { isRecord } from '../utils/object';

export function isApiSuccessEnvelope<TData>(value: unknown): value is ApiSuccessEnvelope<TData> {
  return isRecord(value) && value.success === true && 'data' in value && 'meta' in value;
}

export function isApiFailureEnvelope(value: unknown): value is ApiFailureEnvelope {
  return (
    isRecord(value) &&
    value.success === false &&
    isRecord(value.error) &&
    typeof value.error.code === 'string' &&
    typeof value.error.message === 'string' &&
    'meta' in value
  );
}

export function isApiEnvelope<TData>(value: unknown): value is ApiEnvelope<TData> {
  return isApiSuccessEnvelope<TData>(value) || isApiFailureEnvelope(value);
}

export function unwrapApiData<TData>(value: TData | ApiSuccessEnvelope<TData>): TData {
  return isApiSuccessEnvelope<TData>(value) ? value.data : value;
}

export function getApiErrorMessage(value: unknown, fallback = '请求失败'): string {
  if (isApiFailureEnvelope(value)) {
    return value.error.message;
  }

  if (isRecord(value) && typeof value.message === 'string') {
    return value.message;
  }

  return fallback;
}

