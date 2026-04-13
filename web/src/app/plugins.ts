import type { Pinia } from 'pinia';
import type { App } from 'vue';
import type { Router } from 'vue-router';

export interface RegisterAppPluginsOptions {
  pinia: Pinia;
  router: Router;
}

export function registerAppPlugins(app: App, options: RegisterAppPluginsOptions): void {
  app.use(options.pinia);
  app.use(options.router);
}
