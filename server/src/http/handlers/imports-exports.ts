import type { FastifyReply, FastifyRequest } from 'fastify';

import { presentResult } from '../presenter.js';
import { syncExportBodySchema, syncImportBodySchema } from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
import type { ImportsExportsProcess } from '../../processes/imports-exports/index.js';

type SyncExportRequest = FastifyRequest;
type SyncImportRequest = FastifyRequest;

export function createSyncExportHandler(importsExportsProcess: ImportsExportsProcess) {
  return async function syncExportHandler(request: SyncExportRequest, reply: FastifyReply): Promise<void> {
    const body = parseRequestValue(reply, syncExportBodySchema, request.body ?? {});

    if (!body) {
      return;
    }

    try {
      const result = await importsExportsProcess.exportSync();
      reply.send(presentResult(result));
    } catch (error) {
      if (!sendKnownHttpError(reply, error)) {
        throw error;
      }
    }
  };
}

export function createSyncImportHandler(importsExportsProcess: ImportsExportsProcess) {
  return async function syncImportHandler(request: SyncImportRequest, reply: FastifyReply): Promise<void> {
    const body = parseRequestValue(reply, syncImportBodySchema, request.body);

    if (!body) {
      return;
    }

    try {
      const result = await importsExportsProcess.importSync(body.mode);
      reply.send(presentResult(result));
    } catch (error) {
      if (!sendKnownHttpError(reply, error)) {
        throw error;
      }
    }
  };
}
