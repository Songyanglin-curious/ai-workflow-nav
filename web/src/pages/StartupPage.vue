<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NAlert } from 'naive-ui';

import { getStartupReport, runSelfCheck } from '../modules/system/startup/api.js';
import SelfCheckButton from '../modules/system/startup/components/SelfCheckButton.vue';
import StartupReportPanel from '../modules/system/startup/components/StartupReportPanel.vue';
import { PageShell } from '../shared/components/index.js';
import type { SelfCheckResult, StartupReport } from '../../../shared/startup/index.js';

const report = ref<StartupReport | null>(null);
const selfCheckResult = ref<SelfCheckResult | null>(null);
const reportLoading = ref(false);
const selfCheckLoading = ref(false);
const reportError = ref<string | null>(null);
const selfCheckError = ref<string | null>(null);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '启动检查请求失败';
}

async function refreshReport(): Promise<void> {
  reportLoading.value = true;
  reportError.value = null;

  try {
    report.value = await getStartupReport();
  } catch (error) {
    reportError.value = getErrorMessage(error);
  } finally {
    reportLoading.value = false;
  }
}

async function handleSelfCheck(): Promise<void> {
  selfCheckLoading.value = true;
  selfCheckError.value = null;

  try {
    selfCheckResult.value = await runSelfCheck();
    await refreshReport();
  } catch (error) {
    selfCheckError.value = getErrorMessage(error);
  } finally {
    selfCheckLoading.value = false;
  }
}

onMounted(() => {
  void refreshReport();
});
</script>

<template>
  <PageShell title="启动报告与自检" description="这里用于读取最近一次启动报告，并手动触发底座自检。它不等同于业务巡检。">
    <template #actions>
      <SelfCheckButton :loading="selfCheckLoading" @trigger="handleSelfCheck" />
    </template>

    <section class="startup-page">
      <header class="startup-page__hero">
        <div>
          <p class="startup-page__eyebrow">Startup</p>
          <h2>底座状态集中查看</h2>
          <p>
            当前页面只关注配置、工作区、固定目录、运行时数据库和 schema 执行状态，不承接业务层问题扫描。
          </p>
        </div>

        <div class="startup-page__hero-meta">
          <span>最近整体状态</span>
          <strong>{{ report?.startupStatus ?? '--' }}</strong>
          <small>{{ report ? '来自最新报告' : '等待读取' }}</small>
        </div>
      </header>

      <n-alert v-if="reportError" type="error" :bordered="false">
        {{ reportError }}
      </n-alert>

      <n-alert v-if="selfCheckError" type="error" :bordered="false">
        {{ selfCheckError }}
      </n-alert>

      <StartupReportPanel
        :report="report"
        :self-check-result="selfCheckResult"
        :loading="reportLoading || selfCheckLoading"
      />
    </section>
  </PageShell>
</template>

<style scoped>
.startup-page {
  display: grid;
  gap: 20px;
}

.startup-page__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(18, 113, 93, 0.16), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.startup-page__eyebrow {
  margin: 0 0 6px;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.startup-page__hero h2 {
  margin: 0;
  font-size: 1.7rem;
}

.startup-page__hero p {
  max-width: 760px;
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.7;
}

.startup-page__hero-meta {
  display: grid;
  gap: 4px;
  min-width: 148px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.08);
  text-align: right;
}

.startup-page__hero-meta span,
.startup-page__hero-meta small {
  color: #64748b;
}

.startup-page__hero-meta strong {
  color: #0f172a;
  font-size: 1.8rem;
}

@media (max-width: 820px) {
  .startup-page__hero {
    display: grid;
  }

  .startup-page__hero-meta {
    text-align: left;
  }
}
</style>
