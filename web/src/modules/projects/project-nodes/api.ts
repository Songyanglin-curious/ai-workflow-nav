import { httpClient } from '../../../shared/api/index.js';

import type {
  CreateProjectNodeRequest,
  ProjectNodeDetail,
  ProjectNodeDetailData,
  ProjectNodesListData,
  ProjectNodesListQuery,
  ProjectNodeSummary,
  UpdateProjectNodeRequest,
} from '../../../../../shared/project-nodes/index.js';

export async function listProjectNodes(
  projectId: string,
  query: ProjectNodesListQuery = {},
): Promise<ProjectNodeSummary[]> {
  const response = await httpClient.get<ProjectNodesListData>({
    path: `/api/projects/${projectId}/nodes`,
    query,
  });

  return response.items;
}

export async function getProjectNode(projectNodeId: string): Promise<ProjectNodeDetail> {
  const response = await httpClient.get<ProjectNodeDetailData>({
    path: `/api/project-nodes/${projectNodeId}`,
  });

  return response.projectNode;
}

export async function createProjectNode(
  projectId: string,
  body: CreateProjectNodeRequest,
): Promise<ProjectNodeDetail> {
  const response = await httpClient.post<ProjectNodeDetailData, CreateProjectNodeRequest>({
    path: `/api/projects/${projectId}/nodes`,
    body,
  });

  return response.projectNode;
}

export async function updateProjectNode(
  projectNodeId: string,
  body: UpdateProjectNodeRequest,
): Promise<ProjectNodeDetail> {
  const response = await httpClient.patch<ProjectNodeDetailData, UpdateProjectNodeRequest>({
    path: `/api/project-nodes/${projectNodeId}`,
    body,
  });

  return response.projectNode;
}
