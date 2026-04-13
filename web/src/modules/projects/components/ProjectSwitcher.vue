<script setup lang="ts">
import { computed } from 'vue';

import type { ProjectSummary } from '../../../../../shared/projects/index.js';

const props = defineProps<{
  items: ProjectSummary[];
  selectedProjectId: string | null;
  loading?: boolean;
}>();

defineEmits<{
  select: [projectId: string];
  refresh: [];
}>();

const options = computed(() =>
  props.items.map((item) => ({
    label: item.name,
    value: item.id,
  })),
);
</script>

<template>
  <div class="project-switcher">
    <div class="project-switcher__copy">
      <span>当前项目</span>
      <strong>{{ items.find((item) => item.id === selectedProjectId)?.name ?? '未选择' }}</strong>
    </div>

    <div class="project-switcher__controls">
      <n-select
        :value="selectedProjectId"
        :options="options"
        :loading="loading"
        placeholder="切换项目"
        clearable
        style="min-width: 220px"
        @update:value="(value: string | null) => value && $emit('select', value)"
      />
      <n-button size="small" @click="$emit('refresh')">刷新</n-button>
    </div>
  </div>
</template>

<style scoped>
.project-switcher {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(120, 92, 56, 0.14);
  border-radius: 20px;
  background: rgba(255, 252, 247, 0.9);
}

.project-switcher__copy {
  display: grid;
  gap: 4px;
}

.project-switcher__copy span {
  color: #8b7b6d;
  font-size: 12px;
}

.project-switcher__copy strong {
  font-size: 16px;
}

.project-switcher__controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .project-switcher {
    display: grid;
  }
}
</style>
