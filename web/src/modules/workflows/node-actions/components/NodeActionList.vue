<script setup lang="ts">
import { EmptyState } from '../../../../shared/components/index.js';
import { formatNodeActionTime, type WorkflowNodeActionItem } from '../types.js';

withDefaults(
  defineProps<{
    items: WorkflowNodeActionItem[];
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

defineEmits<{
  create: [];
  edit: [nodeAction: WorkflowNodeActionItem];
  delete: [nodeAction: WorkflowNodeActionItem];
}>();
</script>

<template>
  <section class="node-action-list">
    <n-spin :show="loading">
      <EmptyState
        v-if="items.length === 0"
        title="还没有节点动作"
        description="先为某个 Mermaid 节点创建绑定，再在这里统一维护。"
        action-label="新建绑定"
        @action="$emit('create')"
      />

      <div v-else class="node-action-list__items">
        <article v-for="item in items" :key="item.mermaidNodeId" class="node-action-list__item">
          <div class="node-action-list__item-head">
            <div>
              <p class="node-action-list__node">{{ item.mermaidNodeId }}</p>
              <strong>{{ item.actionType === 'prompt' ? 'Prompt 绑定' : 'Tool 绑定' }}</strong>
            </div>

            <n-tag size="small" round :type="item.actionType === 'prompt' ? 'success' : 'warning'">
              {{ item.actionType }}
            </n-tag>
          </div>

          <dl class="node-action-list__meta">
            <div>
              <dt>目标</dt>
              <dd>{{ item.targetRef }}</dd>
            </div>
            <div>
              <dt>更新时间</dt>
              <dd>{{ formatNodeActionTime(item.updatedAt) }}</dd>
            </div>
          </dl>

          <div class="node-action-list__actions">
            <n-button size="small" @click="$emit('edit', item)">编辑</n-button>
            <n-button size="small" type="error" tertiary @click="$emit('delete', item)">删除</n-button>
          </div>
        </article>
      </div>
    </n-spin>
  </section>
</template>

<style scoped>
.node-action-list {
  display: grid;
}

.node-action-list__items {
  display: grid;
  gap: 12px;
}

.node-action-list__item {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(120, 92, 56, 0.14);
  border-radius: 18px;
  background: rgba(255, 252, 247, 0.85);
}

.node-action-list__item-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.node-action-list__node {
  margin: 0 0 4px;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.node-action-list__item-head strong {
  font-size: 16px;
}

.node-action-list__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.node-action-list__meta div {
  min-width: 0;
}

.node-action-list__meta dt {
  margin-bottom: 4px;
  color: #8b7b6d;
  font-size: 12px;
}

.node-action-list__meta dd {
  margin: 0;
  color: #3f3429;
  word-break: break-all;
}

.node-action-list__actions {
  display: flex;
  justify-content: end;
  gap: 8px;
}

@media (max-width: 720px) {
  .node-action-list__meta {
    grid-template-columns: 1fr;
  }
}
</style>
