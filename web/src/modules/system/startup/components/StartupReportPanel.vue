<script setup lang="ts">
import { computed } from 'vue';
import { NAlert, NTag } from 'naive-ui';

import { EmptyState, SectionCard } from '../../../../shared/components/index.js';
import type {
  SelfCheckResult,
  StartupCheckItem,
  StartupCheckStatus,
  StartupCheckType,
  StartupReport,
} from '../../../../../../shared/startup/index.js';

const props = defineProps<{
  report: StartupReport | null;
  selfCheckResult?: SelfCheckResult | null;
  loading?: boolean;
}>();

const displayChecks = computed(() => props.report?.checks ?? []);

function getCheckTypeLabel(type: StartupCheckType): string {
  const labels: Record<StartupCheckType, string> = {
    CONFIG_READABLE: '配置文件可读',
    CONFIG_VALID: '配置结构合法',
    WORKSPACE_ROOT_VALID: '工作区根路径合法',
    FIXED_DIRECTORIES_READY: '固定目录已就绪',
    RUNTIME_DB_READY: '运行时数据库可用',
    SCHEMA_EXECUTED: 'Schema 已执行',
  };

  return labels[type];
}

function getStatusLabel(status: StartupCheckStatus): string {
  if (status === 'passed') {
    return '通过';
  }

  if (status === 'fixed') {
    return '已修复';
  }

  return '失败';
}

function getStatusType(status: StartupCheckStatus): 'success' | 'warning' | 'error' {
  if (status === 'passed') {
    return 'success';
  }

  if (status === 'fixed') {
    return 'warning';
  }

  return 'error';
}

function getStartupStatusLabel(status: StartupReport['startupStatus'] | SelfCheckResult['status']): string {
  return status === 'ready' ? '已满足启动条件' : '未满足启动条件';
}

function getStartupStatusType(status: StartupReport['startupStatus'] | SelfCheckResult['status']): 'success' | 'error' {
  return status === 'ready' ? 'success' : 'error';
}

function countChecksByStatus(items: StartupCheckItem[], status: StartupCheckStatus): number {
  return items.filter((item) => item.status === status).length;
}
</script>

<template>
  <SectionCard title="启动报告" description="展示最近一次启动报告，以及固定检查项的状态与消息。">
    <EmptyState
      v-if="!report"
      title="还没有启动报告"
      description="页面会读取最近一次启动结果；如果读取失败，可以先执行一次手动自检。"
    />

    <div v-else class="startup-report">
      <div class="startup-report__meta">
        <n-tag size="small" round :type="getStartupStatusType(report.startupStatus)">
          {{ getStartupStatusLabel(report.startupStatus) }}
        </n-tag>
        <span>检查项数量：{{ report.checks.length }}</span>
      </div>

      <div class="startup-report__stats">
        <article>
          <span>通过</span>
          <strong>{{ countChecksByStatus(displayChecks, 'passed') }}</strong>
        </article>
        <article>
          <span>已修复</span>
          <strong>{{ countChecksByStatus(displayChecks, 'fixed') }}</strong>
        </article>
        <article>
          <span>失败</span>
          <strong>{{ countChecksByStatus(displayChecks, 'failed') }}</strong>
        </article>
      </div>

      <n-alert
        v-if="selfCheckResult"
        :type="getStartupStatusType(selfCheckResult.status)"
        :bordered="false"
      >
        最近一次手动自检：{{ getStartupStatusLabel(selfCheckResult.status) }}
      </n-alert>

      <n-spin :show="loading">
        <div class="startup-report__checks">
          <article
            v-for="item in displayChecks"
            :key="`${item.checkType}:${item.message}`"
            class="startup-report__check"
          >
            <div class="startup-report__check-header">
              <strong>{{ getCheckTypeLabel(item.checkType) }}</strong>
              <n-tag size="small" round :type="getStatusType(item.status)">
                {{ getStatusLabel(item.status) }}
              </n-tag>
            </div>
            <p>{{ item.message }}</p>
          </article>
        </div>
      </n-spin>
    </div>
  </SectionCard>
</template>

<style scoped>
.startup-report {
  display: grid;
  gap: 16px;
}

.startup-report__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.startup-report__meta span,
.startup-report__stats span {
  color: #64748b;
  font-size: 0.84rem;
}

.startup-report__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.startup-report__stats article {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.82);
}

.startup-report__stats strong {
  color: #0f172a;
  font-size: 1.5rem;
}

.startup-report__checks {
  display: grid;
  gap: 12px;
}

.startup-report__check {
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.88);
}

.startup-report__check-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.startup-report__check strong {
  color: #0f172a;
}

.startup-report__check p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

@media (max-width: 720px) {
  .startup-report__stats {
    grid-template-columns: 1fr;
  }
}
</style>
