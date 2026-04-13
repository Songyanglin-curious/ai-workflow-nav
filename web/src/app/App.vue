<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import {
  NConfigProvider,
  NDialogProvider,
  NGlobalStyle,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLayoutSider,
  NMessageProvider,
  NScrollbar,
  NTag,
  type GlobalThemeOverrides,
} from 'naive-ui';

import { appNavigationItems } from './routes';

const route = useRoute();

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#12715d',
    primaryColorHover: '#1b8b74',
    primaryColorPressed: '#0d5b4a',
    bodyColor: '#f4efe6',
    cardColor: '#fffaf2',
    borderColor: '#d8c9b5',
    textColorBase: '#2c241c',
    textColor1: '#2c241c',
    textColor2: '#65584c',
    textColor3: '#8b7b6d',
  },
};

const sectionLabels: Record<string, string> = {
  workspace: '工作区',
  library: '资源',
  system: '系统',
};

const navigationGroups = computed(() => {
  return Object.entries(sectionLabels).map(([section, label]) => ({
    key: section,
    label,
    items: appNavigationItems.filter((item) => item.section === section),
  }));
});
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-global-style />
    <n-dialog-provider>
      <n-message-provider>
        <n-layout class="app-frame has-texture">
          <n-layout-sider
            bordered
            collapse-mode="width"
            :collapsed-width="0"
            :width="308"
            show-trigger="bar"
            class="app-frame__sider"
          >
            <n-scrollbar class="app-frame__sider-scroll">
              <div class="brand-card">
                <p class="eyebrow">AI Workflow Navigator</p>
                <h1>前端基础骨架</h1>
                <p class="brand-card__summary">
                  这一层先固定启动、路由、页面装配和后续模块接入位置，让后续业务模块不再散着挂进入口文件。
                </p>
                <n-tag size="small" round type="success">
                  Vue 3 + Vite + Vue Router + Pinia
                </n-tag>
              </div>

              <section
                v-for="group in navigationGroups"
                :key="group.key"
                class="nav-group"
              >
                <header class="nav-group__header">{{ group.label }}</header>
                <RouterLink
                  v-for="item in group.items"
                  :key="item.to"
                  :to="item.to"
                  class="nav-link"
                  :class="{ 'is-active': route.path === item.to }"
                >
                  <span class="nav-link__title">{{ item.navLabel }}</span>
                  <span class="nav-link__desc">{{ item.description }}</span>
                </RouterLink>
              </section>
            </n-scrollbar>
          </n-layout-sider>

          <n-layout>
            <n-layout-header bordered class="app-frame__header">
              <div class="header-copy">
                <p class="eyebrow">当前页面</p>
                <strong>{{ route.meta.title }}</strong>
              </div>
              <p class="header-copy__description">
                {{ route.meta.description }}
              </p>
            </n-layout-header>

            <n-layout-content embedded content-style="padding: 24px;">
              <RouterView v-slot="{ Component }">
                <component :is="Component" />
              </RouterView>
            </n-layout-content>
          </n-layout>
        </n-layout>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<style scoped>
.has-texture {
  --paper: #f4efe6;
  --panel: rgba(255, 250, 242, 0.94);
  --ink: #2c241c;
  --muted: #6f6255;
  --line: rgba(120, 92, 56, 0.18);
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(18, 113, 93, 0.16), transparent 28%),
    radial-gradient(circle at bottom right, rgba(206, 120, 43, 0.18), transparent 24%),
    linear-gradient(180deg, #fbf7f0 0%, var(--paper) 100%);
}

.app-frame__sider {
  background: linear-gradient(180deg, rgba(249, 241, 229, 0.96), rgba(255, 250, 242, 0.92));
  backdrop-filter: blur(12px);
}

.app-frame__sider-scroll {
  height: 100vh;
}

.brand-card {
  margin: 18px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--panel);
  box-shadow: 0 18px 40px rgba(82, 62, 39, 0.08);
}

.brand-card h1 {
  margin: 10px 0 12px;
  font-size: 28px;
  line-height: 1.05;
  color: var(--ink);
}

.brand-card__summary {
  margin: 0 0 14px;
  color: var(--muted);
  line-height: 1.6;
}

.eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.nav-group {
  padding: 0 18px 18px;
}

.nav-group__header {
  margin-bottom: 10px;
  color: #8a7358;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.nav-link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  padding: 14px 16px;
  border: 1px solid rgba(120, 92, 56, 0.14);
  border-radius: 18px;
  background: rgba(255, 252, 247, 0.75);
  color: inherit;
  text-decoration: none;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease;
}

.nav-link:hover {
  transform: translateY(-1px);
  border-color: rgba(18, 113, 93, 0.28);
  background: rgba(255, 252, 247, 0.95);
}

.nav-link.is-active {
  border-color: rgba(18, 113, 93, 0.42);
  background: linear-gradient(135deg, rgba(18, 113, 93, 0.12), rgba(255, 252, 247, 0.95));
}

.nav-link__title {
  font-weight: 700;
  color: var(--ink);
}

.nav-link__desc {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.app-frame__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  min-height: 96px;
  padding: 18px 24px;
  background: rgba(255, 250, 242, 0.72);
  backdrop-filter: blur(10px);
}

.header-copy {
  display: grid;
  gap: 4px;
}

.header-copy strong {
  font-size: 24px;
  color: var(--ink);
}

.header-copy__description {
  max-width: 520px;
  margin: 0;
  color: var(--muted);
  line-height: 1.55;
}

@media (max-width: 960px) {
  .app-frame__header {
    flex-direction: column;
    align-items: start;
  }
}
</style>
