export class ProjectNotFoundError extends Error {
    code = 'PROJECT_NOT_FOUND';
    constructor(projectId) {
        super(`项目不存在：${projectId}`);
        this.name = 'ProjectNotFoundError';
    }
}
export class ProjectNodeNotFoundError extends Error {
    code = 'PROJECT_NODE_NOT_FOUND';
    constructor(projectId, projectNodeId) {
        super(`项目节点不存在或不属于该项目：${projectId} / ${projectNodeId}`);
        this.name = 'ProjectNodeNotFoundError';
    }
}
export class ProjectViewportNotFoundError extends Error {
    code = 'PROJECT_VIEWPORT_NOT_FOUND';
    constructor(projectId) {
        super(`项目视角配置不存在：${projectId}`);
        this.name = 'ProjectViewportNotFoundError';
    }
}
export class ProjectViewConfigValidationFailedError extends Error {
    code = 'VALIDATION_ERROR';
    constructor(message) {
        super(message);
        this.name = 'ProjectViewConfigValidationFailedError';
    }
}
//# sourceMappingURL=errors.js.map