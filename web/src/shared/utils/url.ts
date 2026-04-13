import type { QueryParams } from '../types/api';

import { isNonEmptyString, stripLeadingSlash, stripTrailingSlash } from './string';

export function joinUrl(...segments: Array<string | null | undefined>): string {
  const parts = segments.filter(isNonEmptyString).map((segment, index) => {
    const trimmed = segment.trim();
    return index === 0 ? stripTrailingSlash(trimmed) : stripLeadingSlash(stripTrailingSlash(trimmed));
  });

  return parts.join('/');
}

export function buildQueryString(query?: QueryParams): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
      continue;
    }

    params.append(key, String(value));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function appendQueryString(url: string, query?: QueryParams): string {
  return `${url}${buildQueryString(query)}`;
}

