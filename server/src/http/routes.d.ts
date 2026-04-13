import type { FastifyInstance } from 'fastify';

import type { AppContainer } from '../app/container.js';

declare module './routes.js' {
  export function registerHttpRoutes(app: FastifyInstance, container: AppContainer): Promise<void>;
}
