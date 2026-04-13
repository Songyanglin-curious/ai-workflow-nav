import { httpClient } from '../../../../shared/api/index.js';

import type {
  WorkflowRuntimeNodeDetail,
  WorkflowRuntimeNodeDetailData,
  WorkflowRuntimeTriggerData,
  WorkflowRuntimeTriggerRequest,
  WorkflowRuntimeTriggerResult,
} from '../../../../../../shared/workflows/index.js';

export async function getWorkflowRuntimeNodeDetail(
  projectNodeId: string,
  mermaidNodeId: string,
): Promise<WorkflowRuntimeNodeDetail> {
  const response = await httpClient.get<WorkflowRuntimeNodeDetailData>({
    path: `/api/project-nodes/${projectNodeId}/workflow-runtime/nodes/${encodeURIComponent(mermaidNodeId)}`,
  });

  return response.result;
}

export async function triggerWorkflowRuntimeNodeAction(
  projectNodeId: string,
  mermaidNodeId: string,
): Promise<WorkflowRuntimeTriggerResult> {
  const response = await httpClient.post<WorkflowRuntimeTriggerData, WorkflowRuntimeTriggerRequest>({
    path: `/api/project-nodes/${projectNodeId}/workflow-runtime/nodes/${encodeURIComponent(mermaidNodeId)}/trigger`,
    body: {},
  });

  return response.result;
}
