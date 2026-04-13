import { httpClient } from '../../shared/api/index.js';

import type {
  CreateProjectRequest,
  ProjectDetail,
  ProjectDetailData,
  ProjectListData,
  ProjectListQuery,
  ProjectSummary,
  UpdateProjectRequest,
} from '../../../../shared/projects/index.js';

export async function listProjects(query: ProjectListQuery = {}): Promise<ProjectSummary[]> {
  const response = await httpClient.get<ProjectListData>({
    path: '/api/projects',
    query,
  });

  return response.items;
}

export async function getProject(projectId: string): Promise<ProjectDetail> {
  const response = await httpClient.get<ProjectDetailData>({
    path: `/api/projects/${projectId}`,
  });

  return response.project;
}

export async function createProject(body: CreateProjectRequest): Promise<ProjectDetail> {
  const response = await httpClient.post<ProjectDetailData, CreateProjectRequest>({
    path: '/api/projects',
    body,
  });

  return response.project;
}

export async function updateProject(projectId: string, body: UpdateProjectRequest): Promise<ProjectDetail> {
  const response = await httpClient.patch<ProjectDetailData, UpdateProjectRequest>({
    path: `/api/projects/${projectId}`,
    body,
  });

  return response.project;
}
