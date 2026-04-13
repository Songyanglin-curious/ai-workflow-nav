export const importsExportsErrorCodeValues = [
  'VALIDATION_ERROR',
  'INTERNAL_ERROR',
] as const;

export type ImportsExportsErrorCode = (typeof importsExportsErrorCodeValues)[number];
