export class ProjectNotFoundError extends Error {
    code = 'PROJECT_NOT_FOUND';
    constructor(projectId) {
        super(`Project 不存在：${projectId}`);
        this.name = 'ProjectNotFoundError';
    }
}
export class ProjectValidationFailedError extends Error {
    code = 'PROJECT_VALIDATION_FAILED';
    constructor(message) {
        super(message);
        this.name = 'ProjectValidationFailedError';
    }
}
export class ProjectFolderPathConflictError extends Error {
    code = 'PROJECT_FOLDER_PATH_CONFLICT';
    constructor(folderPath) {
        super(`Project 目录路径冲突：${folderPath}`);
        this.name = 'ProjectFolderPathConflictError';
    }
}
export class SummaryArchiveFailedError extends Error {
    code = 'SUMMARY_ARCHIVE_FAILED';
    constructor(message) {
        super(message);
        this.name = 'SummaryArchiveFailedError';
    }
}
//# sourceMappingURL=errors.js.map