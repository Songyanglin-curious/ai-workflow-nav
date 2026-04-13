import type { FastifyReply, FastifyRequest } from 'fastify';

import { presentResult } from '../presenter.js';
import {
  workflowRuntimeParamsSchema,
  workflowRuntimeTriggerRequestSchema,
  type WorkflowRuntimeParams,
} from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
import type { WorkflowRuntimeActionsService } from '../../processes/workflow-runtime-actions/index.js';

type WorkflowRuntimeDetailRequest = FastifyRequest<{ Params: WorkflowRuntimeParams }>;
type WorkflowRuntimeTriggerRequest = FastifyRequest<{ Params: WorkflowRuntimeParams }>;

export function createWorkflowRuntimeDetailHandler(workflowRuntimeActionsService: WorkflowRuntimeActionsService) {
  return async function workflowRuntimeDetailHandler(
    request: WorkflowRuntimeDetailRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const params = parseRequestValue(reply, workflowRuntimeParamsSchema, request.params);

    if (!params) {
      return;
    }

    try {
      const result = await workflowRuntimeActionsService.getWorkflowRuntimeNodeDetail(
        params.projectNodeId,
        params.mermaidNodeId,
      );
      reply.send(presentResult(result));
    } catch (error) {
      if (!sendKnownHttpError(reply, error)) {
        throw error;
      }
    }
  };
}

export function createWorkflowRuntimeTriggerHandler(workflowRuntimeActionsService: WorkflowRuntimeActionsService) {
  return async function workflowRuntimeTriggerHandler(
    request: WorkflowRuntimeTriggerRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const params = parseRequestValue(reply, workflowRuntimeParamsSchema, request.params);

    if (!params) {
      return;
    }

    const body = parseRequestValue(reply, workflowRuntimeTriggerRequestSchema, request.body ?? {});

    if (!body) {
      return;
    }

    try {
      const result = await workflowRuntimeActionsService.triggerWorkflowRuntimeNodeAction(
        params.projectNodeId,
        params.mermaidNodeId,
      );
      reply.send(presentResult(result));
    } catch (error) {
      if (!sendKnownHttpError(reply, error)) {
        throw error;
      }
    }
  };
}
