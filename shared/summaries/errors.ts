export const summariesErrorCodeValues = [
  'PROJECT_NODE_NOT_FOUND',
  'INTERNAL_ERROR',
] as const;

export type SummariesErrorCode = (typeof summariesErrorCodeValues)[number];
