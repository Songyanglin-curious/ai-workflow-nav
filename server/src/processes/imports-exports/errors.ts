export class ImportsExportsValidationError extends Error {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'ImportsExportsValidationError';
  }
}

export class ImportsExportsInternalError extends Error {
  readonly code = 'INTERNAL_ERROR';

  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'ImportsExportsInternalError';
  }
}

