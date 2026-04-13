export const deliberationsErrorCodeValues = [
  'PROJECT_NODE_NOT_FOUND',
  'VALIDATION_ERROR',
  'CONFLICT',
  'INTERNAL_ERROR',
] as const;

export type DeliberationsErrorCode = (typeof deliberationsErrorCodeValues)[number];
