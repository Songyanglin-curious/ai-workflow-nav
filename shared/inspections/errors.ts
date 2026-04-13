export const inspectionsErrorCodeValues = [
  'VALIDATION_ERROR',
  'INTERNAL_ERROR',
] as const;

export type InspectionsErrorCode = (typeof inspectionsErrorCodeValues)[number];
