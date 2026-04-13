export const startupErrorCodeValues = ['INTERNAL_ERROR'] as const;

export type StartupErrorCode = (typeof startupErrorCodeValues)[number];
