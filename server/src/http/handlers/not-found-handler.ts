import type { FastifyReply, FastifyRequest } from 'fastify';

import { presentError } from '../presenter.js';

export async function notFoundHandler(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.status(404).send(presentError('NOT_FOUND', '请求的接口不存在。'));
}
