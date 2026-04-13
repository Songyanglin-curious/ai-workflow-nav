export class ProjectNodeDeletionConfirmationRequiredError extends Error {
    code = 'PRECONDITION_FAILED';
    constructor(message) {
        super(message);
        this.name = 'ProjectNodeDeletionConfirmationRequiredError';
    }
}
export class ProjectNodeDeletionBlockedError extends Error {
    code = 'PRECONDITION_FAILED';
    constructor(message) {
        super(message);
        this.name = 'ProjectNodeDeletionBlockedError';
    }
}
export class ProjectNodeDeletionExecutionFailedError extends Error {
    code = 'INTERNAL_ERROR';
    constructor(message, cause) {
        super(message, { cause });
        this.name = 'ProjectNodeDeletionExecutionFailedError';
    }
}
export class ProjectNodeSummaryArchiveFailedError extends Error {
    code = 'SUMMARY_ARCHIVE_FAILED';
    constructor(message, cause) {
        super(message, { cause });
        this.name = 'ProjectNodeSummaryArchiveFailedError';
    }
}
//# sourceMappingURL=errors.js.map