import { computed, ref, shallowRef, watch, type ComputedRef, type Ref, type ShallowRef } from 'vue';
import type { Edge, Node, ViewportTransform } from '@vue-flow/core';

import { HttpClientError } from '../../../shared/api/index.js';
import { getProjectViewport, listProjectNodeLayouts, patchProjectNodeLayouts, patchProjectViewport } from './api.js';
import type {
  ProjectNodeLayoutItem,
  ProjectViewport,
} from '../../../../../shared/projects/index.js';
import type { ProjectNodeSummary } from '../../../../../shared/project-nodes/index.js';

interface OrderedProjectNode extends ProjectNodeSummary {
  depth: number;
}

interface CanvasNodeData {
  node: OrderedProjectNode;
}

export interface ViewportSnapshot {
  x: number;
  y: number;
  zoom: number;
}

export interface NodeLayoutCommitItem {
  projectNodeId: string;
  positionX: number;
  positionY: number;
}

export interface UseProjectViewConfigState {
  canvasNodes: Ref<Array<Node<CanvasNodeData>>>;
  canvasEdges: ComputedRef<Edge[]>;
  layoutsLoading: Ref<boolean>;
  layoutsSaving: Ref<boolean>;
  viewportLoading: Ref<boolean>;
  viewportSaving: Ref<boolean>;
  error: ShallowRef<Error | null>;
  persistedViewport: Ref<ProjectViewport | null>;
  defaultViewport: Ref<ViewportSnapshot>;
  restoreViewport: Ref<ViewportSnapshot | null>;
  restoreViewportVersion: Ref<number>;
  currentViewport: Ref<ViewportSnapshot>;
  saveNodeLayouts: (items: NodeLayoutCommitItem[]) => Promise<void>;
  recordViewport: (viewport: ViewportSnapshot) => void;
  saveCurrentViewport: () => Promise<void>;
  restoreSavedViewport: () => void;
  restoreDefaultViewport: () => void;
}

const defaultViewportValue: ViewportSnapshot = {
  x: 0,
  y: 0,
  zoom: 1,
};

function toViewportSnapshot(viewport: Pick<ProjectViewport, 'viewportX' | 'viewportY' | 'zoom'>): ViewportSnapshot {
  return {
    x: viewport.viewportX,
    y: viewport.viewportY,
    zoom: viewport.zoom,
  };
}

function createLayoutMap(items: ProjectNodeLayoutItem[]): Record<string, { x: number; y: number }> {
  return Object.fromEntries(
    items.map((item) => [
      item.projectNodeId,
      {
        x: item.positionX,
        y: item.positionY,
      },
    ]),
  );
}

function createDefaultNodePosition(node: OrderedProjectNode, index: number): { x: number; y: number } {
  return {
    x: 80 + node.depth * 320,
    y: 80 + index * 150,
  };
}

function buildCanvasNodes(
  items: OrderedProjectNode[],
  layoutMap: Record<string, { x: number; y: number }>,
  selectedNodeId: string | null,
): Array<Node<CanvasNodeData>> {
  return items.map((item, index) => ({
    id: item.id,
    type: 'project-node',
    position: layoutMap[item.id] ?? createDefaultNodePosition(item, index),
    data: {
      node: item,
    },
    selected: item.id === selectedNodeId,
  }));
}

function buildCanvasEdges(items: OrderedProjectNode[]): Edge[] {
  return items
    .filter((item) => item.parentNodeId)
    .map((item) => ({
      id: `edge-${item.parentNodeId}-${item.id}`,
      source: item.parentNodeId as string,
      target: item.id,
      type: 'smoothstep',
      animated: false,
    }));
}

