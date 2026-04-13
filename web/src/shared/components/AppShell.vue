<script setup lang="ts">
import { computed } from 'vue';

import { DEFAULT_APP_MAX_WIDTH } from '../constants/ui';
import type { AppShellProps } from '../types/ui';

const props = withDefaults(defineProps<AppShellProps>(), {
  centered: false,
  padded: true,
  maxWidth: DEFAULT_APP_MAX_WIDTH,
});

const shellStyle = computed(() => ({
  '--app-shell-max-width': props.maxWidth,
}));
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--centered': centered, 'app-shell--padded': padded }" :style="shellStyle">
    <header v-if="$slots.header || title || description" class="app-shell__header">
      <slot name="header">
        <h1 v-if="title" class="app-shell__title">
          {{ title }}
        </h1>
        <p v-if="description" class="app-shell__description">
          {{ description }}
        </p>
      </slot>
    </header>

    <main class="app-shell__content">
      <slot />
    </main>

    <footer v-if="$slots.footer" class="app-shell__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 24px;
  color: #1f2937;
  background:
    radial-gradient(circle at top left, rgba(15, 23, 42, 0.08), transparent 32%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.app-shell--padded {
  padding: 32px;
}

.app-shell--centered {
  place-items: center;
}

.app-shell__header,
.app-shell__content,
.app-shell__footer {
  width: min(100%, var(--app-shell-max-width));
  margin-inline: auto;
}

.app-shell__header,
.app-shell__footer {
  display: grid;
  gap: 8px;
}

.app-shell__title {
  margin: 0;
  font-size: 2rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.app-shell__description {
  margin: 0;
  max-width: 72ch;
  color: #475569;
}

.app-shell__content {
  min-width: 0;
}
</style>

