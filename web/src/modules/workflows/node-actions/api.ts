import type {
  CreateWorkflowNodeActionRequest,
  UpdateWorkflowNodeActionRequest,
  WorkflowNodeActionDeleteData,
  WorkflowNodeActionItem,
  WorkflowNodeActionData,
  WorkflowNodeActionListData,
  WorkflowNodeActionSyncData,
  WorkflowNodeActionSyncResult,
} from '../../../../../shared/workflows/index.js';

import { httpClient } from '../../../shared/api/index.js';

export async function listNodeActions(workflowId: string): Promise<WorkflowNodeActionItem[]> {
  const response = await httpClient.get<WorkflowNodeActionListData>({
    path: `/api/workflows/${workflowId}/node-actions`,
  });

  return response.items;
}

export async function createNodeAction(
  workflowId: string,
  body: CreateWorkflowNodeActionRequest,
): Promise<WorkflowNodeActionItem> {
  const response = await httpClient.post<WorkflowNodeActionData, CreateWorkflowNodeActionRequest>({
    path: `/api/workflows/${workflowId}/node-actions`,
    body,
  });

  return response.nodeAction;
}

export async function updateNodeAction(
  workflowId: string,
  mermaidNodeId: string,
  body: UpdateWorkflowNodeActionRequest,
): Promise<WorkflowNodeActionItem> {
  const response = await httpClient.patch<WorkflowNodeActionData, UpdateWorkflowNodeActionRequest>({
    path: `/api/workflows/${workflowId}/node-actions/${encodeURIComponent(mermaidNodeId)}`,
    body,
  });

  return response.nodeAction;
}

export async function deleteNodeAction(workflowId: string, mermaidNodeId: string): Promise<boolean> {
  const response = await httpClient.delete<WorkflowNodeActionDeleteData>({
    path: `/api/workflows/${workflowId}/node-actions/${encodeURIComponent(mermaidNodeId)}`,
  });

  return response.result.deleted;
}

export async function syncNodeActions(workflowId: string): Promise<WorkflowNodeActionSyncResult> {
  const response = await httpClient.post<WorkflowNodeActionSyncData, Record<string, never>>({
    path: `/api/workflows/${workflowId}/node-actions/sync`,
    body: {},
  });

  return response.result;
}
