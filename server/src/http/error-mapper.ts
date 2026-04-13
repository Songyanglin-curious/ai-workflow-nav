import { ZodError } from 'zod';

import type { HttpErrorEnvelope } from './presenter.js';
import { presentError } from './presenter.js';

export interface MappedHttpError {
  statusCode: number;
  body: HttpErrorEnvelope;
}

function isErrorWithCode(error: unknown): error is Error & { code: string } {
  return error instanceof Error && typeof (error as { code?: unknown }).code === 'string';
}

function mapErrorCodeToStatusCode(code: string): number {
  if (
    code === 'NOT_FOUND' ||
    code.endsWith('_NOT_FOUND') ||
    code === 'MERMAID_NODE_NOT_FOUND' ||
    code === 'TOOL_TARGET_NOT_FOUND'
  ) {
    return 404;
  }

  if (code === 'CONFLICT' || code.endsWith('_CONFLICT')) {
    return 409;
  }

  if (code === 'PRECONDITION_FAILED') {
    return 412;
  }

  if (code === 'VALIDATION_ERROR' || code.endsWith('_VALIDATION_FAILED') || code.endsWith('_CYCLE_DETECTED')) {
    return 422;
  }

  return 500;
}

export function mapHttpError(error: unknown): MappedHttpError {
  if (error instanceof ZodError) {
    return {
      statusCode: 422,
      body: presentError('VALIDATION_ERROR', '请求参数不合法。', {
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      }),
    };
  }

  if (isErrorWithCode(error)) {
    return {
      statusCode: mapErrorCodeToStatusCode(error.code),
      body: presentError(error.code, error.message),
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      body: presentError('INTERNAL_ERROR', error.message),
    };
  }

  return {
    statusCode: 500,
    body: presentError('INTERNAL_ERROR', '未知服务端错误。'),
  };
}
