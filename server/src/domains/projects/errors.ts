export class ProjectNotFoundError extends Error {
  readonly code = 'PROJECT_NOT_FOUND';

  constructor(projectId: string) {
    super(`Project 不存在：${projectId}`);
    this.name = 'ProjectNotFoundError';
  }
}

export class ProjectValidationFailedError extends Error {
  readonly code = 'PROJECT_VALIDATION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'ProjectValidationFailedError';
  }
}

export class ProjectFolderPathConflictError extends Error {
  readonly code = 'PROJECT_FOLDER_PATH_CONFLICT';

  constructor(folderPath: string) {
    super(`Project 目录路径冲突：${folderPath}`);
    this.name = 'ProjectFolderPathConflictError';
  }
}

export class SummaryArchiveFailedError extends Error {
  readonly code = 'SUMMARY_ARCHIVE_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'SummaryArchiveFailedError';
  }
}
