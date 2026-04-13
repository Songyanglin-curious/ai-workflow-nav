<script setup lang="ts">
import type { EmptyStateProps } from '../types/ui';

defineProps<EmptyStateProps>();

defineEmits<{
  action: [];
}>();
</script>

<template>
  <section class="empty-state">
    <div class="empty-state__content">
      <h3 class="empty-state__title">
        {{ title }}
      </h3>
      <p v-if="description" class="empty-state__description">
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.actions || actionLabel" class="empty-state__actions">
      <slot name="actions">
        <button class="empty-state__button" type="button" @click="$emit('action')">
          {{ actionLabel }}
        </button>
      </slot>
    </div>
  </section>
</template>

<style scoped>
.empty-state {
  border-radius: 20px;
  border: 1px dashed rgba(100, 116, 139, 0.35);
  background: rgba(248, 250, 252, 0.9);
  padding: 24px;
  display: grid;
  gap: 16px;
  justify-items: start;
}

.empty-state__content {
  display: grid;
  gap: 8px;
}

.empty-state__title {
  margin: 0;
  font-size: 1rem;
}

.empty-state__description {
  margin: 0;
  color: #64748b;
}

.empty-state__button {
  border: 0;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  padding: 10px 16px;
  font: inherit;
  cursor: pointer;
}
</style>

