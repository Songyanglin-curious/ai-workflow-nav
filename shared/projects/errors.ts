export const projectErrorCodeValues = [
  'PROJECT_NOT_FOUND',
  'PROJECT_VALIDATION_FAILED',
  'PROJECT_FOLDER_PATH_CONFLICT',
  'SUMMARY_ARCHIVE_FAILED',
] as const;

export type ProjectErrorCode = (typeof projectErrorCodeValues)[number];

export const solutionErrorCodeValues = [
  'SOLUTION_NOT_FOUND',
  'SOLUTION_VALIDATION_FAILED',
  'SOLUTION_PROJECT_BINDING_NOT_FOUND',
] as const;

export type SolutionErrorCode = (typeof solutionErrorCodeValues)[number];

export const projectViewConfigErrorCodeValues = [
  'PROJECT_VIEWPORT_NOT_FOUND',
  'PROJECT_NODE_NOT_FOUND',
] as const;

export type ProjectViewConfigErrorCode = (typeof projectViewConfigErrorCodeValues)[number];
