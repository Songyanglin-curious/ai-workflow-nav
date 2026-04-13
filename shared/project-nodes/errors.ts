export const projectNodeErrorCodeValues = [
  'PROJECT_NODE_NOT_FOUND',
  'PARENT_PROJECT_NODE_NOT_FOUND',
  'PROJECT_NODE_CYCLE_DETECTED',
  'PROJECT_NODE_WORKFLOW_NOT_FOUND',
] as const;

export type ProjectNodeErrorCode = (typeof projectNodeErrorCodeValues)[number];
