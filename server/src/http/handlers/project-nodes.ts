import type { FastifyReply, FastifyRequest } from 'fastify';

import type { ProjectNodeService } from '../../domains/projects/project-nodes/service.js';
import { presentItems, presentNamed } from '../presenter.js';

type ProjectNodesListQuery = Parameters<ProjectNodeService['listProjectNodes']>[1];
type CreateProjectNodeRequest = Parameters<ProjectNodeService['createProjectNode']>[1];
type UpdateProjectNodeRequest = Parameters<ProjectNodeService['updateProjectNode']>[1];

type ProjectNodesListRequest = FastifyRequest<{
  Params: { projectId: string };
  Querystring: ProjectNodesListQuery;
}>;
type ProjectNodeParamsRequest = FastifyRequest<{ Params: { id: string } }>;
type CreateProjectNodeBodyRequest = FastifyRequest<{
  Params: { projectId: string };
  Body: CreateProjectNodeRequest;
}>;
type UpdateProjectNodeBodyRequest = FastifyRequest<{
  Params: { id: string };
  Body: UpdateProjectNodeRequest;
}>;

export interface ProjectNodesHttpHandlers {
  listProjectNodes(request: ProjectNodesListRequest, reply: FastifyReply): Promise<void>;
  getProjectNode(request: ProjectNodeParamsRequest, reply: FastifyReply): Promise<void>;
  createProjectNode(request: CreateProjectNodeBodyRequest, reply: FastifyReply): Promise<void>;
  updateProjectNode(request: UpdateProjectNodeBodyRequest, reply: FastifyReply): Promise<void>;
}

export interface CreateProjectNodesHttpHandlersOptions {
  projectNodes: ProjectNodeService;
}

export function createProjectNodesHttpHandlers({
  projectNodes,
}: CreateProjectNodesHttpHandlersOptions): ProjectNodesHttpHandlers {
  return {
    async listProjectNodes(request, reply) {
      const items = projectNodes.listProjectNodes(request.params.projectId, request.query);
      await reply.send(presentItems(items));
    },

    async getProjectNode(request, reply) {
      const projectNode = projectNodes.getProjectNodeById(request.params.id);
      await reply.send(presentNamed('projectNode', projectNode));
    },

    async createProjectNode(request, reply) {
      const projectNode = await projectNodes.createProjectNode(request.params.projectId, request.body);
      await reply.send(presentNamed('projectNode', projectNode));
    },

    async updateProjectNode(request, reply) {
      const projectNode = projectNodes.updateProjectNode(request.params.id, request.body);
      await reply.send(presentNamed('projectNode', projectNode));
    },
  };
}
