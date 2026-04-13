<script setup lang="ts">
import { computed } from 'vue';

import { DEFAULT_PAGE_MAX_WIDTH } from '../constants/ui';
import type { PageShellProps } from '../types/ui';

const props = withDefaults(defineProps<PageShellProps>(), {
  maxWidth: DEFAULT_PAGE_MAX_WIDTH,
  compact: false,
});

const shellStyle = computed(() => ({
  '--page-shell-max-width': props.maxWidth,
}));
</script>

<template>
  <section class="page-shell" :class="{ 'page-shell--compact': compact }" :style="shellStyle">
    <header v-if="$slots.header || title || description || $slots.actions" class="page-shell__header">
      <slot name="header">
        <div class="page-shell__heading">
          <h2 v-if="title" class="page-shell__title">
            {{ title }}
          </h2>
          <p v-if="description" class="page-shell__description">
            {{ description }}
          </p>
        </div>
      </slot>

      <div v-if="$slots.actions" class="page-shell__actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="page-shell__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.page-shell {
  width: min(100%, var(--page-shell-max-width));
  margin-inline: auto;
  display: grid;
  gap: 20px;
}

.page-shell--compact {
  gap: 12px;
}

.page-shell__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-shell__heading {
  display: grid;
  gap: 6px;
}

.page-shell__title {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.page-shell__description {
  margin: 0;
  color: #475569;
}

.page-shell__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-shell__body {
  min-width: 0;
}
</style>

