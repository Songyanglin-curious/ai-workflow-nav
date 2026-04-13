import { httpClient } from '../../shared/api/index.js';

import type {
  BindSolutionProjectRequest,
  CreateSolutionRequest,
  PatchSolutionProjectRequest,
  ProjectSolutionItem,
  ProjectSolutionsData,
  SolutionDeleteData,
  SolutionDetail,
  SolutionDetailData,
  SolutionListData,
  SolutionListQuery,
  SolutionProjectItem,
  SolutionProjectsData,
  SolutionSummary,
  UpdateSolutionRequest,
} from '../../../../shared/projects/index.js';

export async function listSolutions(query: SolutionListQuery = {}): Promise<SolutionSummary[]> {
  const response = await httpClient.get<SolutionListData>({
    path: '/api/solutions',
    query,
  });

  return response.items;
}

export async function getSolution(solutionId: string): Promise<SolutionDetail> {
  const response = await httpClient.get<SolutionDetailData>({
    path: `/api/solutions/${solutionId}`,
  });

  return response.solution;
}

export async function createSolution(body: CreateSolutionRequest): Promise<SolutionDetail> {
  const response = await httpClient.post<SolutionDetailData, CreateSolutionRequest>({
    path: '/api/solutions',
    body,
  });

  return response.solution;
}

export async function updateSolution(solutionId: string, body: UpdateSolutionRequest): Promise<SolutionDetail> {
  const response = await httpClient.patch<SolutionDetailData, UpdateSolutionRequest>({
    path: `/api/solutions/${solutionId}`,
    body,
  });

  return response.solution;
}

export async function deleteSolution(solutionId: string): Promise<true> {
  const response = await httpClient.delete<SolutionDeleteData>({
    path: `/api/solutions/${solutionId}`,
  });

  return response.result.deleted;
}

export async function listSolutionProjects(solutionId: string): Promise<SolutionProjectItem[]> {
  const response = await httpClient.get<SolutionProjectsData>({
    path: `/api/solutions/${solutionId}/projects`,
  });

  return response.items;
}

export async function bindSolutionProject(
  solutionId: string,
  body: BindSolutionProjectRequest,
): Promise<SolutionProjectItem> {
  const response = await httpClient.post<SolutionProjectsData, BindSolutionProjectRequest>({
    path: `/api/solutions/${solutionId}/projects`,
    body,
  });

  return response.items[0] as SolutionProjectItem;
}

export async function patchSolutionProject(
  solutionId: string,
  projectId: string,
  body: PatchSolutionProjectRequest,
): Promise<SolutionProjectItem> {
  const response = await httpClient.patch<SolutionProjectsData, PatchSolutionProjectRequest>({
    path: `/api/solutions/${solutionId}/projects/${projectId}`,
    body,
  });

  return response.items[0] as SolutionProjectItem;
}

export async function deleteSolutionProject(solutionId: string, projectId: string): Promise<true> {
  const response = await httpClient.delete<SolutionDeleteData>({
    path: `/api/solutions/${solutionId}/projects/${projectId}`,
  });

  return response.result.deleted;
}

export async function listProjectSolutions(projectId: string): Promise<ProjectSolutionItem[]> {
  const response = await httpClient.get<ProjectSolutionsData>({
    path: `/api/projects/${projectId}/solutions`,
  });

  return response.items;
}
