export class DeliberationsRecordNotFoundError extends Error {
    code = 'DELIBERATIONS_RECORD_NOT_FOUND';
    constructor(projectNodeId) {
        super(`DeliberationsRecord 不存在：${projectNodeId}`);
        this.name = 'DeliberationsRecordNotFoundError';
    }
}
export class DeliberationsValidationFailedError extends Error {
    code = 'VALIDATION_ERROR';
    constructor(message) {
        super(message);
        this.name = 'DeliberationsValidationFailedError';
    }
}
export class DeliberationsConflictError extends Error {
    code = 'CONFLICT';
    constructor(fileName) {
        super(`Deliberations 文件冲突：${fileName}`);
        this.name = 'DeliberationsConflictError';
    }
}
//# sourceMappingURL=errors.js.map