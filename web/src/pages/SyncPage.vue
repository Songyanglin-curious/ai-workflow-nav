<script setup lang="ts">
import { NAlert } from 'naive-ui';

import ExportButton from '../modules/system/sync/components/ExportButton.vue';
import ImportButton from '../modules/system/sync/components/ImportButton.vue';
import SyncResultPanel from '../modules/system/sync/components/SyncResultPanel.vue';
import { useSystemSync } from '../modules/system/sync/composables.js';
import { PageShell } from '../shared/components/index.js';

const {
  lastRecord,
  exportLoading,
  importLoading,
  exportError,
  importError,
  executeExport,
  executeImport,
} = useSystemSync();
</script>

<template>
  <PageShell title="导入导出同步" description="这里用于手动触发 SQLite 与 `dbSyncs/` 之间的同步，不自动上传文件，也不自动回滚。">
    <section class="sync-page">
      <header class="sync-page__hero">
        <div>
          <p class="sync-page__eyebrow">Sync</p>
          <h2>结构化数据手动同步</h2>
          <p>
            当前版本只处理结构化数据和可同步视图配置。正文文件、运行时缓存和自动冲突解决都不在这个页面里处理。
          </p>
        </div>

        <div class="sync-page__hero-meta">
          <span>最近操作</span>
          <strong>{{ lastRecord ? (lastRecord.kind === 'export' ? '导出' : '导入') : '--' }}</strong>
          <small>{{ lastRecord ? '已执行' : '等待执行' }}</small>
        </div>
      </header>

      <div class="sync-page__grid">
        <section class="sync-action-card">
          <div class="sync-action-card__header">
            <div>
              <h3>导出到 `dbSyncs/`</h3>
              <p>手动覆盖导出所有已确认的结构化数据和可同步视图配置，同时生成或更新 `manifest.json`。</p>
            </div>
            <ExportButton :loading="exportLoading" @trigger="executeExport" />
          </div>

          <n-alert v-if="exportError" type="error" :bordered="false">
            {{ exportError }}
          </n-alert>
        </section>

        <section class="sync-action-card sync-action-card--warning">
          <div class="sync-action-card__header">
            <div>
              <h3>从 `dbSyncs/` 执行 rebuild 导入</h3>
              <p>按契约要求检查 `manifest.json` 和必需 CSV 文件，再以“清空后重建”的方式导入。</p>
            </div>
            <ImportButton :loading="importLoading" @trigger="executeImport" />
          </div>

          <n-alert v-if="importError" type="error" :bordered="false">
            {{ importError }}
          </n-alert>
        </section>
      </div>

      <SyncResultPanel :record="lastRecord" />
    </section>
  </PageShell>
</template>

<style scoped>
.sync-page {
  display: grid;
  gap: 20px;
}

.sync-page__hero {
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

.sync-page__eyebrow {
  margin: 0 0 6px;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.sync-page__hero h2 {
  margin: 0;
  font-size: 1.7rem;
}

.sync-page__hero p {
  max-width: 760px;
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.7;
}

.sync-page__hero-meta {
  display: grid;
  gap: 4px;
  min-width: 148px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.08);
  text-align: right;
}

.sync-page__hero-meta span,
.sync-page__hero-meta small {
  color: #64748b;
}

.sync-page__hero-meta strong {
  color: #0f172a;
  font-size: 1.8rem;
}

.sync-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.sync-action-card {
  display: grid;
  gap: 14px;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.sync-action-card--warning {
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.12), transparent 30%),
    rgba(255, 255, 255, 0.92);
}

.sync-action-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.sync-action-card h3 {
  margin: 0;
  font-size: 1.08rem;
}

.sync-action-card p {
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .sync-page__grid,
  .sync-page__hero {
    grid-template-columns: 1fr;
  }

  .sync-page__hero {
    display: grid;
  }

  .sync-page__hero-meta {
    text-align: left;
  }

  .sync-action-card__header {
    display: grid;
  }
}
</style>
