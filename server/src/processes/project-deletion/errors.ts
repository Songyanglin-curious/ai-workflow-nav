export class ProjectDeletionConfirmationRequiredError extends Error {
  readonly code = 'PRECONDITION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'ProjectDeletionConfirmationRequiredError';
  }
}

export class ProjectDeletionBlockedError extends Error {
  readonly code = 'PRECONDITION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'ProjectDeletionBlockedError';
  }
}

export class ProjectDeletionExecutionFailedError extends Error {
  readonly code = 'INTERNAL_ERROR';

  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'ProjectDeletionExecutionFailedError';
  }
}

export class ProjectSummaryArchiveFailedError extends Error {
  readonly code = 'SUMMARY_ARCHIVE_FAILED';

  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'ProjectSummaryArchiveFailedError';
  }
}
