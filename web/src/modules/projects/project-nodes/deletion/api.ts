import { httpClient } from '../../../../shared/api/index.js';

import type {
  ProjectNodeDeletionCheckData,
  ProjectNodeDeletionCheckResult,
  ProjectNodeDeletionExecuteData,
  ProjectNodeDeletionExecuteRequest,
  ProjectNodeDeletionExecuteResult,
} from '../../../../../../shared/project-nodes/index.js';

export async function checkProjectNodeDeletion(projectNodeId: string): Promise<ProjectNodeDeletionCheckResult> {
  const response = await httpClient.post<ProjectNodeDeletionCheckData, Record<string, never>>({
    path: `/api/project-nodes/${projectNodeId}/deletion-check`,
    body: {},
  });

  return response.result;
}

export async function executeProjectNodeDeletion(
  projectNodeId: string,
  body: ProjectNodeDeletionExecuteRequest,
): Promise<ProjectNodeDeletionExecuteResult> {
  const response = await httpClient.post<ProjectNodeDeletionExecuteData, ProjectNodeDeletionExecuteRequest>({
    path: `/api/project-nodes/${projectNodeId}/deletion-execute`,
    body,
  });

  return response.result;
}
