<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { getStartupReport } from '../modules/system/startup/api.js';
import SettingsPanel from '../modules/system/settings/components/SettingsPanel.vue';
import { PageShell } from '../shared/components/index.js';
import type { StartupReport } from '../../../shared/startup/index.js';

const report = ref<StartupReport | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

function getErrorMessage(nextError: unknown): string {
  return nextError instanceof Error ? nextError.message : '设置摘要读取失败';
}

async function loadReport(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    report.value = await getStartupReport();
  } catch (nextError) {
    error.value = getErrorMessage(nextError);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadReport();
});
</script>

<template>
  <PageShell title="设置摘要" description="当前设置页只展示已有系统级接口能稳定提供的配置摘要，不承接完整编辑流程。">
    <section class="settings-page">
      <header class="settings-page__hero">
        <div>
          <p class="settings-page__eyebrow">Settings</p>
          <h2>本地配置与运行环境摘要</h2>
          <p>
            这里先按摘要页理解：复用现有启动报告展示运行环境状态，并对工具配置边界做只读说明，不扩展新的设置接口。
          </p>
        </div>

        <div class="settings-page__hero-meta">
          <span>当前模式</span>
          <strong>只读摘要</strong>
          <small>{{ report ? '已有系统级数据' : '等待读取' }}</small>
        </div>
      </header>

      <SettingsPanel :report="report" :loading="loading" :error="error" />
    </section>
  </PageShell>
</template>

<style scoped>
.settings-page {
  display: grid;
  gap: 20px;
}

.settings-page__hero {
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

.settings-page__eyebrow {
  margin: 0 0 6px;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.settings-page__hero h2 {
  margin: 0;
  font-size: 1.7rem;
}

.settings-page__hero p {
  max-width: 760px;
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.7;
}

.settings-page__hero-meta {
  display: grid;
  gap: 4px;
  min-width: 148px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.08);
  text-align: right;
}

.settings-page__hero-meta span,
.settings-page__hero-meta small {
  color: #64748b;
}

.settings-page__hero-meta strong {
  color: #0f172a;
  font-size: 1.8rem;
}

@media (max-width: 820px) {
  .settings-page__hero {
    display: grid;
  }

  .settings-page__hero-meta {
    text-align: left;
  }
}
</style>
