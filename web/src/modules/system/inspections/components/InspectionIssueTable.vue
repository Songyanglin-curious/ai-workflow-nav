<script setup lang="ts">
import { NTag } from 'naive-ui';

import { EmptyState, SectionCard } from '../../../../shared/components/index.js';
import type { InspectionIssue } from '../../../../../../shared/inspections/index.js';

defineProps<{
  items: InspectionIssue[];
  hasResult: boolean;
}>();

function getSeverityLabel(severity: InspectionIssue['severity']): string {
  return severity === 'error' ? '错误' : '警告';
}

function getIssueTypeLabel(issueType: InspectionIssue['issueType']): string {
  const labels: Record<InspectionIssue['issueType'], string> = {
    INDEXED_FILE_MISSING: '索引存在但文件缺失',
    UNINDEXED_FILE_FOUND: '文件存在但索引缺失',
    WORKFLOW_NODE_ACTION_STALE: '工作流节点动作已失效',
    BINDING_TARGET_NOT_FOUND: '绑定目标不存在',
    TOOL_TARGET_NOT_FOUND: '工具目标不存在',
    WORKFLOW_NODE_ACTION_MISSING: '工作流节点动作缺失',
    PROJECT_NODE_WORKFLOW_MISSING: '项目节点未绑定工作流',
  };

  return labels[issueType];
}
</script>

<template>
  <SectionCard title="问题列表" description="按巡检返回的结构化结果展示问题对象、消息和修复建议。">
    <EmptyState
      v-if="!hasResult"
      title="还没有可展示的结果"
      description="执行巡检后，这里会列出当前范围内发现的每一条问题。"
    />

    <EmptyState
      v-else-if="items.length === 0"
      title="本次巡检没有问题项"
      description="当前结果为空列表，说明本次扫描范围内未发现需要处理的异常。"
    />

    <div v-else class="inspection-table">
      <div class="inspection-table__header inspection-table__row">
        <span>严重级别</span>
        <span>问题类型</span>
        <span>关联对象</span>
        <span>问题说明</span>
        <span>修复建议</span>
      </div>

      <article
        v-for="item in items"
        :key="`${item.issueType}:${item.entityType}:${item.entityId ?? 'none'}:${item.message}`"
        class="inspection-table__row inspection-table__item"
      >
        <div class="inspection-table__cell">
          <n-tag size="small" round :type="item.severity === 'error' ? 'error' : 'warning'">
            {{ getSeverityLabel(item.severity) }}
          </n-tag>
        </div>
        <div class="inspection-table__cell">
          <strong>{{ getIssueTypeLabel(item.issueType) }}</strong>
        </div>
        <div class="inspection-table__cell inspection-table__entity">
          <code>{{ item.entityType }}</code>
          <code v-if="item.entityId">{{ item.entityId }}</code>
          <span v-else>无明确 ID</span>
        </div>
        <div class="inspection-table__cell">
          {{ item.message }}
        </div>
        <div class="inspection-table__cell">
          {{ item.suggestion }}
        </div>
      </article>
    </div>
  </SectionCard>
</template>

<style scoped>
.inspection-table {
  display: grid;
  gap: 12px;
}

.inspection-table__row {
  display: grid;
  grid-template-columns: 128px 188px 220px minmax(220px, 1.4fr) minmax(220px, 1.2fr);
  gap: 12px;
  align-items: start;
}

.inspection-table__header {
  padding: 0 16px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
}

.inspection-table__item {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.88);
}

.inspection-table__cell {
  min-width: 0;
  color: #334155;
  line-height: 1.65;
  word-break: break-word;
}

.inspection-table__cell strong {
  color: #0f172a;
}

.inspection-table__entity {
  display: grid;
  gap: 6px;
}

.inspection-table__entity code {
  width: fit-content;
  max-width: 100%;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: #0f172a;
}

.inspection-table__entity span {
  color: #64748b;
}

@media (max-width: 1080px) {
  .inspection-table__row {
    grid-template-columns: 1fr;
  }

  .inspection-table__header {
    display: none;
  }
}
</style>
