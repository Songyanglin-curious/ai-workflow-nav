export class ProjectNodeNotFoundError extends Error {
    code = 'PROJECT_NODE_NOT_FOUND';
    constructor(projectNodeId) {
        super(`ProjectNode 不存在：${projectNodeId}`);
        this.name = 'ProjectNodeNotFoundError';
    }
}
export class ParentProjectNodeNotFoundError extends Error {
    code = 'PARENT_PROJECT_NODE_NOT_FOUND';
    constructor(projectNodeId) {
        super(`父 ProjectNode 不存在：${projectNodeId}`);
        this.name = 'ParentProjectNodeNotFoundError';
    }
}
export class ProjectNodeCycleDetectedError extends Error {
    code = 'PROJECT_NODE_CYCLE_DETECTED';
    constructor(projectNodeId, parentNodeId) {
        super(`ProjectNode 结构形成循环：${projectNodeId} -> ${parentNodeId}`);
        this.name = 'ProjectNodeCycleDetectedError';
    }
}
export class ProjectNodeWorkflowNotFoundError extends Error {
    code = 'PROJECT_NODE_WORKFLOW_NOT_FOUND';
    constructor(projectNodeId) {
        super(`ProjectNode 未绑定 Workflow：${projectNodeId}`);
        this.name = 'ProjectNodeWorkflowNotFoundError';
    }
}
export class ProjectNodeValidationFailedError extends Error {
    code = 'PROJECT_NODE_VALIDATION_FAILED';
    constructor(message) {
        super(message);
        this.name = 'ProjectNodeValidationFailedError';
    }
}
//# sourceMappingURL=errors.js.map