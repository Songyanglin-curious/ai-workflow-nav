<script setup lang="ts">
import { computed } from 'vue';
import { NAlert, NTag } from 'naive-ui';

import { EmptyState, SectionCard } from '../../../../shared/components/index.js';
import ToolConfigSummary from './ToolConfigSummary.vue';
import type { StartupCheckItem, StartupReport } from '../../../../../../shared/startup/index.js';

const props = defineProps<{
  report: StartupReport | null;
  loading?: boolean;
  error?: string | null;
}>();

const runtimeChecks = computed(() => {
  if (!props.report) {
    return [];
  }

  return props.report.checks.filter((item) => item.checkType !== 'CONFIG_READABLE' && item.checkType !== 'CONFIG_VALID');
});

function getStartupStatusLabel(status: StartupReport['startupStatus']): string {
  return status === 'ready' ? '已满足启动条件' : '未满足启动条件';
}

function getStartupStatusType(status: StartupReport['startupStatus']): 'success' | 'error' {
  return status === 'ready' ? 'success' : 'error';
}

function getCheckTypeLabel(type: StartupCheckItem['checkType']): string {
  const labels: Record<StartupCheckItem['checkType'], string> = {
    CONFIG_READABLE: '配置文件可读',
    CONFIG_VALID: '配置结构合法',
    WORKSPACE_ROOT_VALID: '工作区根路径合法',
    FIXED_DIRECTORIES_READY: '固定目录已就绪',
    RUNTIME_DB_READY: '运行时数据库可用',
    SCHEMA_EXECUTED: 'Schema 已执行',
  };

  return labels[type];
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
  <div class="settings-panel">
    <SectionCard title="设置摘要" description="当前先按展示页理解，不展开完整配置编辑和写回流程。">
      <EmptyState
        v-if="!report && !error"
        title="还没有运行环境摘要"
        description="设置页会复用现有系统级接口返回的启动报告摘要，不额外创建 settings 读取接口。"
      />

      <div v-else class="settings-panel__content">
        <n-alert v-if="error" type="error" :bordered="false">
          {{ error }}
        </n-alert>

        <template v-if="report">
          <div class="settings-panel__meta">
            <n-tag size="small" round :type="getStartupStatusType(report.startupStatus)">
              {{ getStartupStatusLabel(report.startupStatus) }}
            </n-tag>
            <span>复用来源：`GET /api/system/startup-report`</span>
          </div>

          <n-spin :show="loading">
            <div class="settings-panel__checks">
              <article
                v-for="item in runtimeChecks"
                :key="`${item.checkType}:${item.message}`"
                class="settings-panel__check"
              >
                <div class="settings-panel__check-header">
                  <strong>{{ getCheckTypeLabel(item.checkType) }}</strong>
                  <n-tag size="small" round :type="getStatusType(item.status)">
                    {{ getStatusLabel(item.status) }}
                  </n-tag>
                </div>
                <p>{{ item.message }}</p>
              </article>
            </div>
          </n-spin>
        </template>
      </div>
    </SectionCard>

    <ToolConfigSummary :report="report" />
  </div>
</template>

<style scoped>
.settings-panel {
  display: grid;
  gap: 20px;
}

.settings-panel__content {
  display: grid;
  gap: 16px;
}

.settings-panel__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.settings-panel__meta span {
  color: #64748b;
  font-size: 0.84rem;
}

.settings-panel__checks {
  display: grid;
  gap: 12px;
}

.settings-panel__check {
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.88);
}

.settings-panel__check-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.settings-panel__check strong {
  color: #0f172a;
}

.settings-panel__check p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}
</style>
