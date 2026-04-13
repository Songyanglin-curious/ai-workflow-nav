import { computed, ref, shallowRef, watch, type ComputedRef, type Ref, type ShallowRef } from 'vue';

import { listPrompts } from '../../prompts/api.js';
import { createNodeAction, deleteNodeAction, listNodeActions, syncNodeActions, updateNodeAction } from './api.js';
import {
  createNodeActionDraft,
  toNodeActionDraft,
  toPromptTargetOptions,
  type NodeActionDraft,
  type NodeActionEditorMode,
  type PromptTargetOption,
  type WorkflowNodeActionItem,
  type WorkflowNodeActionSyncResult,
} from './types.js';

export interface UseWorkflowNodeActionsState {
  items: Ref<WorkflowNodeActionItem[]>;
  loading: Ref<boolean>;
  saving: Ref<boolean>;
  deleting: Ref<boolean>;
  syncing: Ref<boolean>;
  error: ShallowRef<Error | null>;
  editorOpen: Ref<boolean>;
  editorMode: Ref<NodeActionEditorMode>;
  draft: Ref<NodeActionDraft>;
  deleteTarget: Ref<WorkflowNodeActionItem | null>;
  syncResult: Ref<WorkflowNodeActionSyncResult | null>;
  promptOptions: Ref<PromptTargetOption[]>;
  promptLoading: Ref<boolean>;
  promptError: Ref<string | null>;
  hasWorkflow: ComputedRef<boolean>;
  loadNodeActions: () => Promise<void>;
  openCreate: () => void;
  openEdit: (nodeAction: WorkflowNodeActionItem) => void;
  closeEditor: () => void;
  saveNodeAction: () => Promise<void>;
  requestDelete: (nodeAction: WorkflowNodeActionItem) => void;
  cancelDelete: () => void;
  confirmDelete: () => Promise<void>;
  syncBindings: () => Promise<void>;
}

export function useWorkflowNodeActions(workflowId: Ref<string | null>): UseWorkflowNodeActionsState {
  const items = ref<WorkflowNodeActionItem[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const deleting = ref(false);
  const syncing = ref(false);
  const error = shallowRef<Error | null>(null);

  const editorOpen = ref(false);
  const editorMode = ref<NodeActionEditorMode>('create');
  const editingAction = ref<WorkflowNodeActionItem | null>(null);
  const draft = ref<NodeActionDraft>(createNodeActionDraft());

  const deleteTarget = ref<WorkflowNodeActionItem | null>(null);
  const syncResult = ref<WorkflowNodeActionSyncResult | null>(null);

  const promptOptions = ref<PromptTargetOption[]>([]);
  const promptLoading = ref(false);
  const promptError = ref<string | null>(null);

  const hasWorkflow = computed(() => workflowId.value !== null);

  watch(
    workflowId,
    (nextWorkflowId) => {
      editorOpen.value = false;
      deleteTarget.value = null;
      syncResult.value = null;
      editingAction.value = null;
      draft.value = createNodeActionDraft();
      error.value = null;

      if (!nextWorkflowId) {
        items.value = [];
        return;
      }

      void loadNodeActions();
      void ensurePromptOptions();
    },
    { immediate: true },
  );

  async function ensurePromptOptions(): Promise<void> {
    if (promptLoading.value || promptOptions.value.length > 0) {
      return;
    }

    promptLoading.value = true;
    promptError.value = null;

    try {
      const prompts = await listPrompts();
      promptOptions.value = toPromptTargetOptions(prompts);
    } catch (cause) {
      promptError.value = cause instanceof Error ? cause.message : 'Prompt 候选加载失败';
    } finally {
      promptLoading.value = false;
    }
  }

  async function loadNodeActions(): Promise<void> {
    if (!workflowId.value) {
      items.value = [];
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      items.value = await listNodeActions(workflowId.value);
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('节点动作列表加载失败');
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  function openCreate(): void {
    if (!workflowId.value) {
      return;
    }

    editorMode.value = 'create';
    editingAction.value = null;
    draft.value = createNodeActionDraft();
    error.value = null;
    editorOpen.value = true;
    void ensurePromptOptions();
  }

  function openEdit(nodeAction: WorkflowNodeActionItem): void {
    editorMode.value = 'edit';
    editingAction.value = nodeAction;
    draft.value = toNodeActionDraft(nodeAction);
    error.value = null;
    editorOpen.value = true;
    void ensurePromptOptions();
  }

  function closeEditor(): void {
    editorOpen.value = false;
    editingAction.value = null;
    draft.value = createNodeActionDraft();
    error.value = null;
  }

  async function saveNodeAction(): Promise<void> {
    if (!workflowId.value) {
      return;
    }

    saving.value = true;
    error.value = null;

    try {
      if (editorMode.value === 'create') {
        await createNodeAction(workflowId.value, draft.value);
      } else if (editingAction.value) {
        await updateNodeAction(workflowId.value, editingAction.value.mermaidNodeId, {
          actionType: draft.value.actionType,
          targetRef: draft.value.targetRef,
        });
      }

      closeEditor();
      await loadNodeActions();
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('节点动作保存失败');
      throw error.value;
    } finally {
      saving.value = false;
    }
  }

  function requestDelete(nodeAction: WorkflowNodeActionItem): void {
    deleteTarget.value = nodeAction;
    error.value = null;
  }

  function cancelDelete(): void {
    deleteTarget.value = null;
    error.value = null;
  }

  async function confirmDelete(): Promise<void> {
    if (!workflowId.value || !deleteTarget.value) {
      return;
    }

    deleting.value = true;
    error.value = null;

    try {
      await deleteNodeAction(workflowId.value, deleteTarget.value.mermaidNodeId);
      cancelDelete();
      await loadNodeActions();
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('节点动作删除失败');
      throw error.value;
    } finally {
      deleting.value = false;
    }
  }

  async function syncBindings(): Promise<void> {
    if (!workflowId.value) {
      return;
    }

    syncing.value = true;
    error.value = null;

    try {
      syncResult.value = await syncNodeActions(workflowId.value);
      await loadNodeActions();
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('节点动作同步失败');
      throw error.value;
    } finally {
      syncing.value = false;
    }
  }

  return {
    items,
    loading,
    saving,
    deleting,
    syncing,
    error,
    editorOpen,
    editorMode,
    draft,
    deleteTarget,
    syncResult,
    promptOptions,
    promptLoading,
    promptError,
    hasWorkflow,
    loadNodeActions,
    openCreate,
    openEdit,
    closeEditor,
    saveNodeAction,
    requestDelete,
    cancelDelete,
    confirmDelete,
    syncBindings,
  };
}
