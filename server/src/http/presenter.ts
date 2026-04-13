export interface HttpSuccessEnvelope<TData> {
  success: true;
  data: TData;
  meta: Record<string, never>;
}

export interface HttpSuccessEnvelopeWithMeta<TData, TMeta extends Record<string, unknown>> {
  success: true;
  data: TData;
  meta: TMeta;
}

export interface HttpErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: Record<string, never>;
}

export function presentSuccess<TData>(data: TData): HttpSuccessEnvelope<TData> {
  return presentSuccessWithMeta(data, {});
}

export function presentSuccessWithMeta<TData, TMeta extends Record<string, unknown>>(
  data: TData,
  meta: TMeta,
): HttpSuccessEnvelopeWithMeta<TData, TMeta> {
  return {
    success: true,
    data,
    meta,
  };
}

export function presentError(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): HttpErrorEnvelope {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {},
  };
}

export function presentNamed<TKey extends string, TData>(
  key: TKey,
  value: TData,
): HttpSuccessEnvelope<Record<TKey, TData>> {
  return presentSuccess({
    [key]: value,
  } as Record<TKey, TData>);
}

export function presentNamedData<TKey extends string, TData>(
  key: TKey,
  value: TData,
): HttpSuccessEnvelope<Record<TKey, TData>> {
  return presentNamed(key, value);
}

export function presentResult<TData>(value: TData): HttpSuccessEnvelope<{ result: TData }> {
  return presentNamed('result', value);
}

export function presentItems<TItem>(items: TItem[]): HttpSuccessEnvelope<{ items: TItem[] }> {
  return presentNamed('items', items);
}
