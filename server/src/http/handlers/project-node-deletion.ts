import type { FastifyReply, FastifyRequest } from 'fastify';

import { presentResult } from '../presenter.js';
import {
  projectNodeDeletionExecuteRequestSchema,
  projectNodeDeletionParamsSchema,
  type ProjectNodeDeletionParams,
} from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
import type { ProjectNodeDeletionService } from '../../processes/project-node-deletion/index.js';

type ProjectNodeDeletionCheckRequest = FastifyRequest<{ Params: ProjectNodeDeletionParams }>;
type ProjectNodeDeletionExecuteRequestRoute = FastifyRequest<{
  Params: ProjectNodeDeletionParams;
  Body: unknown;
}>;

export function createProjectNodeDeletionCheckHandler(projectNodeDeletionService: ProjectNodeDeletionService) {
  return async function projectNodeDeletionCheckHandler(
    request: ProjectNodeDeletionCheckRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const params = parseRequestValue(reply, projectNodeDeletionParamsSchema, request.params);

    if (!params) {
      return;
    }

    try {
      const result = await projectNodeDeletionService.checkProjectNodeDeletion(params.projectNodeId);
      reply.send(presentResult(result));
    } catch (error) {
      if (!sendKnownHttpError(reply, error)) {
        throw error;
      }
    }
  };
}

export function createProjectNodeDeletionExecuteHandler(projectNodeDeletionService: ProjectNodeDeletionService) {
  return async function projectNodeDeletionExecuteHandler(
    request: ProjectNodeDeletionExecuteRequestRoute,
    reply: FastifyReply,
  ): Promise<void> {
    const params = parseRequestValue(reply, projectNodeDeletionParamsSchema, request.params);

    if (!params) {
      return;
    }

    const body = parseRequestValue(reply, projectNodeDeletionExecuteRequestSchema, request.body);

    if (!body) {
      return;
    }

    try {
      const result = await projectNodeDeletionService.executeProjectNodeDeletion(
        params.projectNodeId,
        body,
      );
      reply.send(presentResult(result));
    } catch (error) {
      if (!sendKnownHttpError(reply, error)) {
        throw error;
      }
    }
  };
}
