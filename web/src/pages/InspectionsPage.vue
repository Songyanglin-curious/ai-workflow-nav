<script setup lang="ts">
import { NAlert } from 'naive-ui';

import InspectionIssueTable from '../modules/system/inspections/components/InspectionIssueTable.vue';
import InspectionRunButton from '../modules/system/inspections/components/InspectionRunButton.vue';
import InspectionSummary from '../modules/system/inspections/components/InspectionSummary.vue';
import { useInspections } from '../modules/system/inspections/composables.js';
import { PageShell } from '../shared/components/index.js';

const {
  result,
  items,
  hasResult,
  loading,
  error,
  lastRunAt,
  execute,
} = useInspections();
</script>

<template>
  <PageShell title="系统巡检" description="这里用于显式执行一致性巡检，并查看当前工作区的数据、文件与绑定关系问题。">
    <template #actions>
      <InspectionRunButton :loading="loading" :has-result="hasResult" @run="execute" />
    </template>

    <section class="inspections-page">
      <header class="inspections-page__hero">
        <div>
          <p class="inspections-page__eyebrow">Inspections</p>
          <h2>一致性问题集中查看</h2>
          <p>
            当前版本不提供巡检历史，也不会在页面层自动修复异常。每次点击按钮都会重新扫描并返回本次结果。
          </p>
        </div>

        <div class="inspections-page__hero-meta">
          <span>最近结果</span>
          <strong>{{ result?.summary.total ?? '--' }}</strong>
          <small>{{ hasResult ? '条问题' : '等待执行' }}</small>
        </div>
      </header>

      <n-alert v-if="error" type="error" :bordered="false">
        {{ error }}
      </n-alert>

      <InspectionSummary :result="result" :last-run-at="lastRunAt" />
      <InspectionIssueTable :items="items" :has-result="hasResult" />
    </section>
  </PageShell>
</template>

<style scoped>
.inspections-page {
  display: grid;
  gap: 20px;
}

.inspections-page__hero {
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

.inspections-page__eyebrow {
  margin: 0 0 6px;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.inspections-page__hero h2 {
  margin: 0;
  font-size: 1.7rem;
}

.inspections-page__hero p {
  max-width: 760px;
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.7;
}

.inspections-page__hero-meta {
  display: grid;
  gap: 4px;
  min-width: 148px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.08);
  text-align: right;
}

.inspections-page__hero-meta span,
.inspections-page__hero-meta small {
  color: #64748b;
}

.inspections-page__hero-meta strong {
  color: #0f172a;
  font-size: 1.8rem;
}

@media (max-width: 820px) {
  .inspections-page__hero {
    display: grid;
  }

  .inspections-page__hero-meta {
    text-align: left;
  }
}
</style>
