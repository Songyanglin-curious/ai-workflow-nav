import type Database from 'better-sqlite3';
import type { FastifyInstance, FastifyRequest } from 'fastify';

import {
  type QueryPromptDetailBody,
  type QueryPromptListBody,
  queryPromptDetailBodySchema,
  queryPromptDetailResponseSchema,
  queryPromptListBodySchema,
  queryPromptListResponseSchema,
} from './prompts.schemas.js';
import { handleQueryPromptDetail, handleQueryPromptList } from './prompts.service.js';

export async function registerPromptRoutes(app: FastifyInstance, db: Database.Database) {
  app.post(
    '/prompts/query-list',
    {
      schema: {
        body: queryPromptListBodySchema,
        response: {
          200: queryPromptListResponseSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Body: QueryPromptListBody }>) => {
      return handleQueryPromptList(db, request.body);
    },
  );

  app.post(
    '/prompts/query-detail',
    {
      schema: {
        body: queryPromptDetailBodySchema,
        response: {
          200: queryPromptDetailResponseSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Body: QueryPromptDetailBody }>) => {
      return handleQueryPromptDetail(db, request.body.id);
    },
  );
}
