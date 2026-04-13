import type { FastifyInstance } from 'fastify';

import type { AppContainer } from '../app/container.js';
import { notFoundHandler } from './handlers/not-found-handler.js';
import { registerProjectRoutes } from './handlers/projects.js';
import { registerPromptRoutes } from './handlers/prompts.js';
import { registerSolutionRoutes } from './handlers/solutions.js';
import { registerSystemRoutes } from './handlers/system.js';
import { registerWorkflowRoutes } from './handlers/workflows.js';
import { registerWorkflowNodeActionRoutes } from './handlers/workflows/node-actions.js';

export async function registerHttpRoutes(app: FastifyInstance, container: AppContainer): Promise<void> {
  await registerPromptRoutes(app, {
    promptService: container.domains.prompts,
  });

  await registerWorkflowRoutes(app, {
    workflowService: container.domains.workflows,
  });

  await registerWorkflowNodeActionRoutes(app, {
    workflowNodeActionService: container.domains.workflowNodeActions,
  });

  await registerProjectRoutes(app, {
    projectService: container.domains.projects,
    projectNodeService: container.domains.projectNodes,
    deliberationsService: container.domains.deliberations,
    summaryService: container.domains.summaries,
    projectViewConfigService: container.domains.projectViewConfig,
  });

  await registerSolutionRoutes(app, {
    solutionService: container.domains.solutions,
  });

  await registerSystemRoutes(app, {
    projectDeletionService: container.processes.projectDeletion,
    projectNodeDeletionService: container.processes.projectNodeDeletion,
    workflowRuntimeActionsService: container.processes.workflowRuntimeActions,
    inspectionsProcess: container.processes.inspections,
    importsExportsProcess: container.processes.importsExports,
    startupService: container.processes.startup,
  });

  app.setNotFoundHandler(notFoundHandler);
}
