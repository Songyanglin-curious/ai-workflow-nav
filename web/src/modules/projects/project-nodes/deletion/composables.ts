import { ref, shallowRef, type Ref, type ShallowRef } from 'vue';

import { checkProjectNodeDeletion, executeProjectNodeDeletion } from './api.js';
import {
  createProjectNodeDeletionDraft,
  toProjectNodeDeletionRequest,
  type ProjectNodeDeletionCheckResult,
  type ProjectNodeDeletionDraft,
  type ProjectNodeDeletionExecuteResult,
} from './types.js';

export interface UseProjectNodeDeletionState {
  open: Ref<boolean>;
  checking: Ref<boolean>;
  executing: Ref<boolean>;
  error: ShallowRef<Error | null>;
  checkResult: Ref<ProjectNodeDeletionCheckResult | null>;
  executeResult: Ref<ProjectNodeDeletionExecuteResult | null>;
  draft: Ref<ProjectNodeDeletionDraft>;
  openDialog: (projectNodeId: string) => Promise<void>;
  closeDialog: () => void;
  executeDeletion: () => Promise<ProjectNodeDeletionExecuteResult | null>;
}

export function useProjectNodeDeletion(
  onDeleted?: (result: ProjectNodeDeletionExecuteResult) => Promise<void> | void,
): UseProjectNodeDeletionState {
  const open = ref(false);
  const checking = ref(false);
  const executing = ref(false);
  const error = shallowRef<Error | null>(null);
  const checkResult = ref<ProjectNodeDeletionCheckResult | null>(null);
  const executeResult = ref<ProjectNodeDeletionExecuteResult | null>(null);
  const draft = ref<ProjectNodeDeletionDraft>(createProjectNodeDeletionDraft(null));
  const activeProjectNodeId = ref<string | null>(null);

  async function openDialog(projectNodeId: string): Promise<void> {
    activeProjectNodeId.value = projectNodeId;
    open.value = true;
    checking.value = true;
    error.value = null;
    executeResult.value = null;

    try {
      const result = await checkProjectNodeDeletion(projectNodeId);
      checkResult.value = result;
      draft.value = createProjectNodeDeletionDraft(result);
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('节点删除检查失败');
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
    draft.value = createProjectNodeDeletionDraft(null);
    activeProjectNodeId.value = null;
  }

  async function executeDeletion(): Promise<ProjectNodeDeletionExecuteResult | null> {
    if (!activeProjectNodeId.value) {
      return null;
    }

    executing.value = true;
    error.value = null;

    try {
      const result = await executeProjectNodeDeletion(
        activeProjectNodeId.value,
        toProjectNodeDeletionRequest(draft.value),
      );
      executeResult.value = result;

      if (onDeleted) {
        await onDeleted(result);
      }

      closeDialog();
      return result;
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('节点删除执行失败');
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
