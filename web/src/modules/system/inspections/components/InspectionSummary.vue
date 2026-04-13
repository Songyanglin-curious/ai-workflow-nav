<script setup lang="ts">
import { NAlert, NTag } from 'naive-ui';

import { EmptyState, SectionCard } from '../../../../shared/components/index.js';
import { formatInspectionRunTime } from '../composables.js';
import type { InspectionRunResult } from '../../../../../../shared/inspections/index.js';

defineProps<{
  result: InspectionRunResult | null;
  lastRunAt: string | null;
}>();
</script>

<template>
  <SectionCard title="巡检摘要" description="巡检只负责发现一致性问题，不会在这里自动修复数据或文件。">
    <EmptyState
      v-if="!result"
      title="还没有巡检结果"
      description="点击“执行巡检”后，这里会展示本次扫描的总数、严重级别分布和最近执行时间。"
    />

    <div v-else class="inspection-summary">
      <div class="inspection-summary__stats">
        <article>
          <span>问题总数</span>
          <strong>{{ result.summary.total }}</strong>
        </article>
        <article>
          <span>错误级</span>
          <strong>{{ result.summary.errorCount }}</strong>
        </article>
        <article>
          <span>警告级</span>
          <strong>{{ result.summary.warningCount }}</strong>
        </article>
      </div>

      <div class="inspection-summary__meta">
        <n-tag size="small" round :type="result.summary.errorCount > 0 ? 'error' : result.summary.total > 0 ? 'warning' : 'success'">
          {{ result.summary.errorCount > 0 ? '存在错误级问题' : result.summary.total > 0 ? '仅存在警告级问题' : '当前未发现问题' }}
        </n-tag>
        <span v-if="lastRunAt">最近执行：{{ formatInspectionRunTime(lastRunAt) }}</span>
      </div>

      <n-alert v-if="result.summary.total === 0" type="success" :bordered="false">
        当前巡检范围内没有发现异常项。
      </n-alert>
      <n-alert v-else-if="result.summary.errorCount > 0" type="error" :bordered="false">
        本次结果里包含错误级问题，建议优先处理失效绑定和缺失目标。
      </n-alert>
      <n-alert v-else type="warning" :bordered="false">
        本次结果只有警告级问题，建议按提示逐项核对文件和索引的一致性。
      </n-alert>
    </div>
  </SectionCard>
</template>

<style scoped>
.inspection-summary {
  display: grid;
  gap: 16px;
}

.inspection-summary__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.inspection-summary__stats article {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.82);
}

.inspection-summary__stats span,
.inspection-summary__meta span {
  color: #64748b;
  font-size: 0.84rem;
}

.inspection-summary__stats strong {
  color: #0f172a;
  font-size: 1.5rem;
}

.inspection-summary__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .inspection-summary__stats {
    grid-template-columns: 1fr;
  }
}
</style>
