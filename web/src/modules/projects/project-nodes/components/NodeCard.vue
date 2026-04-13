<script setup lang="ts">
import { formatProjectNodeTime, type ProjectNodeDraft } from '../store.js';
import type { ProjectNodeSummary } from '../../../../../../shared/project-nodes/index.js';

withDefaults(
  defineProps<{
    node: ProjectNodeSummary;
    selected?: boolean;
    compact?: boolean;
  }>(),
  {
    selected: false,
    compact: false,
  },
);
</script>

<template>
  <article class="node-card" :class="{ 'is-selected': selected, 'is-compact': compact }">
    <div class="node-card__head">
      <strong>{{ node.name }}</strong>
      <n-tag size="small" round :type="node.status === 'fix' ? 'error' : node.status === 'todo' ? 'warning' : 'default'">
        {{ node.status }}
      </n-tag>
    </div>
    <p>{{ node.description || '暂无描述' }}</p>
    <div class="node-card__meta">
      <span>排序 {{ node.sortOrder }}</span>
      <span>{{ formatProjectNodeTime(node.updatedAt) }}</span>
    </div>
  </article>
</template>

<style scoped>
.node-card {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid rgba(120, 92, 56, 0.14);
  border-radius: 18px;
  background: rgba(255, 252, 247, 0.86);
}

.node-card.is-selected {
  border-color: rgba(18, 113, 93, 0.42);
  background: linear-gradient(135deg, rgba(18, 113, 93, 0.1), rgba(255, 252, 247, 0.98));
}

.node-card.is-compact {
  padding: 12px;
}

.node-card__head,
.node-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.node-card p,
.node-card__meta {
  margin: 0;
  color: #6f6255;
}

.node-card p {
  line-height: 1.6;
}

.node-card__meta {
  font-size: 12px;
}
</style>
