export class SolutionNotFoundError extends Error {
    code = 'SOLUTION_NOT_FOUND';
    constructor(solutionId) {
        super(`Solution 不存在：${solutionId}`);
        this.name = 'SolutionNotFoundError';
    }
}
export class SolutionValidationFailedError extends Error {
    code = 'SOLUTION_VALIDATION_FAILED';
    constructor(message) {
        super(message);
        this.name = 'SolutionValidationFailedError';
    }
}
export class SolutionProjectBindingNotFoundError extends Error {
    code = 'SOLUTION_PROJECT_BINDING_NOT_FOUND';
    constructor(solutionId, projectId) {
        super(`Solution 项目绑定不存在：${solutionId} / ${projectId}`);
        this.name = 'SolutionProjectBindingNotFoundError';
    }
}
export class ProjectNotFoundError extends Error {
    code = 'PROJECT_NOT_FOUND';
    constructor(projectId) {
        super(`Project 不存在：${projectId}`);
        this.name = 'ProjectNotFoundError';
    }
}
export class SolutionConflictError extends Error {
    code = 'CONFLICT';
    constructor(solutionId, projectId) {
        super(`Solution 项目绑定冲突：${solutionId} / ${projectId}`);
        this.name = 'SolutionConflictError';
    }
}
//# sourceMappingURL=errors.js.map