import type { Pinia } from 'pinia';
import { setActivePinia } from 'pinia';
import { hydrateRuntime, resolveRuntimeStores, setupRuntimePersistence } from './persistence/hydration';

export { clearRuntimeSnapshot, loadRuntimeSnapshot, runtimeStorageKey, saveRuntimeSnapshot } from './persistence/local-storage';
export {
  hydrateRuntime,
  resolveRuntimeStores,
  setupRuntimePersistence,
  type RuntimeStores,
} from './persistence/hydration';
export { useFiltersStore, type RuntimeFiltersState, type RuntimeSortOrder } from './stores/filters';
export { useSessionStore, type RuntimeSessionState } from './stores/session';
export { useUiStore, type RuntimeDensity, type RuntimeThemeMode, type RuntimeUiState } from './stores/ui';

export function createRuntime(pinia?: Pinia) {
  if (pinia !== undefined) {
    setActivePinia(pinia);
  }

  const stores = resolveRuntimeStores();
  hydrateRuntime(stores);

  return {
    ...stores,
    stopPersistence: setupRuntimePersistence(stores),
  };
}
