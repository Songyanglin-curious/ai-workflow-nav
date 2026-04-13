import type { FastifyReply, FastifyRequest } from 'fastify';

import { presentError, presentNamedData, presentResult } from '../presenter.js';
import { selfCheckBodySchema } from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
import type { StartupService } from '../../processes/startup/index.js';

type StartupReportRequest = FastifyRequest;
type SelfCheckRequest = FastifyRequest;

export function createStartupReportHandler(startupService: StartupService) {
  return async function startupReportHandler(
    _request: StartupReportRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const report = startupService.getLatestStartupReport();

    if (!report) {
      reply.status(500).send(presentError('INTERNAL_ERROR', '最新启动报告不存在。'));
      return;
    }

    reply.send(presentNamedData('report', report));
  };
}

export function createSelfCheckHandler(startupService: StartupService) {
  return async function selfCheckHandler(request: SelfCheckRequest, reply: FastifyReply): Promise<void> {
    const body = parseRequestValue(reply, selfCheckBodySchema, request.body ?? {});

    if (!body) {
      return;
    }

    try {
      const result = await startupService.runSelfCheck();
      reply.send(presentResult(result));
    } catch (error) {
      if (!sendKnownHttpError(reply, error)) {
        throw error;
      }
    }
  };
}
