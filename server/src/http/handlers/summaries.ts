import type { FastifyReply, FastifyRequest } from 'fastify';

import type { SummaryService } from '../../domains/projects/index.js';
import { presentItems, presentNamed } from '../presenter.js';

type ProjectNodeIdParamsRequest = FastifyRequest<{ Params: { projectNodeId: string } }>;

export interface SummariesHttpHandlers {
  getSummaryFolder(request: ProjectNodeIdParamsRequest, reply: FastifyReply): Promise<void>;
  listSummaryFiles(request: ProjectNodeIdParamsRequest, reply: FastifyReply): Promise<void>;
}

export interface CreateSummariesHttpHandlersOptions {
  summaries: SummaryService;
}

export function createSummariesHttpHandlers({
  summaries,
}: CreateSummariesHttpHandlersOptions): SummariesHttpHandlers {
  return {
    async getSummaryFolder(request, reply) {
      const summary = await summaries.getSummaryFolderInfo(request.params.projectNodeId);
      await reply.send(presentNamed('summary', summary));
    },

    async listSummaryFiles(request, reply) {
      const items = await summaries.listSummaryFiles(request.params.projectNodeId);
      await reply.send(presentItems(items));
    },
  };
}
