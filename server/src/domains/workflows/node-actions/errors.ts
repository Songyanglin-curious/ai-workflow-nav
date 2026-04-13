export class WorkflowNodeActionNotFoundError extends Error {
  readonly code = 'WORKFLOW_NODE_ACTION_NOT_FOUND';

  constructor(workflowId: string, mermaidNodeId: string) {
    super(`Workflow 节点动作绑定不存在：${workflowId} / ${mermaidNodeId}`);
    this.name = 'WorkflowNodeActionNotFoundError';
  }
}

export class WorkflowNodeActionValidationFailedError extends Error {
  readonly code = 'WORKFLOW_NODE_ACTION_VALIDATION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'WorkflowNodeActionValidationFailedError';
  }
}

export class WorkflowNodeActionConflictError extends Error {
  readonly code = 'WORKFLOW_NODE_ACTION_CONFLICT';

  constructor(workflowId: string, mermaidNodeId: string) {
    super(`Workflow 节点动作绑定冲突：${workflowId} / ${mermaidNodeId}`);
    this.name = 'WorkflowNodeActionConflictError';
  }
}

export class MermaidNodeNotFoundError extends Error {
  readonly code = 'MERMAID_NODE_NOT_FOUND';

  constructor(workflowId: string, mermaidNodeId: string) {
    super(`Workflow 中不存在 Mermaid 节点：${workflowId} / ${mermaidNodeId}`);
    this.name = 'MermaidNodeNotFoundError';
  }
}

export class ToolTargetNotFoundError extends Error {
  readonly code = 'TOOL_TARGET_NOT_FOUND';

  constructor(toolKey: string) {
    super(`工具目标不存在：${toolKey}`);
    this.name = 'ToolTargetNotFoundError';
  }
}