export function useProjectViewConfig(
  projectId: Ref<string | null>,
  orderedTree: Ref<OrderedProjectNode[]>,
  selectedNodeId: Ref<string | null>,
): UseProjectViewConfigState {
  const layoutsLoading = ref(false);
  const layoutsSaving = ref(false);
  const viewportLoading = ref(false);
  const viewportSaving = ref(false);
  const error = shallowRef<Error | null>(null);
  const persistedViewport = ref<ProjectViewport | null>(null);
  const defaultViewport = ref<ViewportSnapshot>({ ...defaultViewportValue });
  const restoreViewport = ref<ViewportSnapshot | null>(null);
  const restoreViewportVersion = ref(0);
  const currentViewport = ref<ViewportSnapshot>({ ...defaultViewportValue });
  const canvasNodes = ref<Array<Node<CanvasNodeData>>>([]);
  const layoutMap = ref<Record<string, { x: number; y: number }>>({});

  const canvasEdges = computed(() => buildCanvasEdges(orderedTree.value));

  function syncCanvasNodes(): void {
    canvasNodes.value = buildCanvasNodes(orderedTree.value, layoutMap.value, selectedNodeId.value);
  }

  function triggerViewportRestore(viewport: ViewportSnapshot): void {
    restoreViewport.value = { ...viewport };
    currentViewport.value = { ...viewport };
    restoreViewportVersion.value += 1;
  }

  async function loadProjectLayouts(activeProjectId: string): Promise<void> {
    layoutsLoading.value = true;

    try {
      const layouts = await listProjectNodeLayouts(activeProjectId);
      layoutMap.value = createLayoutMap(layouts);
      syncCanvasNodes();
    } finally {
      layoutsLoading.value = false;
    }
  }

  async function loadProjectViewport(activeProjectId: string): Promise<void> {
    viewportLoading.value = true;

    try {
      const viewport = await getProjectViewport(activeProjectId);
      persistedViewport.value = viewport;
      triggerViewportRestore(toViewportSnapshot(viewport));
    } catch (cause) {
      if (cause instanceof HttpClientError && cause.code === 'PROJECT_VIEWPORT_NOT_FOUND') {
        persistedViewport.value = null;
        triggerViewportRestore(defaultViewport.value);
        return;
      }

      throw cause;
    } finally {
      viewportLoading.value = false;
    }
  }

  async function loadProjectViewConfig(activeProjectId: string): Promise<void> {
    error.value = null;

    try {
      await Promise.all([loadProjectLayouts(activeProjectId), loadProjectViewport(activeProjectId)]);
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('项目视图配置加载失败');
    }
  }

  async function saveNodeLayouts(items: NodeLayoutCommitItem[]): Promise<void> {
    if (!projectId.value || items.length === 0) {
      return;
    }

    layoutsSaving.value = true;
    error.value = null;

    try {
      await patchProjectNodeLayouts(projectId.value, {
        items,
      });

      layoutMap.value = {
        ...layoutMap.value,
        ...Object.fromEntries(
          items.map((item) => [
            item.projectNodeId,
            {
              x: item.positionX,
              y: item.positionY,
            },
          ]),
        ),
      };
      syncCanvasNodes();
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('项目节点布局保存失败');
      throw error.value;
    } finally {
      layoutsSaving.value = false;
    }
  }

  function recordViewport(viewport: ViewportSnapshot): void {
    currentViewport.value = { ...viewport };
  }

  async function saveCurrentViewport(): Promise<void> {
    if (!projectId.value) {
      return;
    }

    viewportSaving.value = true;
    error.value = null;

    try {
      const viewport = await patchProjectViewport(projectId.value, {
        viewportX: currentViewport.value.x,
        viewportY: currentViewport.value.y,
        zoom: currentViewport.value.zoom,
      });
      persistedViewport.value = viewport;
      currentViewport.value = toViewportSnapshot(viewport);
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('项目视角保存失败');
      throw error.value;
    } finally {
      viewportSaving.value = false;
    }
  }

  function restoreSavedViewport(): void {
    if (!persistedViewport.value) {
      triggerViewportRestore(defaultViewport.value);
      return;
    }

    triggerViewportRestore(toViewportSnapshot(persistedViewport.value));
  }

  function restoreDefaultViewport(): void {
    triggerViewportRestore(defaultViewport.value);
  }

  watch(
    projectId,
    (nextProjectId) => {
      error.value = null;
      layoutMap.value = {};
      canvasNodes.value = [];
      persistedViewport.value = null;
      currentViewport.value = { ...defaultViewportValue };
      restoreViewport.value = { ...defaultViewportValue };
      restoreViewportVersion.value += 1;

      if (!nextProjectId) {
        return;
      }

      void loadProjectViewConfig(nextProjectId);
    },
    { immediate: true },
  );

  watch(
    [orderedTree, selectedNodeId],
    () => {
      syncCanvasNodes();
    },
    { immediate: true },
  );

  const state = {
    canvasNodes,
    canvasEdges,
    layoutsLoading,
    layoutsSaving,
    viewportLoading,
    viewportSaving,
    error,
    persistedViewport,
    defaultViewport,
    restoreViewport,
    restoreViewportVersion,
    currentViewport,
    saveNodeLayouts,
    recordViewport,
    saveCurrentViewport,
    restoreSavedViewport,
    restoreDefaultViewport,
  } as UseProjectViewConfigState;

  return state;
}
