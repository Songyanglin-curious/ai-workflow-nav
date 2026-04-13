<script setup lang="ts">
import { computed } from 'vue';
import { NTag } from 'naive-ui';

import { EmptyState, SectionCard } from '../../../../shared/components/index.js';
import type { StartupCheckItem, StartupReport } from '../../../../../../shared/startup/index.js';

const props = defineProps<{
  report: StartupReport | null;
}>();

const configChecks = computed(() => {
  if (!props.report) {
    return [];
  }

  return props.report.checks.filter((item) => item.checkType === 'CONFIG_READABLE' || item.checkType === 'CONFIG_VALID');
});

function getCheckTypeLabel(type: StartupCheckItem['checkType']): string {
  return type === 'CONFIG_READABLE' ? '配置文件可读' : '配置结构合法';
}

function getStatusLabel(status: StartupCheckItem['status']): string {
  if (status === 'passed') {
    return '通过';
  }

  if (status === 'fixed') {
    return '已修复';
  }

  return '失败';
}

function getStatusType(status: StartupCheckItem['status']): 'success' | 'warning' | 'error' {
  if (status === 'passed') {
    return 'success';
  }

  if (status === 'fixed') {
    return 'warning';
  }

  return 'error';
}
</script>

<template>
  <SectionCard title="工具配置摘要" description="当前只展示已有系统级接口能稳定提供的配置摘要，不展开完整工具编辑能力。">
    <EmptyState
      v-if="!report"
      title="还没有可复用的配置摘要"
      description="当前版本没有独立 settings 接口；需要先读取最近启动报告，才能展示配置源相关摘要。"
    />

    <div v-else class="tool-config-summary">
      <div class="tool-config-summary__grid">
        <article>
          <span>工具明细接口</span>
          <strong>当前未开放</strong>
          <p>设置页保持只读，不自行发明读取全部工具配置的新接口。</p>
        </article>
        <article>
          <span>配置写回能力</span>
          <strong>当前未提供</strong>
          <p>本页不承担本地配置编辑器职责，也不预设保存流程。</p>
        </article>
      </div>

      <div class="tool-config-summary__checks">
        <article
          v-for="item in configChecks"
          :key="`${item.checkType}:${item.message}`"
          class="tool-config-summary__check"
        >
          <div class="tool-config-summary__check-header">
            <strong>{{ getCheckTypeLabel(item.checkType) }}</strong>
            <n-tag size="small" round :type="getStatusType(item.status)">
              {{ getStatusLabel(item.status) }}
            </n-tag>
          </div>
          <p>{{ item.message }}</p>
        </article>
      </div>
    </div>
  </SectionCard>
</template>

<style scoped>
.tool-config-summary {
  display: grid;
  gap: 16px;
}

.tool-config-summary__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.tool-config-summary__grid article,
.tool-config-summary__check {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.88);
}

.tool-config-summary__grid span {
  color: #64748b;
  font-size: 0.84rem;
}

.tool-config-summary__grid strong,
.tool-config-summary__check strong {
  color: #0f172a;
}

.tool-config-summary__grid p,
.tool-config-summary__check p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.tool-config-summary__checks {
  display: grid;
  gap: 12px;
}

.tool-config-summary__check-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .tool-config-summary__grid {
    grid-template-columns: 1fr;
  }
}
</style>
