export const errorCodes = {
  promptNotFound: 'PROMPT_NOT_FOUND',
  invalidArgument: 'INVALID_ARGUMENT',
  internalError: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes];
