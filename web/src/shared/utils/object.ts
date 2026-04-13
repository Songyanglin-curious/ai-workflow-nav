export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function pickDefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) {
      result[key as keyof T] = entry as T[keyof T];
    }
  }

  return result;
}

export function compactEntries(value: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined && entry !== null) {
      result[key] = entry;
    }
  }

  return result;
}

