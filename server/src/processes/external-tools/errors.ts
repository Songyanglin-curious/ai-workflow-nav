export class ExternalToolsError extends Error {
  readonly code: string;

  constructor(code: string, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'ExternalToolsError';
    this.code = code;
  }
}

export class ExternalToolConfigError extends ExternalToolsError {
  constructor(message: string, cause?: unknown) {
    super('EXTERNAL_TOOL_CONFIG_ERROR', message, cause);
    this.name = 'ExternalToolConfigError';
  }
}

export class ExternalToolResolutionError extends ExternalToolsError {
  constructor(message: string) {
    super('EXTERNAL_TOOL_RESOLUTION_ERROR', message);
    this.name = 'ExternalToolResolutionError';
  }
}

export class ExternalToolSecurityError extends ExternalToolsError {
  constructor(message: string) {
    super('EXTERNAL_TOOL_SECURITY_ERROR', message);
    this.name = 'ExternalToolSecurityError';
  }
}

export class ExternalToolActionError extends ExternalToolsError {
  constructor(message: string) {
    super('EXTERNAL_TOOL_ACTION_ERROR', message);
    this.name = 'ExternalToolActionError';
  }
}

