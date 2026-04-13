import { ref, shallowRef, type Ref, type ShallowRef } from 'vue';

import { checkProjectDeletion, executeProjectDeletion } from './api.js';
import {
  createProjectDeletionDraft,
  toProjectDeletionRequest,
  type ProjectDeletionCheckResult,
  type ProjectDeletionDraft,
  type ProjectDeletionExecuteResult,
} from './types.js';

export interface UseProjectDeletionState {
  open: Ref<boolean>;
  checking: Ref<boolean>;
  executing: Ref<boolean>;
  error: ShallowRef<Error | null>;
  checkResult: Ref<ProjectDeletionCheckResult | null>;
  executeResult: Ref<ProjectDeletionExecuteResult | null>;
  draft: Ref<ProjectDeletionDraft>;
  openDialog: (projectId: string) => Promise<void>;
  closeDialog: () => void;
  executeDeletion: () => Promise<ProjectDeletionExecuteResult | null>;
}

export function useProjectDeletion(
  onDeleted?: (result: ProjectDeletionExecuteResult) => Promise<void> | void,
): UseProjectDeletionState {
  const open = ref(false);
  const checking = ref(false);
  const executing = ref(false);
  const error = shallowRef<Error | null>(null);
  const checkResult = ref<ProjectDeletionCheckResult | null>(null);
  const executeResult = ref<ProjectDeletionExecuteResult | null>(null);
  const draft = ref<ProjectDeletionDraft>(createProjectDeletionDraft(null));
  const activeProjectId = ref<string | null>(null);

  async function openDialog(projectId: string): Promise<void> {
    activeProjectId.value = projectId;
    open.value = true;
    checking.value = true;
    error.value = null;
    executeResult.value = null;

    try {
      const result = await checkProjectDeletion(projectId);
      checkResult.value = result;
      draft.value = createProjectDeletionDraft(result);
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('项目删除检查失败');
      throw error.value;
    } finally {
      checking.value = false;
    }
  }

  function closeDialog(): void {
    open.value = false;
    checking.value = false;
    executing.value = false;
    error.value = null;
    checkResult.value = null;
    executeResult.value = null;
    draft.value = createProjectDeletionDraft(null);
    activeProjectId.value = null;
  }

  async function executeDeletion(): Promise<ProjectDeletionExecuteResult | null> {
    if (!activeProjectId.value) {
      return null;
    }

    executing.value = true;
    error.value = null;

    try {
      const result = await executeProjectDeletion(activeProjectId.value, toProjectDeletionRequest(draft.value));
      executeResult.value = result;

      if (onDeleted) {
        await onDeleted(result);
      }

      closeDialog();
      return result;
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('项目删除执行失败');
      throw error.value;
    } finally {
      executing.value = false;
    }
  }

  return {
    open,
    checking,
    executing,
    error,
    checkResult,
    executeResult,
    draft,
    openDialog,
    closeDialog,
    executeDeletion,
  };
}
