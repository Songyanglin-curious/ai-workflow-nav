import { httpClient } from '../../../shared/api/index.js';

import type {
  PatchProjectNodeLayoutsRequest,
  PatchProjectViewportRequest,
  ProjectNodeLayoutItem,
  ProjectNodeLayoutsData,
  ProjectNodeLayoutsPatchData,
  ProjectViewport,
  ProjectViewportData,
} from '../../../../../shared/projects/index.js';

export async function listProjectNodeLayouts(projectId: string): Promise<ProjectNodeLayoutItem[]> {
  const response = await httpClient.get<ProjectNodeLayoutsData>({
    path: `/api/projects/${projectId}/node-layouts`,
  });

  return response.items;
}

export async function patchProjectNodeLayouts(
  projectId: string,
  body: PatchProjectNodeLayoutsRequest,
): Promise<number> {
  const response = await httpClient.patch<ProjectNodeLayoutsPatchData, PatchProjectNodeLayoutsRequest>({
    path: `/api/projects/${projectId}/node-layouts`,
    body,
  });

  return response.result.updatedCount;
}

export async function getProjectViewport(projectId: string): Promise<ProjectViewport> {
  const response = await httpClient.get<ProjectViewportData>({
    path: `/api/projects/${projectId}/viewport`,
  });

  return response.viewport;
}

export async function patchProjectViewport(
  projectId: string,
  body: PatchProjectViewportRequest,
): Promise<ProjectViewport> {
  const response = await httpClient.patch<ProjectViewportData, PatchProjectViewportRequest>({
    path: `/api/projects/${projectId}/viewport`,
    body,
  });

  return response.viewport;
}
