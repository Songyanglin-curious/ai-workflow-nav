<script setup lang="ts">
import { EmptyState, SectionCard } from '../../../../shared/components/index.js';
import type { ProjectNodeSummary } from '../../../../../../shared/project-nodes/index.js';

withDefaults(
  defineProps<{
    items: Array<ProjectNodeSummary & { depth: number }>;
    selectedNodeId: string | null;
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

defineEmits<{
  select: [projectNodeId: string];
  createRoot: [];
}>();
</script>

<template>
  <SectionCard title="节点侧边树" description="左侧只作为结构列表，不与后续主画布形成双中心。">
    <template #actions>
      <n-button size="small" type="primary" @click="$emit('createRoot')">新建根节点</n-button>
    </template>

    <n-spin :show="loading">
      <EmptyState
        v-if="items.length === 0"
        title="还没有项目节点"
        description="先创建一个根节点，再逐步展开项目结构。"
        action-label="新建根节点"
        @action="$emit('createRoot')"
      />

      <div v-else class="project-node-sidebar-tree">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="project-node-sidebar-tree__item"
          :class="{ 'is-active': item.id === selectedNodeId }"
          :style="{ '--node-depth': item.depth.toString() }"
          @click="$emit('select', item.id)"
        >
          <span class="project-node-sidebar-tree__branch" />
          <div class="project-node-sidebar-tree__copy">
            <strong>{{ item.name }}</strong>
            <small>{{ item.status }} · 排序 {{ item.sortOrder }}</small>
          </div>
        </button>
      </div>
    </n-spin>
  </SectionCard>
</template>

<style scoped>
.project-node-sidebar-tree {
  display: grid;
  gap: 8px;
}

.project-node-sidebar-tree__item {
  --indent: calc(var(--node-depth) * 18px);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 12px 12px 12px calc(12px + var(--indent));
  border: 1px solid rgba(120, 92, 56, 0.12);
  border-radius: 16px;
  background: rgba(255, 252, 247, 0.8);
  text-align: left;
  cursor: pointer;
}

.project-node-sidebar-tree__item.is-active {
  border-color: rgba(18, 113, 93, 0.42);
  background: linear-gradient(135deg, rgba(18, 113, 93, 0.1), rgba(255, 252, 247, 0.98));
}

.project-node-sidebar-tree__branch {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #12715d;
}

.project-node-sidebar-tree__copy {
  display: grid;
  gap: 2px;
}

.project-node-sidebar-tree__copy small {
  color: #8b7b6d;
}
</style>
