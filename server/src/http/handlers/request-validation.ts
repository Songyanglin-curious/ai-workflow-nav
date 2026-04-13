import type { FastifyReply } from 'fastify';
import { z, type ZodTypeAny } from 'zod';

import { presentError } from '../presenter.js';

export function parseRequestValue<TSchema extends ZodTypeAny>(
  reply: FastifyReply,
  schema: TSchema,
  value: unknown,
): z.infer<TSchema> | undefined {
  const parsedResult = schema.safeParse(value);

  if (parsedResult.success) {
    return parsedResult.data;
  }

  reply.status(422).send(
    presentError('VALIDATION_ERROR', '请求参数不合法。', {
      issues: parsedResult.error.issues,
    }),
  );

  return undefined;
}
