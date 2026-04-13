<script setup lang="ts">
import { EmptyState, SectionCard } from '../../../shared/components/index.js';
import type { SolutionProjectItem } from '../../../../../shared/projects/index.js';

withDefaults(
  defineProps<{
    solutionName: string | null;
    items: SolutionProjectItem[];
    loading?: boolean;
    error?: string | null;
    disabled?: boolean;
  }>(),
  {
    loading: false,
    error: null,
    disabled: false,
  },
);

defineEmits<{
  refresh: [];
  bind: [];
  manage: [binding: SolutionProjectItem];
}>();
</script>

<template>
  <SectionCard
    title="方案项目归属"
    :description="solutionName ? `这里维护 ${solutionName} 下的项目列表与展示顺序。` : '先选中一个已存在的方案，再维护它和项目之间的归属关系。'"
  >
    <template #actions>
      <n-button size="small" :disabled="disabled" @click="$emit('refresh')">刷新</n-button>
      <n-button size="small" type="primary" :disabled="disabled" @click="$emit('bind')">绑定项目</n-button>
    </template>

    <div class="solution-projects-panel">
      <n-alert v-if="error" type="error" :bordered="false">
        {{ error }}
      </n-alert>

      <n-spin :show="loading">
        <EmptyState
          v-if="disabled"
          title="当前处于新建模式"
          description="先创建这个方案，再为它绑定项目。"
        />

        <EmptyState
          v-else-if="items.length === 0"
          title="当前方案还没有绑定项目"
          description="可以把一个项目绑定到当前方案，并设置它在该方案中的展示顺序。"
          action-label="绑定项目"
          @action="$emit('bind')"
        />

        <div v-else class="solution-projects-panel__items">
          <article v-for="item in items" :key="item.projectId" class="solution-projects-panel__item">
            <div>
              <strong>{{ item.projectName }}</strong>
              <p>Project ID：{{ item.projectId }}</p>
            </div>

            <div class="solution-projects-panel__meta">
              <span>排序 {{ item.sortOrder }}</span>
              <n-button size="small" @click="$emit('manage', item)">管理绑定</n-button>
            </div>
          </article>
        </div>
      </n-spin>
    </div>
  </SectionCard>
</template>

<style scoped>
.solution-projects-panel {
  display: grid;
  gap: 14px;
}

.solution-projects-panel__items {
  display: grid;
  gap: 12px;
}

.solution-projects-panel__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(120, 92, 56, 0.14);
  background: rgba(255, 252, 247, 0.86);
}

.solution-projects-panel__item strong {
  display: block;
  color: #3f3429;
}

.solution-projects-panel__item p {
  margin: 6px 0 0;
  color: #6f6255;
  font-size: 12px;
  word-break: break-all;
}

.solution-projects-panel__meta {
  display: grid;
  justify-items: end;
  gap: 8px;
  color: #6f6255;
  font-size: 12px;
}

@media (max-width: 720px) {
  .solution-projects-panel__item {
    display: grid;
  }

  .solution-projects-panel__meta {
    justify-items: start;
  }
}
</style>
