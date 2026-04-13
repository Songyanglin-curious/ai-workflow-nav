export const workflowErrorCodeValues = [
  'WORKFLOW_NOT_FOUND',
  'WORKFLOW_VALIDATION_FAILED',
] as const;

export type WorkflowErrorCode = (typeof workflowErrorCodeValues)[number];

export const workflowNodeActionErrorCodeValues = [
  'WORKFLOW_NODE_ACTION_NOT_FOUND',
  'WORKFLOW_NODE_ACTION_VALIDATION_FAILED',
  'WORKFLOW_NODE_ACTION_CONFLICT',
  'MERMAID_NODE_NOT_FOUND',
  'TOOL_TARGET_NOT_FOUND',
  'PROMPT_NOT_FOUND',
] as const;

export type WorkflowNodeActionErrorCode = (typeof workflowNodeActionErrorCodeValues)[number];
