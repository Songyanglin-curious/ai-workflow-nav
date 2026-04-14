import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from './appError.js';
import { errorCodes } from './errorCodes.js';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: Error, _request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        code: error.code,
        message: error.message,
        details: error.details ?? null,
      });
      return;
    }

    reply.status(500).send({
      code: errorCodes.internalError,
      message: '服务内部错误',
      details: null,
    });
  });
}
