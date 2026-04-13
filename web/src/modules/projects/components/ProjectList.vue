<script setup lang="ts">
import { EmptyState, SectionCard } from '../../../shared/components/index.js';
import { formatProjectTime, type ProjectDraft } from '../useProjectsModule.js';
import type { ProjectSummary } from '../../../../../shared/projects/index.js';

withDefaults(
  defineProps<{
    items: ProjectSummary[];
    selectedProjectId: string | null;
    keyword: string;
    category: string;
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

defineEmits<{
  'update:keyword': [value: string];
  'update:category': [value: string];
  search: [];
  select: [projectId: string];
  create: [];
  refresh: [];
}>();
</script>

<template>
  <SectionCard title="项目列表" description="用于浏览、筛选并切换当前项目。">
    <template #actions>
      <n-button size="small" @click="$emit('refresh')">刷新</n-button>
      <n-button size="small" type="primary" @click="$emit('create')">新建项目</n-button>
    </template>

    <div class="project-list">
      <div class="project-list__filters">
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

      <n-spin :show="loading">
        <EmptyState
          v-if="items.length === 0"
          title="还没有项目"
          description="先创建一个项目，再进入工作区的后续节点与画布流程。"
          action-label="新建项目"
          @action="$emit('create')"
        />

        <div v-else class="project-list__items">
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="project-list__item"
            :class="{ 'is-active': item.id === selectedProjectId }"
            @click="$emit('select', item.id)"
          >
            <div class="project-list__item-head">
              <strong>{{ item.name }}</strong>
              <n-tag size="small" round :type="item.id === selectedProjectId ? 'success' : 'default'">
                {{ item.category || '未分类' }}
              </n-tag>
            </div>
            <p>{{ item.description || '暂无描述' }}</p>
            <div class="project-list__meta">
              <span>{{ item.tags || '无标签' }}</span>
              <span>{{ formatProjectTime(item.updatedAt) }}</span>
            </div>
          </button>
        </div>
      </n-spin>
    </div>
  </SectionCard>
</template>

<style scoped>
.project-list {
  display: grid;
  gap: 16px;
}

.project-list__filters {
  display: grid;
  gap: 10px;
}

.project-list__items {
  display: grid;
  gap: 12px;
}

.project-list__item {
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

.project-list__item:hover {
  transform: translateY(-1px);
  border-color: rgba(18, 113, 93, 0.28);
  background: rgba(255, 252, 247, 0.96);
}

.project-list__item.is-active {
  border-color: rgba(18, 113, 93, 0.42);
  background: linear-gradient(135deg, rgba(18, 113, 93, 0.1), rgba(255, 252, 247, 0.98));
}

.project-list__item-head,
.project-list__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.project-list__item-head strong {
  font-size: 16px;
}

.project-list__item p,
.project-list__meta {
  margin: 0;
  color: #6f6255;
}

.project-list__item p {
  line-height: 1.6;
}

.project-list__meta {
  font-size: 12px;
}
</style>
