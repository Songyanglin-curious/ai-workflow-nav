import Fastify, { type FastifyInstance } from 'fastify';

import type { AppContainer } from '../app/container.js';
import { mapHttpError } from './error-mapper.js';
import { registerHttpRoutes } from './routes.js';

export async function createHttpServer(container: AppContainer): Promise<FastifyInstance> {
  const app = Fastify();

  app.setErrorHandler((error, _request, reply) => {
    const mappedError = mapHttpError(error);
    reply.status(mappedError.statusCode).send(mappedError.body);
  });

  await registerHttpRoutes(app, container);

  return app;
}
