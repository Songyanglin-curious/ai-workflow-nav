export class PromptNotFoundError extends Error {
  readonly code = 'PROMPT_NOT_FOUND';

  constructor(promptId: string) {
    super(`Prompt 不存在：${promptId}`);
    this.name = 'PromptNotFoundError';
  }
}

export class PromptFilePathConflictError extends Error {
  readonly code = 'PROMPT_FILE_PATH_CONFLICT';

  constructor(filePath: string) {
    super(`Prompt 正文文件路径冲突：${filePath}`);
    this.name = 'PromptFilePathConflictError';
  }
}

export class PromptValidationFailedError extends Error {
  readonly code = 'PROMPT_VALIDATION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'PromptValidationFailedError';
  }
}

export class PromptFileMissingError extends Error {
  readonly code = 'PROMPT_FILE_MISSING';

  constructor(filePath: string) {
    super(`Prompt 正文文件缺失：${filePath}`);
    this.name = 'PromptFileMissingError';
  }
}
