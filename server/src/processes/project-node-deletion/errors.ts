export class ProjectNodeDeletionConfirmationRequiredError extends Error {
  readonly code = 'PRECONDITION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'ProjectNodeDeletionConfirmationRequiredError';
  }
}

export class ProjectNodeDeletionBlockedError extends Error {
  readonly code = 'PRECONDITION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'ProjectNodeDeletionBlockedError';
  }
}

export class ProjectNodeDeletionExecutionFailedError extends Error {
  readonly code = 'INTERNAL_ERROR';

  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'ProjectNodeDeletionExecutionFailedError';
  }
}

export class ProjectNodeSummaryArchiveFailedError extends Error {
  readonly code = 'SUMMARY_ARCHIVE_FAILED';

  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'ProjectNodeSummaryArchiveFailedError';
  }
}
