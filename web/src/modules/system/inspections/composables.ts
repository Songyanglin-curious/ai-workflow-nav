import { computed, ref, type ComputedRef, type Ref } from 'vue';

import { runInspection } from './api.js';
import type { InspectionIssue, InspectionRunResult } from '../../../../../shared/inspections/index.js';

export interface UseInspectionsState {
  result: Ref<InspectionRunResult | null>;
  items: ComputedRef<InspectionIssue[]>;
  hasResult: ComputedRef<boolean>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  lastRunAt: Ref<string | null>;
  execute: () => Promise<void>;
}

export function formatInspectionRunTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '巡检执行失败';
}

export function useInspections(): UseInspectionsState {
  const result = ref<InspectionRunResult | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastRunAt = ref<string | null>(null);

  const items = computed(() => result.value?.items ?? []);
  const hasResult = computed(() => result.value !== null);

  async function execute(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      result.value = await runInspection();
      lastRunAt.value = new Date().toISOString();
    } catch (nextError) {
      error.value = getErrorMessage(nextError);
    } finally {
      loading.value = false;
    }
  }

  return {
    result,
    items,
    hasResult,
    loading,
    error,
    lastRunAt,
    execute,
  };
}
