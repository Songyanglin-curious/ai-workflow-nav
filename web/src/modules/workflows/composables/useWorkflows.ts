import { computed, ref, shallowRef, type ComputedRef, type Ref, type ShallowRef } from 'vue';

import { createWorkflow, deleteWorkflow, getWorkflow, listWorkflows, updateWorkflow } from '../api.js';
import {
  createWorkflowDraft,
  selectWorkflowSummary,
  upsertWorkflowSummary,
  workflowDraftFromDetail,
  workflowSummaryFromDetail,
  type WorkflowDetail,
  type WorkflowDraft,
  type WorkflowSummary,
} from '../types.js';

export interface UseWorkflowsState {
  items: Ref<WorkflowSummary[]>;
  selectedWorkflowId: Ref<string | null>;
  selectedWorkflow: Ref<WorkflowDetail | null>;
  draft: Ref<WorkflowDraft>;
  loadingList: Ref<boolean>;
  loadingDetail: Ref<boolean>;
  saving: Ref<boolean>;
  deleting: Ref<boolean>;
  error: ShallowRef<Error | null>;
  selectedSummary: ComputedRef<WorkflowSummary | null>;
  isCreating: ComputedRef<boolean>;
  loadWorkflows: (preferredWorkflowId?: string) => Promise<void>;
  selectWorkflow: (workflowId: string) => Promise<void>;
  startCreateWorkflow: () => void;
  saveWorkflow: () => Promise<WorkflowDetail>;
  deleteSelectedWorkflow: (workflowId: string) => Promise<void>;
  resetDraft: () => void;
}

export function useWorkflows(): UseWorkflowsState {
  const items = ref<WorkflowSummary[]>([]);
  const selectedWorkflowId = ref<string | null>(null);
  const selectedWorkflow = ref<WorkflowDetail | null>(null);
  const draft = ref<WorkflowDraft>(createWorkflowDraft());
  const loadingList = ref(false);
  const loadingDetail = ref(false);
  const saving = ref(false);
  const deleting = ref(false);
  const error = shallowRef<Error | null>(null);

  const selectedSummary = computed(() => {
    if (!selectedWorkflowId.value) {
      return null;
    }

    return selectWorkflowSummary(items.value, selectedWorkflowId.value);
  });

  const isCreating = computed(() => selectedWorkflowId.value === null);

  async function loadWorkflows(preferredWorkflowId?: string): Promise<void> {
    loadingList.value = true;
    error.value = null;

    try {
      items.value = await listWorkflows();

      const nextWorkflowId = preferredWorkflowId ?? selectedWorkflowId.value;

      if (nextWorkflowId && items.value.some((item) => item.id === nextWorkflowId)) {
        if (selectedWorkflowId.value !== nextWorkflowId || selectedWorkflow.value === null) {
          await selectWorkflow(nextWorkflowId);
        }
        return;
      }

      if (items.value.length > 0) {
        await selectWorkflow(items.value[0].id);
        return;
      }

      startCreateWorkflow();
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('工作流列表加载失败');
      throw error.value;
    } finally {
      loadingList.value = false;
    }
  }

  async function selectWorkflow(workflowId: string): Promise<void> {
    selectedWorkflowId.value = workflowId;
    loadingDetail.value = true;
    error.value = null;

    try {
      const workflow = await getWorkflow(workflowId);
      selectedWorkflow.value = workflow;
      draft.value = workflowDraftFromDetail(workflow);
      items.value = upsertWorkflowSummary(items.value, workflowSummaryFromDetail(workflow));
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('工作流详情加载失败');
      throw error.value;
    } finally {
      loadingDetail.value = false;
    }
  }

  function startCreateWorkflow(): void {
    selectedWorkflowId.value = null;
    selectedWorkflow.value = null;
    draft.value = createWorkflowDraft();
    error.value = null;
  }

  function resetDraft(): void {
    if (selectedWorkflow.value) {
      draft.value = workflowDraftFromDetail(selectedWorkflow.value);
      return;
    }

    draft.value = createWorkflowDraft();
  }

  async function saveWorkflow(): Promise<WorkflowDetail> {
    saving.value = true;
    error.value = null;

    try {
      const workflow = selectedWorkflowId.value
        ? await updateWorkflow(selectedWorkflowId.value, draft.value)
        : await createWorkflow(draft.value);

      selectedWorkflowId.value = workflow.id;
      selectedWorkflow.value = workflow;
      draft.value = workflowDraftFromDetail(workflow);
      items.value = upsertWorkflowSummary(items.value, workflowSummaryFromDetail(workflow));

      return workflow;
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('工作流保存失败');
      throw error.value;
    } finally {
      saving.value = false;
    }
  }

  async function deleteSelectedWorkflow(workflowId: string): Promise<void> {
    deleting.value = true;
    error.value = null;

    try {
      await deleteWorkflow(workflowId);
      selectedWorkflowId.value = null;
      selectedWorkflow.value = null;
      draft.value = createWorkflowDraft();
      await loadWorkflows();
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('工作流删除失败');
      throw error.value;
    } finally {
      deleting.value = false;
    }
  }

  return {
    items,
    selectedWorkflowId,
    selectedWorkflow,
    draft,
    loadingList,
    loadingDetail,
    saving,
    deleting,
    error,
    selectedSummary,
    isCreating,
    loadWorkflows,
    selectWorkflow,
    startCreateWorkflow,
    saveWorkflow,
    deleteSelectedWorkflow,
    resetDraft,
  };
}
