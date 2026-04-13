import type { RuntimeFiltersState } from '../stores/filters';
import { useFiltersStore } from '../stores/filters';
import type { RuntimeSessionState } from '../stores/session';
import { useSessionStore } from '../stores/session';
import type { RuntimeUiState } from '../stores/ui';
import { useUiStore } from '../stores/ui';
import { loadRuntimeSnapshot, saveRuntimeSnapshot, type RuntimeSnapshot } from './local-storage';

export interface RuntimeStores {
  session: ReturnType<typeof useSessionStore>;
  ui: ReturnType<typeof useUiStore>;
  filters: ReturnType<typeof useFiltersStore>;
}

export function resolveRuntimeStores(): RuntimeStores {
  return {
    session: useSessionStore(),
    ui: useUiStore(),
    filters: useFiltersStore(),
  };
}

export function hydrateRuntime(stores: RuntimeStores = resolveRuntimeStores()): RuntimeSnapshot | null {
  const snapshot = loadRuntimeSnapshot();

  if (snapshot === null) {
    return null;
  }

  stores.session.$patch(snapshot.session as RuntimeSessionState);
  stores.ui.$patch(snapshot.ui as RuntimeUiState);
  stores.filters.$patch(snapshot.filters as RuntimeFiltersState);

  return snapshot;
}

export function setupRuntimePersistence(stores: RuntimeStores = resolveRuntimeStores()): () => void {
  const save = (): void => {
    saveRuntimeSnapshot({
      session: stores.session.$state,
      ui: stores.ui.$state,
      filters: stores.filters.$state,
    });
  };

  const stopSession = stores.session.$subscribe(save);
  const stopUi = stores.ui.$subscribe(save);
  const stopFilters = stores.filters.$subscribe(save);

  return () => {
    stopSession();
    stopUi();
    stopFilters();
  };
}
