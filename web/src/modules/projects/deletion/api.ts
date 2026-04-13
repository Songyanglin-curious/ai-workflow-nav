import { httpClient } from '../../../shared/api/index.js';

import type {
  ProjectDeletionCheckData,
  ProjectDeletionCheckResult,
  ProjectDeletionExecuteData,
  ProjectDeletionExecuteRequest,
  ProjectDeletionExecuteResult,
} from '../../../../../shared/projects/index.js';

export async function checkProjectDeletion(projectId: string): Promise<ProjectDeletionCheckResult> {
  const response = await httpClient.post<ProjectDeletionCheckData, Record<string, never>>({
    path: `/api/projects/${projectId}/deletion-check`,
    body: {},
  });

  return response.result;
}

export async function executeProjectDeletion(
  projectId: string,
  body: ProjectDeletionExecuteRequest,
): Promise<ProjectDeletionExecuteResult> {
  const response = await httpClient.post<ProjectDeletionExecuteData, ProjectDeletionExecuteRequest>({
    path: `/api/projects/${projectId}/deletion-execute`,
    body,
  });

  return response.result;
}
