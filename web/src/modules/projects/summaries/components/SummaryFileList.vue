<script setup lang="ts">
import { EmptyState } from '../../../../shared/components/index.js';
import type { SummaryFileItem } from '../../../../../../shared/summaries/index.js';

withDefaults(
  defineProps<{
    items: SummaryFileItem[];
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);
</script>

<template>
  <n-spin :show="loading">
    <EmptyState
      v-if="items.length === 0"
      title="当前还没有总结文件"
      description="总结目录目前为空；当前阶段只负责读取目录状态和文件列表，不在这里提供自动写入。"
    />

    <ul v-else class="summary-file-list">
      <li v-for="item in items" :key="item.fileName" class="summary-file-list__item">
        <strong>{{ item.fileName }}</strong>
        <p>总结文件名不强制要求时间戳格式，当前按文件名升序展示。</p>
      </li>
    </ul>
  </n-spin>
</template>

<style scoped>
.summary-file-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.summary-file-list__item {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(120, 92, 56, 0.14);
  background: rgba(255, 252, 247, 0.86);
}

.summary-file-list__item strong {
  color: #3f3429;
  word-break: break-all;
}

.summary-file-list__item p {
  margin: 0;
  color: #6f6255;
  line-height: 1.6;
}
</style>
