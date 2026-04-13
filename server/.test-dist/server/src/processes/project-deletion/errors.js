export class ProjectDeletionConfirmationRequiredError extends Error {
    code = 'PRECONDITION_FAILED';
    constructor(message) {
        super(message);
        this.name = 'ProjectDeletionConfirmationRequiredError';
    }
}
export class ProjectDeletionBlockedError extends Error {
    code = 'PRECONDITION_FAILED';
    constructor(message) {
        super(message);
        this.name = 'ProjectDeletionBlockedError';
    }
}
export class ProjectDeletionExecutionFailedError extends Error {
    code = 'INTERNAL_ERROR';
    constructor(message, cause) {
        super(message, { cause });
        this.name = 'ProjectDeletionExecutionFailedError';
    }
}
export class ProjectSummaryArchiveFailedError extends Error {
    code = 'SUMMARY_ARCHIVE_FAILED';
    constructor(message, cause) {
        super(message, { cause });
        this.name = 'ProjectSummaryArchiveFailedError';
    }
}
//# sourceMappingURL=errors.js.map