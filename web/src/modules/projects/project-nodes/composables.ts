import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';

import { useSessionStore } from '../../../runtime/index.js';
import { listWorkflows } from '../../workflows/api.js';
import { createProjectNode, getProjectNode, listProjectNodes, updateProjectNode } from './api.js';
import {
  buildProjectNodeTree,
  createProjectNodeDraft,
  projectNodeDraftFromDetail,
  useProjectNodesStore,
  type ProjectNodeDraft,
  type ProjectNodeEditorMode,
} from './store.js';
import type {
  ProjectNodeDetail,
  ProjectNodeStatus,
  ProjectNodeSummary,
} from '../../../../../shared/project-nodes/index.js';

export interface WorkflowOption {
  label: string;
  value: string;
}

export interface ParentNodeOption {
  label: string;
  value: string | null;
}

export interface UseProjectNodesState {
  items: Ref<ProjectNodeSummary[]>;
  orderedTree: ComputedRef<Array<ProjectNodeSummary & { depth: number }>>;
  listLoading: Ref<boolean>;
  workflowOptions: Ref<WorkflowOption[]>;
  workflowLoading: Ref<boolean>;
  selectedNodeId: ComputedRef<string | null>;
  selectedNodeDetail: ComputedRef<ProjectNodeDetail | null>;
  detailLoading: ComputedRef<boolean>;
  editorOpen: ComputedRef<boolean>;
  editorMode: ComputedRef<ProjectNodeEditorMode>;
  draft: Ref<ProjectNodeDraft>;
  saving: ComputedRef<boolean>;
  errorText: ComputedRef<string | null>;
  parentOptions: ComputedRef<ParentNodeOption[]>;
  initialize: () => Promise<void>;
  loadNodes: () => Promise<void>;
  selectNode: (projectNodeId: string | null) => Promise<void>;
  openCreateRoot: () => void;
  openCreateChild: (parentNodeId: string | null) => void;
  openEditSelected: () => void;
  closeEditor: () => void;
  saveNode: () => Promise<void>;
}

export function useProjectNodes(projectId: Ref<string | null>): UseProjectNodesState {
  const sessionStore = useSessionStore();
  const store = useProjectNodesStore();

  const items = ref<ProjectNodeSummary[]>([]);
  const listLoading = ref(false);
  const workflowOptions = ref<WorkflowOption[]>([]);
  const workflowLoading = ref(false);

  const selectedNodeId = computed(() => sessionStore.activeProjectNodeId);
  const orderedTree = computed(() => buildProjectNodeTree(items.value));
  const selectedNodeDetail = computed(() => store.selectedNodeDetail);
  const detailLoading = computed(() => store.detailLoading);
  const editorOpen = computed(() => store.editorOpen);
  const editorMode = computed(() => store.editorMode);
  const draft = computed({
    get: () => store.draft,
    set: (value: ProjectNodeDraft) => {
      store.draft = value;
    },
  });
  const saving = computed(() => store.saving);
  const errorText = computed(() => store.error);
  const parentOptions = computed(() => {
    const baseOptions: ParentNodeOption[] = [{ label: '根层节点', value: null }];
    const editingNodeId = store.editingNodeId;

    return baseOptions.concat(
      orderedTree.value
        .filter((item) => item.id !== editingNodeId)
        .map((item) => ({
          label: `${'　'.repeat(item.depth)}${item.name}`,
          value: item.id,
        })),
    );
  });

  watch(
    projectId,
    (nextProjectId) => {
      store.setSelectedNodeDetail(null);
      store.closeEditor();
      store.setError(null);
      sessionStore.setActiveProjectNodeId(null);

      if (!nextProjectId) {
        items.value = [];
        return;
      }

      void initialize();
    },
    { immediate: true },
  );

  async function initialize(): Promise<void> {
    await Promise.all([loadNodes(), ensureWorkflowOptions()]);
  }

  async function ensureWorkflowOptions(): Promise<void> {
    if (workflowLoading.value || workflowOptions.value.length > 0) {
      return;
    }

    workflowLoading.value = true;

    try {
      const workflows = await listWorkflows();
      workflowOptions.value = workflows.map((item) => ({
        label: item.name,
        value: item.id,
      }));
    } catch (cause) {
      store.setError(cause instanceof Error ? cause.message : '工作流候选加载失败');
    } finally {
      workflowLoading.value = false;
    }
  }

  async function loadNodes(): Promise<void> {
    if (!projectId.value) {
      items.value = [];
      return;
    }

    listLoading.value = true;
    store.setError(null);

    try {
      items.value = await listProjectNodes(projectId.value);

      const currentNodeId = sessionStore.activeProjectNodeId;
      const nextNodeId = currentNodeId && items.value.some((item) => item.id === currentNodeId)
        ? currentNodeId
        : items.value[0]?.id ?? null;

      await selectNode(nextNodeId);
    } catch (cause) {
      store.setError(cause instanceof Error ? cause.message : '项目节点列表加载失败');
      throw cause;
    } finally {
      listLoading.value = false;
    }
  }

  async function selectNode(projectNodeId: string | null): Promise<void> {
    sessionStore.setActiveProjectNodeId(projectNodeId);

    if (!projectNodeId) {
      store.setSelectedNodeDetail(null);
      return;
    }

    store.detailLoading = true;
    store.setError(null);

    try {
      const detail = await getProjectNode(projectNodeId);
      store.setSelectedNodeDetail(detail);
    } catch (cause) {
      store.setError(cause instanceof Error ? cause.message : '项目节点详情加载失败');
      throw cause;
    } finally {
      store.detailLoading = false;
    }
  }

  function openCreateRoot(): void {
    if (!projectId.value) {
      return;
    }

    store.openCreateEditor(projectId.value, null);
  }

  function openCreateChild(parentNodeId: string | null): void {
    if (!projectId.value) {
      return;
    }

    store.openCreateEditor(projectId.value, parentNodeId);
  }

  function openEditSelected(): void {
    if (!store.selectedNodeDetail) {
      return;
    }

    store.openEditEditor(store.selectedNodeDetail);
  }

  function closeEditor(): void {
    store.closeEditor();
  }

  async function saveNode(): Promise<void> {
    if (!projectId.value) {
      return;
    }

    store.saving = true;
    store.setError(null);

    try {
      const payload = {
        name: store.draft.name,
        description: store.draft.description,
        status: store.draft.status,
        parentNodeId: store.draft.parentNodeId,
        sortOrder: store.draft.sortOrder ?? undefined,
        workflowId: store.draft.workflowId,
      };

      const projectNode =
        store.editorMode === 'create'
          ? await createProjectNode(projectId.value, payload)
          : await updateProjectNode(store.editingNodeId as string, payload);

      sessionStore.setActiveProjectNodeId(projectNode.id);
      store.setSelectedNodeDetail(projectNode);
      store.closeEditor();
      await loadNodes();
    } catch (cause) {
      store.setError(cause instanceof Error ? cause.message : '项目节点保存失败');
      throw cause;
    } finally {
      store.saving = false;
    }
  }

  return {
    items,
    orderedTree,
    listLoading,
    workflowOptions,
    workflowLoading,
    selectedNodeId,
    selectedNodeDetail,
    detailLoading,
    editorOpen,
    editorMode,
    draft,
    saving,
    errorText,
    parentOptions,
    initialize,
    loadNodes,
    selectNode,
    openCreateRoot,
    openCreateChild,
    openEditSelected,
    closeEditor,
    saveNode,
  };
}
