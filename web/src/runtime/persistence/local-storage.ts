import type { RuntimeFiltersState } from '../stores/filters';
import type { RuntimeSessionState } from '../stores/session';
import type { RuntimeUiState } from '../stores/ui';

export const runtimeStorageKey = 'ai-workflow-nav.runtime';

export interface RuntimeSnapshot {
  session: RuntimeSessionState;
  ui: RuntimeUiState;
  filters: RuntimeFiltersState;
}

export function loadRuntimeSnapshot(): RuntimeSnapshot | null {
  const raw = window.localStorage.getItem(runtimeStorageKey);

  if (raw === null) {
    return null;
  }

  return JSON.parse(raw) as RuntimeSnapshot;
}

export function saveRuntimeSnapshot(snapshot: RuntimeSnapshot): void {
  window.localStorage.setItem(runtimeStorageKey, JSON.stringify(snapshot));
}

export function clearRuntimeSnapshot(): void {
  window.localStorage.removeItem(runtimeStorageKey);
}
