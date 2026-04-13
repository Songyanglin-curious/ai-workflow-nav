<script setup lang="ts">
import { EmptyState } from '../../../../shared/components/index.js';
import type { DeliberationsRecordFileItem } from '../../../../../../shared/deliberations/index.js';

withDefaults(
  defineProps<{
    items: DeliberationsRecordFileItem[];
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);
</script>

<template>
  <n-spin :show="loading">
    <EmptyState
      v-if="items.length === 0"
      title="当前还没有推敲记录文件"
      description="可以直接把剪贴板内容追加到最新文件，或先手动创建一个新的推敲记录文件。"
    />

    <ul v-else class="deliberations-file-list">
      <li
        v-for="item in items"
        :key="item.fileName"
        class="deliberations-file-list__item"
        :class="{ 'is-latest': item.isLatestWritable, 'is-noncompliant': !item.isNameCompliant }"
      >
        <div class="deliberations-file-list__head">
          <strong>{{ item.fileName }}</strong>
          <div class="deliberations-file-list__tags">
            <n-tag v-if="item.isLatestWritable" size="small" type="success" round>
              最新可写
            </n-tag>
            <n-tag v-if="!item.isNameCompliant" size="small" type="warning" round>
              命名不合规
            </n-tag>
          </div>
        </div>

        <p>
          {{ item.isNameCompliant ? '该文件参与“最新可写文件”判定。' : '该文件不会作为默认追加目标。' }}
        </p>
      </li>
    </ul>
  </n-spin>
</template>

<style scoped>
.deliberations-file-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.deliberations-file-list__item {
  display: grid;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(120, 92, 56, 0.14);
  background: rgba(255, 252, 247, 0.86);
}

.deliberations-file-list__item.is-latest {
  border-color: rgba(18, 113, 93, 0.28);
  background: linear-gradient(135deg, rgba(18, 113, 93, 0.08), rgba(255, 252, 247, 0.96));
}

.deliberations-file-list__item.is-noncompliant {
  border-color: rgba(217, 119, 6, 0.22);
}

.deliberations-file-list__head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.deliberations-file-list__head strong {
  word-break: break-all;
}

.deliberations-file-list__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  gap: 8px;
}

.deliberations-file-list__item p {
  margin: 0;
  color: #6f6255;
  line-height: 1.6;
}

@media (max-width: 720px) {
  .deliberations-file-list__head {
    display: grid;
  }

  .deliberations-file-list__tags {
    justify-content: start;
  }
}
</style>
