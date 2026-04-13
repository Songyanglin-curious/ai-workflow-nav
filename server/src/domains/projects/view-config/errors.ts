export class ProjectNotFoundError extends Error {
  readonly code = 'PROJECT_NOT_FOUND';

  constructor(projectId: string) {
    super(`项目不存在：${projectId}`);
    this.name = 'ProjectNotFoundError';
  }
}

export class ProjectNodeNotFoundError extends Error {
  readonly code = 'PROJECT_NODE_NOT_FOUND';

  constructor(projectId: string, projectNodeId: string) {
    super(`项目节点不存在或不属于该项目：${projectId} / ${projectNodeId}`);
    this.name = 'ProjectNodeNotFoundError';
  }
}

export class ProjectViewportNotFoundError extends Error {
  readonly code = 'PROJECT_VIEWPORT_NOT_FOUND';

  constructor(projectId: string) {
    super(`项目视角配置不存在：${projectId}`);
    this.name = 'ProjectViewportNotFoundError';
  }
}

export class ProjectViewConfigValidationFailedError extends Error {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'ProjectViewConfigValidationFailedError';
  }
}
