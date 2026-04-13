import { createApp } from 'vue';
import { createPinia } from 'pinia';

import RootApp from '../App.vue';
import { createRuntime } from '../runtime';
import { installAppErrorHandler } from './error-handler';
import { registerAppPlugins } from './plugins';
import { createAppRouter } from './router';

export async function bootstrapApp(): Promise<void> {
  const app = createApp(RootApp);
  const pinia = createPinia();
  const router = createAppRouter();

  installAppErrorHandler(app);
  registerAppPlugins(app, {
    pinia,
    router,
  });
  createRuntime(pinia);

  await router.isReady();
  app.mount('#app');
}
