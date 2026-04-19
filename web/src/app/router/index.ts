import { createRouter, createWebHistory } from 'vue-router'
import { registerRouterGuards } from './guards'
import { appRoutes } from './routes'

export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: appRoutes,
  })

  registerRouterGuards(router)

  return router
}
