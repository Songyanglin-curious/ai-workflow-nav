export class DeliberationsRecordNotFoundError extends Error {
  readonly code = 'DELIBERATIONS_RECORD_NOT_FOUND';

  constructor(projectNodeId: string) {
    super(`DeliberationsRecord 不存在：${projectNodeId}`);
    this.name = 'DeliberationsRecordNotFoundError';
  }
}

export class DeliberationsValidationFailedError extends Error {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'DeliberationsValidationFailedError';
  }
}

export class DeliberationsConflictError extends Error {
  readonly code = 'CONFLICT';

  constructor(fileName: string) {
    super(`Deliberations 文件冲突：${fileName}`);
    this.name = 'DeliberationsConflictError';
  }
}
