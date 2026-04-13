<script setup lang="ts">
import { EmptyState, SectionCard } from '../../../../shared/components/index.js';
import NodeCard from './NodeCard.vue';
import type { ProjectNodeDetail } from '../../../../../../shared/project-nodes/index.js';

withDefaults(
  defineProps<{
    node: ProjectNodeDetail | null;
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

defineEmits<{
  edit: [];
  delete: [];
  createRoot: [];
  createChild: [parentNodeId: string | null];
}>();
</script>

<template>
  <SectionCard title="节点详情面板" description="详情、编辑态和局部草稿留在模块内 store，不塞回 runtime。">
    <template #actions>
      <n-button size="small" @click="$emit('createRoot')">新建根节点</n-button>
      <n-button size="small" :disabled="!node" @click="$emit('createChild', node?.id ?? null)">新建子节点</n-button>
      <n-button size="small" type="primary" :disabled="!node" @click="$emit('edit')">编辑当前节点</n-button>
      <n-button size="small" type="error" :disabled="!node" @click="$emit('delete')">删除当前节点</n-button>
    </template>

    <n-spin :show="loading">
      <EmptyState
        v-if="!node"
        title="还没有选中节点"
        description="先在左侧结构树中选择一个节点，或直接创建第一个根节点。"
      />

      <div v-else class="node-detail-panel">
        <NodeCard :node="node" selected />

        <dl class="node-detail-panel__meta">
          <div>
            <dt>节点 ID</dt>
            <dd>{{ node.id }}</dd>
          </div>
          <div>
            <dt>父节点</dt>
            <dd>{{ node.parentNodeId || '根层节点' }}</dd>
          </div>
          <div>
            <dt>工作流绑定</dt>
            <dd>{{ node.workflowId || '未绑定' }}</dd>
          </div>
          <div>
            <dt>所属项目</dt>
            <dd>{{ node.projectId }}</dd>
          </div>
        </dl>
      </div>
    </n-spin>
  </SectionCard>
</template>

<style scoped>
.node-detail-panel {
  display: grid;
  gap: 16px;
}

.node-detail-panel__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.node-detail-panel__meta div {
  min-width: 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.82);
}

.node-detail-panel__meta dt {
  margin-bottom: 4px;
  color: #8b7b6d;
  font-size: 12px;
}

.node-detail-panel__meta dd {
  margin: 0;
  color: #3f3429;
  word-break: break-all;
}

@media (max-width: 720px) {
  .node-detail-panel__meta {
    grid-template-columns: 1fr;
  }
}
</style>
