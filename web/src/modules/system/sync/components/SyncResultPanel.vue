<script setup lang="ts">
import { NAlert, NTag } from 'naive-ui';

import { EmptyState, SectionCard } from '../../../../shared/components/index.js';
import {
  formatSyncExecutionTime,
  getSyncOperationLabel,
  type SyncExecutionRecord,
} from '../composables.js';

defineProps<{
  record: SyncExecutionRecord | null;
}>();
</script>

<template>
  <SectionCard title="同步结果" description="这里只展示最近一次显式执行的结果，不保留独立历史列表。">
    <EmptyState
      v-if="!record"
      title="还没有同步结果"
      description="手动触发导出或导入后，这里会展示最近一次操作的结果摘要和注意事项。"
    />

    <div v-else class="sync-result">
      <div class="sync-result__meta">
        <n-tag size="small" round :type="record.kind === 'export' ? 'success' : 'warning'">
          最近一次{{ getSyncOperationLabel(record.kind) }}
        </n-tag>
        <span>执行时间：{{ formatSyncExecutionTime(record.completedAt) }}</span>
      </div>

      <div v-if="record.kind === 'export'" class="sync-result__stats">
        <article>
          <span>导出状态</span>
          <strong>{{ record.result.exported ? '已完成' : '未完成' }}</strong>
        </article>
        <article>
          <span>产物数量</span>
          <strong>{{ record.result.exportedFileCount }}</strong>
        </article>
        <article>
          <span>manifest</span>
          <strong>{{ record.result.manifestFile }}</strong>
        </article>
      </div>

      <div v-else class="sync-result__stats">
        <article>
          <span>导入状态</span>
          <strong>{{ record.result.imported ? '已完成' : '未完成' }}</strong>
        </article>
        <article>
          <span>导入模式</span>
          <strong>{{ record.result.mode }}</strong>
        </article>
        <article>
          <span>输入来源</span>
          <strong>dbSyncs/</strong>
        </article>
      </div>

      <n-alert v-if="record.kind === 'export'" type="success" :bordered="false">
        导出会覆盖 `dbSyncs/` 目录中的同步文件，并重新生成 `manifest.json`。
      </n-alert>
      <n-alert v-else type="warning" :bordered="false">
        rebuild 导入会按契约清空后重建结构化数据；导入完成后需要手动刷新页面。
      </n-alert>
    </div>
  </SectionCard>
</template>

<style scoped>
.sync-result {
  display: grid;
  gap: 16px;
}

.sync-result__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.sync-result__meta span,
.sync-result__stats span {
  color: #64748b;
  font-size: 0.84rem;
}

.sync-result__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.sync-result__stats article {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.82);
}

.sync-result__stats strong {
  color: #0f172a;
  word-break: break-word;
}

@media (max-width: 720px) {
  .sync-result__stats {
    grid-template-columns: 1fr;
  }
}
</style>
