<script setup lang="ts">
import { EmptyState } from '../../../shared/components/index.js';
import { formatWorkflowTime, type WorkflowSummary } from '../types.js';

withDefaults(
  defineProps<{
    items: WorkflowSummary[];
    selectedId: string | null;
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

defineEmits<{
  select: [workflowId: string];
  create: [];
  refresh: [];
}>();
</script>

<template>
  <section class="workflow-list">
    <header class="workflow-list__header">
      <div>
        <p class="workflow-list__eyebrow">Workflow 列表</p>
        <h2>工作流资源</h2>
      </div>

      <div class="workflow-list__actions">
        <n-button size="small" @click="$emit('refresh')">刷新</n-button>
        <n-button size="small" type="primary" @click="$emit('create')">新建</n-button>
      </div>
    </header>

    <n-spin :show="loading">
      <EmptyState
        v-if="items.length === 0"
        title="暂无工作流"
        description="先新建一个工作流，再进入编辑与节点绑定。"
        action-label="新建工作流"
        @action="$emit('create')"
      />

      <div v-else class="workflow-list__items">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="workflow-list__item"
          :class="{ 'is-active': item.id === selectedId }"
          @click="$emit('select', item.id)"
        >
          <div class="workflow-list__item-head">
            <strong>{{ item.name }}</strong>
            <n-tag size="small" round :type="item.id === selectedId ? 'success' : 'default'">
              {{ item.category || '未分类' }}
            </n-tag>
          </div>

          <p class="workflow-list__description">
            {{ item.description || '暂无描述' }}
          </p>

          <div class="workflow-list__meta">
            <span>{{ item.tags || '无标签' }}</span>
            <span>{{ formatWorkflowTime(item.updatedAt) }}</span>
          </div>
        </button>
      </div>
    </n-spin>
  </section>
</template>

<style scoped>
.workflow-list {
  display: grid;
  gap: 16px;
}

.workflow-list__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.workflow-list__eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.workflow-list__header h2 {
  margin: 6px 0 0;
  font-size: 22px;
}

.workflow-list__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.workflow-list__items {
  display: grid;
  gap: 12px;
}

.workflow-list__item {
  display: grid;
  gap: 10px;
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(120, 92, 56, 0.14);
  border-radius: 18px;
  background: rgba(255, 252, 247, 0.85);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    transform 160ms ease,
    background-color 160ms ease;
}

.workflow-list__item:hover {
  transform: translateY(-1px);
  border-color: rgba(18, 113, 93, 0.28);
  background: rgba(255, 252, 247, 0.96);
}

.workflow-list__item.is-active {
  border-color: rgba(18, 113, 93, 0.42);
  background: linear-gradient(135deg, rgba(18, 113, 93, 0.1), rgba(255, 252, 247, 0.98));
}

.workflow-list__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.workflow-list__item-head strong {
  font-size: 16px;
}

.workflow-list__description,
.workflow-list__meta {
  margin: 0;
  color: #6f6255;
}

.workflow-list__description {
  line-height: 1.6;
}

.workflow-list__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
}
</style>
