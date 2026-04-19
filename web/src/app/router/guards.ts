import type { Router } from 'vue-router'

export function registerRouterGuards(router: Router) {
  router.afterEach((to) => {
    const title = typeof to.meta.title === 'string' ? to.meta.title : '提示词工作台'
    document.title = title
  })
}
