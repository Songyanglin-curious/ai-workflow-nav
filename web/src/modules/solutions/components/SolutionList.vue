<script setup lang="ts">
import { EmptyState, SectionCard } from '../../../shared/components/index.js';
import { formatSolutionTime } from '../composables.js';
import type { SolutionSummary } from '../../../../../shared/projects/index.js';

withDefaults(
  defineProps<{
    items: SolutionSummary[];
    selectedSolutionId: string | null;
    keyword: string;
    category: string;
    loading?: boolean;
    error?: string | null;
  }>(),
  {
    loading: false,
    error: null,
  },
);

defineEmits<{
  'update:keyword': [value: string];
  'update:category': [value: string];
  search: [];
  select: [solutionId: string];
  create: [];
  refresh: [];
}>();
</script>

<template>
  <SectionCard title="方案列表" description="用于浏览、筛选并切换当前方案。">
    <template #actions>
      <n-button size="small" @click="$emit('refresh')">刷新</n-button>
      <n-button size="small" type="primary" @click="$emit('create')">新建方案</n-button>
    </template>

    <div class="solution-list">
      <div class="solution-list__filters">
        <n-input
          :value="keyword"
          placeholder="按名称或描述搜索"
          clearable
          @update:value="$emit('update:keyword', $event)"
        />
        <n-input
          :value="category"
          placeholder="按分类过滤"
          clearable
          @update:value="$emit('update:category', $event)"
        />
        <n-button block @click="$emit('search')">应用筛选</n-button>
      </div>

      <n-alert v-if="error" type="error" :bordered="false">
        {{ error }}
      </n-alert>

      <n-spin :show="loading">
        <EmptyState
          v-if="items.length === 0"
          title="还没有方案"
          description="先创建一个方案，再维护它和项目之间的归属关系。"
          action-label="新建方案"
          @action="$emit('create')"
        />

        <div v-else class="solution-list__items">
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="solution-list__item"
            :class="{ 'is-active': item.id === selectedSolutionId }"
            @click="$emit('select', item.id)"
          >
            <div class="solution-list__item-head">
              <strong>{{ item.name }}</strong>
              <n-tag size="small" round :type="item.id === selectedSolutionId ? 'success' : 'default'">
                {{ item.category || '未分类' }}
              </n-tag>
            </div>

            <p>{{ item.description || '暂无描述' }}</p>

            <div class="solution-list__meta">
              <span>{{ item.projectCount }} 个项目</span>
              <span>{{ item.tags || '无标签' }}</span>
            </div>

            <div class="solution-list__meta">
              <span>ID {{ item.id }}</span>
              <span>{{ formatSolutionTime(item.updatedAt) }}</span>
            </div>
          </button>
        </div>
      </n-spin>
    </div>
  </SectionCard>
</template>

<style scoped>
.solution-list {
  display: grid;
  gap: 16px;
}

.solution-list__filters,
.solution-list__items {
  display: grid;
  gap: 10px;
}

.solution-list__item {
  display: grid;
  gap: 10px;
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(120, 92, 56, 0.14);
  border-radius: 18px;
  background: rgba(255, 252, 247, 0.85);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    transform 160ms ease,
    background-color 160ms ease;
}

.solution-list__item:hover {
  transform: translateY(-1px);
  border-color: rgba(18, 113, 93, 0.28);
  background: rgba(255, 252, 247, 0.96);
}

.solution-list__item.is-active {
  border-color: rgba(18, 113, 93, 0.42);
  background: linear-gradient(135deg, rgba(18, 113, 93, 0.1), rgba(255, 252, 247, 0.98));
}

.solution-list__item-head,
.solution-list__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.solution-list__item p,
.solution-list__meta {
  margin: 0;
  color: #6f6255;
}

.solution-list__item p {
  line-height: 1.6;
}

.solution-list__meta {
  font-size: 12px;
}
</style>
