export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function trimToEmpty(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

export function stripLeadingSlash(value: string): string {
  return value.replace(/^\/+/, '');
}

export function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

