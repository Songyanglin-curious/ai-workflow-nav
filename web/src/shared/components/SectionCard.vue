<script setup lang="ts">
import { computed } from 'vue';

import type { SectionCardProps } from '../types/ui';

const props = withDefaults(defineProps<SectionCardProps>(), {
  elevated: true,
});

const cardClass = computed(() => ({
  'section-card--elevated': props.elevated,
}));
</script>

<template>
  <section class="section-card" :class="cardClass">
    <header v-if="$slots.header || title || description || $slots.actions" class="section-card__header">
      <slot name="header">
        <div class="section-card__heading">
          <h3 v-if="title" class="section-card__title">
            {{ title }}
          </h3>
          <p v-if="description" class="section-card__description">
            {{ description }}
          </p>
        </div>
      </slot>

      <div v-if="$slots.actions" class="section-card__actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="section-card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section-card {
  border-radius: 20px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
}

.section-card--elevated {
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.section-card__header,
.section-card__body {
  padding-inline: 20px;
}

.section-card__header {
  padding-top: 18px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-card__body {
  padding-top: 16px;
  padding-bottom: 20px;
}

.section-card__heading {
  display: grid;
  gap: 6px;
}

.section-card__title {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.3;
}

.section-card__description {
  margin: 0;
  color: #64748b;
}

.section-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

