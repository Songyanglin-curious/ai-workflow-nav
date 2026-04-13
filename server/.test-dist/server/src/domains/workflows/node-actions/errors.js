export class WorkflowNodeActionNotFoundError extends Error {
    code = 'WORKFLOW_NODE_ACTION_NOT_FOUND';
    constructor(workflowId, mermaidNodeId) {
        super(`Workflow 节点动作绑定不存在：${workflowId} / ${mermaidNodeId}`);
        this.name = 'WorkflowNodeActionNotFoundError';
    }
}
export class WorkflowNodeActionValidationFailedError extends Error {
    code = 'WORKFLOW_NODE_ACTION_VALIDATION_FAILED';
    constructor(message) {
        super(message);
        this.name = 'WorkflowNodeActionValidationFailedError';
    }
}
export class WorkflowNodeActionConflictError extends Error {
    code = 'WORKFLOW_NODE_ACTION_CONFLICT';
    constructor(workflowId, mermaidNodeId) {
        super(`Workflow 节点动作绑定冲突：${workflowId} / ${mermaidNodeId}`);
        this.name = 'WorkflowNodeActionConflictError';
    }
}
export class MermaidNodeNotFoundError extends Error {
    code = 'MERMAID_NODE_NOT_FOUND';
    constructor(workflowId, mermaidNodeId) {
        super(`Workflow 中不存在 Mermaid 节点：${workflowId} / ${mermaidNodeId}`);
        this.name = 'MermaidNodeNotFoundError';
    }
}
export class ToolTargetNotFoundError extends Error {
    code = 'TOOL_TARGET_NOT_FOUND';
    constructor(toolKey) {
        super(`工具目标不存在：${toolKey}`);
        this.name = 'ToolTargetNotFoundError';
    }
}
//# sourceMappingURL=errors.js.map