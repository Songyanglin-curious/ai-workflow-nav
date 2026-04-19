import type { FastifyInstance, FastifyRequest } from 'fastify';

import type { AppConfig } from '../../config/configSchema.js';
import {
  type TestEchoBody,
  type TestResolvePathBody,
  testEchoBodySchema,
  testEchoResponseSchema,
  testResolvePathBodySchema,
  testResolvePathResponseSchema,
  testStatusSchema,
} from './test.schemas.js';
import { echoTestMessage, getTestStatus, resolveTestPath } from './test.service.js';

export async function registerTestRoutes(app: FastifyInstance, config: AppConfig) {
  app.get(
    '/test/status',
    {
      schema: {
        response: {
          200: testStatusSchema,
        },
      },
    },
    async () => {
      return getTestStatus();
    },
  );

  app.post(
    '/test/echo',
    {
      schema: {
        body: testEchoBodySchema,
        response: {
          200: testEchoResponseSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Body: TestEchoBody }>) => {
      return echoTestMessage(request.body);
    },
  );

  app.post(
    '/test/resolve-path',
    {
      schema: {
        body: testResolvePathBodySchema,
        response: {
          200: testResolvePathResponseSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Body: TestResolvePathBody }>) => {
      return resolveTestPath(config, request.body);
    },
  );
}
