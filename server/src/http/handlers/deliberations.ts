import type { FastifyReply, FastifyRequest } from 'fastify';

import type { DeliberationsService } from '../../domains/projects/deliberations/service.js';
import { presentItems, presentNamed, presentResult } from '../presenter.js';

type AppendLatestDeliberationsRequest = Parameters<DeliberationsService['appendLatestDeliberations']>[1];
type CreateDeliberationsFileRequest = Parameters<DeliberationsService['createDeliberationsFile']>[1];

type ProjectNodeIdParamsRequest = FastifyRequest<{ Params: { projectNodeId: string } }>;
type AppendLatestDeliberationsBodyRequest = FastifyRequest<{
  Params: { projectNodeId: string };
  Body: AppendLatestDeliberationsRequest;
}>;
type CreateDeliberationsFileBodyRequest = FastifyRequest<{
  Params: { projectNodeId: string };
  Body: CreateDeliberationsFileRequest;
}>;

export interface DeliberationsHttpHandlers {
  getDeliberationsRecord(request: ProjectNodeIdParamsRequest, reply: FastifyReply): Promise<void>;
  listDeliberationsRecordFiles(request: ProjectNodeIdParamsRequest, reply: FastifyReply): Promise<void>;
  appendLatestDeliberations(
    request: AppendLatestDeliberationsBodyRequest,
    reply: FastifyReply,
  ): Promise<void>;
  createDeliberationsFile(
    request: CreateDeliberationsFileBodyRequest,
    reply: FastifyReply,
  ): Promise<void>;
}

export interface CreateDeliberationsHttpHandlersOptions {
  deliberations: DeliberationsService;
}

export function createDeliberationsHttpHandlers({
  deliberations,
}: CreateDeliberationsHttpHandlersOptions): DeliberationsHttpHandlers {
  return {
    async getDeliberationsRecord(request, reply) {
      const deliberationsRecord = await deliberations.getDeliberationsRecordFolderInfo(request.params.projectNodeId);
      await reply.send(presentNamed('deliberationsRecord', deliberationsRecord));
    },

    async listDeliberationsRecordFiles(request, reply) {
      const items = await deliberations.listDeliberationsRecordFiles(request.params.projectNodeId);
      await reply.send(presentItems(items));
    },

    async appendLatestDeliberations(request, reply) {
      const result = await deliberations.appendLatestDeliberations(request.params.projectNodeId, request.body);
      await reply.send(presentResult(result));
    },

    async createDeliberationsFile(request, reply) {
      const result = await deliberations.createDeliberationsFile(request.params.projectNodeId, request.body);
      await reply.send(presentResult(result));
    },
  };
}
