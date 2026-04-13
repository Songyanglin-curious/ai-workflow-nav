export const promptErrorCodeValues = [
  'PROMPT_NOT_FOUND',
  'PROMPT_FILE_PATH_CONFLICT',
  'PROMPT_VALIDATION_FAILED',
  'PROMPT_FILE_MISSING',
] as const;

export type PromptErrorCode = (typeof promptErrorCodeValues)[number];
