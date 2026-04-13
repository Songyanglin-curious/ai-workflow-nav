import { computed, ref, type ComputedRef, type Ref } from 'vue';

import { exportSync, importSync } from './api.js';
import type { SyncExportResult, SyncImportResult } from '../../../../../shared/imports-exports/index.js';

export type SyncOperationKind = 'export' | 'import';

export type SyncExecutionRecord =
  | {
      kind: 'export';
      completedAt: string;
      result: SyncExportResult;
    }
  | {
      kind: 'import';
      completedAt: string;
      result: SyncImportResult;
    };

export interface UseSystemSyncState {
  lastRecord: Ref<SyncExecutionRecord | null>;
  hasRecord: ComputedRef<boolean>;
  exportLoading: Ref<boolean>;
  importLoading: Ref<boolean>;
  exportError: Ref<string | null>;
  importError: Ref<string | null>;
  executeExport: () => Promise<void>;
  executeImport: () => Promise<void>;
}

const rebuildImportMode = 'rebuild';

export function formatSyncExecutionTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function getSyncOperationLabel(kind: SyncOperationKind): string {
  return kind === 'export' ? '导出' : '导入';
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '同步执行失败';
}

export function useSystemSync(): UseSystemSyncState {
  const lastRecord = ref<SyncExecutionRecord | null>(null);
  const exportLoading = ref(false);
  const importLoading = ref(false);
  const exportError = ref<string | null>(null);
  const importError = ref<string | null>(null);

  const hasRecord = computed(() => lastRecord.value !== null);

  async function executeExport(): Promise<void> {
    exportLoading.value = true;
    exportError.value = null;

    try {
      const result = await exportSync();
      lastRecord.value = {
        kind: 'export',
        completedAt: new Date().toISOString(),
        result,
      };
    } catch (error) {
      exportError.value = getErrorMessage(error);
    } finally {
      exportLoading.value = false;
    }
  }

  async function executeImport(): Promise<void> {
    importLoading.value = true;
    importError.value = null;

    try {
      const result = await importSync({
        mode: rebuildImportMode,
      });
      lastRecord.value = {
        kind: 'import',
        completedAt: new Date().toISOString(),
        result,
      };
    } catch (error) {
      importError.value = getErrorMessage(error);
    } finally {
      importLoading.value = false;
    }
  }

  return {
    lastRecord,
    hasRecord,
    exportLoading,
    importLoading,
    exportError,
    importError,
    executeExport,
    executeImport,
  };
}
