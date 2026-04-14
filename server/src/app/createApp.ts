import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { registerErrorHandler } from './errorHandler.js';
import type { AppConfig } from '../config/configSchema.js';
import { createDatabase } from '../infra/db/sqlite.js';
import { runMigrations } from '../infra/db/migrate.js';
import { registerPromptRoutes } from '../modules/prompts/prompts.routes.js';
import { registerTestRoutes } from '../modules/test/test.routes.js';

type CreateAppOptions = {
  config: AppConfig;
};

export async function createApp(options: CreateAppOptions) {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  const db = createDatabase(options.config);

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandler(app);

  await runMigrations({
    db,
  });

  app.get('/health', async () => {
    return {
      ok: true,
    };
  });

  await registerTestRoutes(app, options.config);
  await registerPromptRoutes(app, db);

  app.addHook('onClose', async () => {
    db.close();
  });

  return app;
}
