import type { FastifyReply, FastifyRequest } from 'fastify';

import { presentResult } from '../presenter.js';
import {
  projectDeletionExecuteRequestSchema,
  projectDeletionParamsSchema,
  type ProjectDeletionParams,
} from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
import type { ProjectDeletionService } from '../../processes/project-deletion/index.js';

type ProjectDeletionCheckRequest = FastifyRequest<{ Params: ProjectDeletionParams }>;
type ProjectDeletionExecuteRequestRoute = FastifyRequest<{
  Params: ProjectDeletionParams;
  Body: unknown;
}>;

export function createProjectDeletionCheckHandler(projectDeletionService: ProjectDeletionService) {
  return async function projectDeletionCheckHandler(
    request: ProjectDeletionCheckRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const params = parseRequestValue(reply, projectDeletionParamsSchema, request.params);

    if (!params) {
      return;
    }

    try {
      const result = await projectDeletionService.checkProjectDeletion(params.projectId);
      reply.send(presentResult(result));
    } catch (error) {
      if (!sendKnownHttpError(reply, error)) {
        throw error;
      }
    }
  };
}

export function createProjectDeletionExecuteHandler(projectDeletionService: ProjectDeletionService) {
  return async function projectDeletionExecuteHandler(
    request: ProjectDeletionExecuteRequestRoute,
    reply: FastifyReply,
  ): Promise<void> {
    const params = parseRequestValue(reply, projectDeletionParamsSchema, request.params);

    if (!params) {
      return;
    }

    const body = parseRequestValue(reply, projectDeletionExecuteRequestSchema, request.body);

    if (!body) {
      return;
    }

    try {
      const result = await projectDeletionService.executeProjectDeletion(params.projectId, body);
      reply.send(presentResult(result));
    } catch (error) {
      if (!sendKnownHttpError(reply, error)) {
        throw error;
      }
    }
  };
}
