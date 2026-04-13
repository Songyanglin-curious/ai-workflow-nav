<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Edge, Node, NodeDragEvent, NodeMouseEvent, ViewportTransform, VueFlowStore } from '@vue-flow/core';
import { Handle, Position, VueFlow } from '@vue-flow/core';

import { EmptyState } from '../../../../shared/components/index.js';
import NodeCard from '../../project-nodes/components/NodeCard.vue';
import type { ViewportSnapshot } from '../composables.js';
import type { ProjectNodeSummary } from '../../../../../../shared/project-nodes/index.js';

interface CanvasNodeData {
  node: ProjectNodeSummary & { depth: number };
}

const props = withDefaults(
  defineProps<{
    nodes: Array<Node<CanvasNodeData>>;
    edges: Edge[];
    defaultViewport: ViewportSnapshot;
    restoreViewport: ViewportSnapshot | null;
    restoreViewportVersion: number;
    savingLayouts?: boolean;
  }>(),
  {
    savingLayouts: false,
  },
);

const emit = defineEmits<{
  'select-node': [projectNodeId: string];
  'commit-layouts': [items: Array<{ projectNodeId: string; positionX: number; positionY: number }>];
  'viewport-change': [viewport: ViewportSnapshot];
}>();

const localNodes = ref<Array<Node<CanvasNodeData>>>([]);
const flowStore = ref<VueFlowStore | null>(null);

const hasNodes = computed(() => props.nodes.length > 0);

watch(
  () => props.nodes,
  (nextNodes) => {
    localNodes.value = nextNodes.map((item) => ({
      ...item,
      position: {
        x: item.position.x,
        y: item.position.y,
      },
    }));
  },
  { immediate: true, deep: true },
);

async function restoreViewportIntoCanvas(): Promise<void> {
  if (!flowStore.value || !props.restoreViewport) {
    return;
  }

  await flowStore.value.setViewport({
    x: props.restoreViewport.x,
    y: props.restoreViewport.y,
    zoom: props.restoreViewport.zoom,
  });
}

watch(
  () => props.restoreViewportVersion,
  () => {
    void restoreViewportIntoCanvas();
  },
);

function emitViewport(viewport: ViewportTransform): void {
  emit('viewport-change', {
    x: viewport.x,
    y: viewport.y,
    zoom: viewport.zoom,
  });
}

function handlePaneReady(store: VueFlowStore): void {
  flowStore.value = store;
  void restoreViewportIntoCanvas().then(() => {
    emitViewport(store.getViewport());
  });
}

function handleMoveEnd(event: { flowTransform: ViewportTransform }): void {
  emitViewport(event.flowTransform);
}

function handleNodeClick(event: NodeMouseEvent): void {
  emit('select-node', event.node.id);
}

function handleNodeDragStop(event: NodeDragEvent): void {
  emit(
    'commit-layouts',
    event.nodes.map((node) => ({
      projectNodeId: node.id,
      positionX: node.position.x,
      positionY: node.position.y,
    })),
  );
}
</script>

<template>
  <section class="project-canvas">
    <EmptyState
      v-if="!hasNodes"
      title="主画布还没有节点"
      description="先创建项目节点，随后在唯一画布中心上查看结构关系与持久化布局。"
    />

    <div v-else class="project-canvas__frame">
      <VueFlow
        v-model:nodes="localNodes"
        :edges="edges"
        :default-viewport="defaultViewport"
        :fit-view-on-init="false"
        :nodes-draggable="true"
        :nodes-connectable="false"
        :elements-selectable="true"
        :min-zoom="0.2"
        :max-zoom="2"
        class="project-canvas__flow"
        @pane-ready="handlePaneReady"
        @move-end="handleMoveEnd"
        @node-click="handleNodeClick"
        @node-drag-stop="handleNodeDragStop"
      >
        <template #node-project-node="nodeProps">
          <div class="project-canvas__custom-node">
            <Handle type="target" :position="Position.Left" class="project-canvas__handle" />
            <NodeCard :node="nodeProps.data.node" :selected="nodeProps.selected" compact />
            <Handle type="source" :position="Position.Right" class="project-canvas__handle" />
          </div>
        </template>
      </VueFlow>

      <p v-if="savingLayouts" class="project-canvas__saving">正在保存节点布局…</p>
    </div>
  </section>
</template>

<style scoped>
.project-canvas {
  min-height: 0;
}

.project-canvas__frame {
  position: relative;
  min-height: 560px;
  border: 1px solid rgba(120, 92, 56, 0.14);
  border-radius: 24px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(18, 113, 93, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(255, 252, 247, 0.96), rgba(248, 243, 235, 0.96));
}

.project-canvas__flow {
  width: 100%;
  height: 560px;
}

.project-canvas__custom-node {
  position: relative;
}

.project-canvas__handle {
  width: 10px;
  height: 10px;
  opacity: 0;
}

.project-canvas__saving {
  position: absolute;
  right: 16px;
  bottom: 16px;
  margin: 0;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 250, 242, 0.92);
  border: 1px solid rgba(120, 92, 56, 0.14);
  color: #6f6255;
  font-size: 12px;
}
</style>
