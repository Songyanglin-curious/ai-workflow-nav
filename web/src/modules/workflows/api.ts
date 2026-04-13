import { httpClient } from '../../shared/api/index.js';
import type {
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  WorkflowDeleteData,
  WorkflowDetail,
  WorkflowDetailData,
  WorkflowListData,
  WorkflowListQuery,
  WorkflowSummary,
} from '../../../../shared/workflows/index.js';

export async function listWorkflows(query?: WorkflowListQuery): Promise<WorkflowSummary[]> {
  const response = await httpClient.get<WorkflowListData>({
    path: '/api/workflows',
    query,
  });

  return response.items;
}

export async function getWorkflow(workflowId: string): Promise<WorkflowDetail> {
  const response = await httpClient.get<WorkflowDetailData>({
    path: `/api/workflows/${workflowId}`,
  });

  return response.workflow;
}

export async function createWorkflow(body: CreateWorkflowRequest): Promise<WorkflowDetail> {
  const response = await httpClient.post<WorkflowDetailData, CreateWorkflowRequest>({
    path: '/api/workflows',
    body,
  });

  return response.workflow;
}

export async function updateWorkflow(workflowId: string, body: UpdateWorkflowRequest): Promise<WorkflowDetail> {
  const response = await httpClient.patch<WorkflowDetailData, UpdateWorkflowRequest>({
    path: `/api/workflows/${workflowId}`,
    body,
  });

  return response.workflow;
}

export async function deleteWorkflow(workflowId: string): Promise<WorkflowDeleteData['result']> {
  const response = await httpClient.delete<WorkflowDeleteData>({
    path: `/api/workflows/${workflowId}`,
  });

  return response.result;
}
