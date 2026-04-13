export class ProjectNodeNotFoundError extends Error {
  readonly code = 'PROJECT_NODE_NOT_FOUND';

  constructor(projectNodeId: string) {
    super(`ProjectNode 不存在：${projectNodeId}`);
    this.name = 'ProjectNodeNotFoundError';
  }
}

export class ParentProjectNodeNotFoundError extends Error {
  readonly code = 'PARENT_PROJECT_NODE_NOT_FOUND';

  constructor(projectNodeId: string) {
    super(`父 ProjectNode 不存在：${projectNodeId}`);
    this.name = 'ParentProjectNodeNotFoundError';
  }
}

export class ProjectNodeCycleDetectedError extends Error {
  readonly code = 'PROJECT_NODE_CYCLE_DETECTED';

  constructor(projectNodeId: string, parentNodeId: string) {
    super(`ProjectNode 结构形成循环：${projectNodeId} -> ${parentNodeId}`);
    this.name = 'ProjectNodeCycleDetectedError';
  }
}

export class ProjectNodeWorkflowNotFoundError extends Error {
  readonly code = 'PROJECT_NODE_WORKFLOW_NOT_FOUND';

  constructor(projectNodeId: string) {
    super(`ProjectNode 未绑定 Workflow：${projectNodeId}`);
    this.name = 'ProjectNodeWorkflowNotFoundError';
  }
}

export class ProjectNodeValidationFailedError extends Error {
  readonly code = 'PROJECT_NODE_VALIDATION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'ProjectNodeValidationFailedError';
  }
}
