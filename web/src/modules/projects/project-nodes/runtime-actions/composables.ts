import { computed, ref, shallowRef, watch, type ComputedRef, type Ref, type ShallowRef } from 'vue';

import { useSessionStore } from '../../../../runtime/index.js';
import { getWorkflowRuntimeNodeDetail, triggerWorkflowRuntimeNodeAction } from './api.js';
import type { ProjectNodeDetail } from '../../../../../../shared/project-nodes/index.js';
import type { WorkflowRuntimeNodeDetail, WorkflowRuntimeTriggerResult } from './types.js';

type PromptCopyStatus = 'idle' | 'copied' | 'failed';

export interface UseProjectNodeRuntimeActionsState {
  selectedWorkflowNodeId: ComputedRef<string>;
  detailLoading: Ref<boolean>;
  triggerLoading: Ref<boolean>;
  error: ShallowRef<Error | null>;
  detail: Ref<WorkflowRuntimeNodeDetail | null>;
  triggerResult: Ref<WorkflowRuntimeTriggerResult | null>;
  promptCopyStatus: Ref<PromptCopyStatus>;
  promptCopyError: ShallowRef<Error | null>;
  refreshDetail: () => Promise<void>;
  triggerAction: () => Promise<WorkflowRuntimeTriggerResult | null>;
  retryCopyPromptText: () => Promise<void>;
}

async function writeTextToClipboard(copyText: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('当前浏览器环境不支持剪贴板写入');
  }

  await navigator.clipboard.writeText(copyText);
}

export function useProjectNodeRuntimeActions(
  projectNode: Ref<ProjectNodeDetail | null>,
): UseProjectNodeRuntimeActionsState {
  const sessionStore = useSessionStore();

  const detailLoading = ref(false);
  const triggerLoading = ref(false);
  const error = shallowRef<Error | null>(null);
  const detail = ref<WorkflowRuntimeNodeDetail | null>(null);
  const triggerResult = ref<WorkflowRuntimeTriggerResult | null>(null);
  const promptCopyStatus = ref<PromptCopyStatus>('idle');
  const promptCopyError = shallowRef<Error | null>(null);

  const selectedWorkflowNodeId = computed({
    get: () => sessionStore.activeWorkflowNodeId ?? '',
    set: (value: string) => {
      sessionStore.setActiveWorkflowNodeId(value.trim() || null);
      triggerResult.value = null;
      promptCopyStatus.value = 'idle';
      promptCopyError.value = null;
    },
  });

  async function refreshDetail(): Promise<void> {
    const projectNodeId = projectNode.value?.id;
    const hasWorkflow = Boolean(projectNode.value?.workflowId);
    const mermaidNodeId = sessionStore.activeWorkflowNodeId;

    error.value = null;
    detail.value = null;

    if (!projectNodeId || !hasWorkflow || !mermaidNodeId) {
      return;
    }

    detailLoading.value = true;

    try {
      detail.value = await getWorkflowRuntimeNodeDetail(projectNodeId, mermaidNodeId);
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('运行时动作详情加载失败');
    } finally {
      detailLoading.value = false;
    }
  }

  async function retryCopyPromptText(): Promise<void> {
    if (!triggerResult.value || triggerResult.value.actionType !== 'prompt') {
      return;
    }

    promptCopyStatus.value = 'idle';
    promptCopyError.value = null;

    try {
      await writeTextToClipboard(triggerResult.value.copyText);
      promptCopyStatus.value = 'copied';
    } catch (cause) {
      promptCopyStatus.value = 'failed';
      promptCopyError.value = cause instanceof Error ? cause : new Error('Prompt 复制失败');
    }
  }

  async function triggerAction(): Promise<WorkflowRuntimeTriggerResult | null> {
    const projectNodeId = projectNode.value?.id;
    const hasWorkflow = Boolean(projectNode.value?.workflowId);
    const mermaidNodeId = sessionStore.activeWorkflowNodeId;

    if (!projectNodeId || !hasWorkflow || !mermaidNodeId) {
      return null;
    }

    triggerLoading.value = true;
    error.value = null;
    triggerResult.value = null;
    promptCopyStatus.value = 'idle';
    promptCopyError.value = null;

    try {
      const result = await triggerWorkflowRuntimeNodeAction(projectNodeId, mermaidNodeId);
      triggerResult.value = result;

      if (result.actionType === 'prompt') {
        await retryCopyPromptText();
      }

      return result;
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('运行时动作触发失败');
      throw error.value;
    } finally {
      triggerLoading.value = false;
    }
  }

  watch(
    [
      () => projectNode.value?.id ?? null,
      () => projectNode.value?.workflowId ?? null,
      () => sessionStore.activeWorkflowNodeId,
    ],
    () => {
      triggerResult.value = null;
      promptCopyStatus.value = 'idle';
      promptCopyError.value = null;
      void refreshDetail();
    },
    { immediate: true },
  );

  return {
    selectedWorkflowNodeId,
    detailLoading,
    triggerLoading,
    error,
    detail,
    triggerResult,
    promptCopyStatus,
    promptCopyError,
    refreshDetail,
    triggerAction,
    retryCopyPromptText,
  };
}
