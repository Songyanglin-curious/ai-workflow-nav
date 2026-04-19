import type { RouteRecordRaw } from 'vue-router'
import BlankLayout from '../layouts/BlankLayout.vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import PromptPage from '../../pages/prompt/PromptPage.vue'

export const appRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        redirect: '/prompts',
      },
      {
        path: 'prompts',
        name: 'prompt',
        component: PromptPage,
        meta: {
          title: '提示词管理',
        },
      },
    ],
  },
  {
    path: '/blank',
    component: BlankLayout,
    children: [
      {
        path: '',
        redirect: '/prompts',
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/prompts',
  },
]
