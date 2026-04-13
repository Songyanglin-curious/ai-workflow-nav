export class WorkflowNotFoundError extends Error {
    code = 'WORKFLOW_NOT_FOUND';
    constructor(workflowId) {
        super(`Workflow 不存在：${workflowId}`);
        this.name = 'WorkflowNotFoundError';
    }
}
export class WorkflowValidationFailedError extends Error {
    code = 'WORKFLOW_VALIDATION_FAILED';
    constructor(message) {
        super(message);
        this.name = 'WorkflowValidationFailedError';
    }
}
//# sourceMappingURL=errors.js.map