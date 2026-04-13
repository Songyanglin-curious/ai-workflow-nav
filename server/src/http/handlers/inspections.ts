import type { FastifyReply, FastifyRequest } from 'fastify';

import { presentResult } from '../presenter.js';
import { inspectionsRunBodySchema } from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
import type { InspectionsProcess } from '../../processes/inspections/index.js';

type InspectionsRunRequest = FastifyRequest;

export function createInspectionsRunHandler(inspectionsProcess: InspectionsProcess) {
  return async function inspectionsRunHandler(
    request: InspectionsRunRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const body = parseRequestValue(reply, inspectionsRunBodySchema, request.body ?? {});

    if (!body) {
      return;
    }

    try {
      const result = await inspectionsProcess.runInspection();
      reply.send(presentResult(result));
    } catch (error) {
      if (!sendKnownHttpError(reply, error)) {
        throw error;
      }
    }
  };
}
