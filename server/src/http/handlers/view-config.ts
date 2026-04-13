import type { FastifyReply, FastifyRequest } from 'fastify';

import type { ProjectViewConfigService } from '../../domains/projects/view-config/service.js';
import { presentItems, presentNamed, presentResult } from '../presenter.js';

type PatchProjectNodeLayoutsRequest = Parameters<ProjectViewConfigService['patchProjectNodeLayouts']>[1];
type PatchProjectViewportRequest = Parameters<ProjectViewConfigService['patchProjectViewport']>[1];

type ProjectIdParamsRequest = FastifyRequest<{ Params: { projectId: string } }>;
type PatchProjectNodeLayoutsBodyRequest = FastifyRequest<{
  Params: { projectId: string };
  Body: PatchProjectNodeLayoutsRequest;
}>;
type PatchProjectViewportBodyRequest = FastifyRequest<{
  Params: { projectId: string };
  Body: PatchProjectViewportRequest;
}>;

export interface ProjectViewConfigHttpHandlers {
  getProjectNodeLayouts(request: ProjectIdParamsRequest, reply: FastifyReply): Promise<void>;
  patchProjectNodeLayouts(
    request: PatchProjectNodeLayoutsBodyRequest,
    reply: FastifyReply,
  ): Promise<void>;
  getProjectViewport(request: ProjectIdParamsRequest, reply: FastifyReply): Promise<void>;
  patchProjectViewport(request: PatchProjectViewportBodyRequest, reply: FastifyReply): Promise<void>;
}

export interface CreateProjectViewConfigHttpHandlersOptions {
  projectViewConfig: ProjectViewConfigService;
}

export function createProjectViewConfigHttpHandlers({
  projectViewConfig,
}: CreateProjectViewConfigHttpHandlersOptions): ProjectViewConfigHttpHandlers {
  return {
    async getProjectNodeLayouts(request, reply) {
      const items = projectViewConfig.getProjectNodeLayouts(request.params.projectId);
      await reply.send(presentItems(items));
    },

    async patchProjectNodeLayouts(request, reply) {
      const result = projectViewConfig.patchProjectNodeLayouts(request.params.projectId, request.body);
      await reply.send(presentResult(result));
    },

    async getProjectViewport(request, reply) {
      const viewport = projectViewConfig.getProjectViewport(request.params.projectId);
      await reply.send(presentNamed('viewport', viewport));
    },

    async patchProjectViewport(request, reply) {
      const viewport = projectViewConfig.patchProjectViewport(request.params.projectId, request.body);
      await reply.send(presentNamed('viewport', viewport));
    },
  };
}
