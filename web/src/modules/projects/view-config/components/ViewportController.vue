<script setup lang="ts">
import type { ProjectViewport } from '../../../../../../shared/projects/index.js';
import type { ViewportSnapshot } from '../composables.js';

const props = withDefaults(
  defineProps<{
    currentViewport: ViewportSnapshot;
    persistedViewport: ProjectViewport | null;
    loading?: boolean;
    saving?: boolean;
  }>(),
  {
    loading: false,
    saving: false,
  },
);

defineEmits<{
  save: [];
  restore: [];
  reset: [];
}>();

function formatNumber(value: number): string {
  return value.toFixed(2);
}
</script>

<template>
  <section class="viewport-controller">
    <div class="viewport-controller__stats">
      <article>
        <span>当前 X / Y</span>
        <strong>{{ formatNumber(currentViewport.x) }} / {{ formatNumber(currentViewport.y) }}</strong>
      </article>
      <article>
        <span>当前缩放</span>
        <strong>{{ formatNumber(currentViewport.zoom) }}</strong>
      </article>
      <article>
        <span>持久化视角</span>
        <strong>{{ persistedViewport ? '已保存' : '尚未保存' }}</strong>
      </article>
    </div>

    <div class="viewport-controller__actions">
      <n-button :loading="loading" @click="$emit('restore')">恢复已保存视角</n-button>
      <n-button @click="$emit('reset')">回到默认视角</n-button>
      <n-button type="primary" :loading="saving" @click="$emit('save')">保存当前视角</n-button>
    </div>
  </section>
</template>

<style scoped>
.viewport-controller {
  display: grid;
  gap: 12px;
}

.viewport-controller__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.viewport-controller__stats article {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.82);
}

.viewport-controller__stats span {
  color: #8b7b6d;
  font-size: 12px;
}

.viewport-controller__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 720px) {
  .viewport-controller__stats {
    grid-template-columns: 1fr;
  }

  .viewport-controller__actions {
    justify-content: stretch;
  }
}
</style>
