import type { RouteRecordRaw } from 'vue-router';

export interface AppRouteMeta {
  navLabel: string;
  title: string;
  description: string;
  section: 'workspace' | 'library' | 'system';
}

export interface AppNavigationItem {
  to: string;
  navLabel: string;
  title: string;
  description: string;
  section: AppRouteMeta['section'];
}

declare module 'vue-router' {
  interface RouteMeta extends AppRouteMeta {}
}

export const appRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/projects/workspace',
  },
  {
    path: '/projects/workspace',
    name: 'projects-workspace',
    component: () => import('../pages/ProjectsWorkspacePage.vue'),
    meta: {
      navLabel: '项目工作区',
      title: '项目工作区',
      description: '主工作区入口，后续承接项目切换、节点树、主画布与节点详情面板。',
      section: 'workspace',
    },
  },
  {
    path: '/prompts',
    name: 'prompts',
    component: () => import('../pages/PromptsPage.vue'),
    meta: {
      navLabel: 'Prompts',
      title: '提示词管理',
      description: '用于装配 Prompt 列表、详情、编辑与删除交互。',
      section: 'library',
    },
  },
  {
    path: '/workflows',
    name: 'workflows',
    component: () => import('../pages/WorkflowsPage.vue'),
    meta: {
      navLabel: 'Workflows',
      title: '工作流管理',
      description: '用于装配 Mermaid 工作流、节点动作绑定与后续预览交互。',
      section: 'library',
    },
  },
  {
    path: '/solutions',
    name: 'solutions',
    component: () => import('../pages/SolutionsPage.vue'),
    meta: {
      navLabel: 'Solutions',
      title: '方案管理',
      description: '用于装配方案列表、编辑与 Project 绑定入口。',
      section: 'library',
    },
  },
  {
    path: '/system/inspections',
    name: 'system-inspections',
    component: () => import('../pages/InspectionsPage.vue'),
    meta: {
      navLabel: '巡检',
      title: '系统巡检',
      description: '用于装配巡检执行、问题列表与一致性检查结果。',
      section: 'system',
    },
  },
  {
    path: '/system/sync',
    name: 'system-sync',
    component: () => import('../pages/SyncPage.vue'),
    meta: {
      navLabel: '同步',
      title: '导入导出',
      description: '用于装配导入导出动作与结果展示。',
      section: 'system',
    },
  },
  {
    path: '/system/startup',
    name: 'system-startup',
    component: () => import('../pages/StartupPage.vue'),
    meta: {
      navLabel: '启动报告',
      title: '启动报告',
      description: '用于查看最新启动报告，并提供手动自检入口。',
      section: 'system',
    },
  },
  {
    path: '/system/settings',
    name: 'system-settings',
    component: () => import('../pages/SettingsPage.vue'),
    meta: {
      navLabel: '设置摘要',
      title: '设置摘要',
      description: '当前只做展示型页面，后续复用既有系统接口返回的配置摘要。',
      section: 'system',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFoundPage.vue'),
    meta: {
      navLabel: '未找到',
      title: '页面未找到',
      description: '当前访问的页面不存在，请从导航重新进入。',
      section: 'system',
    },
  },
];

export const appNavigationItems: AppNavigationItem[] = appRoutes
  .filter((route): route is RouteRecordRaw & { meta: AppRouteMeta; path: string } =>
    typeof route.path === 'string' && Boolean(route.meta?.navLabel) && route.name !== 'not-found',
  )
  .map((route) => ({
    to: route.path,
    navLabel: route.meta.navLabel,
    title: route.meta.title,
    description: route.meta.description,
    section: route.meta.section,
  }));
