export class SolutionNotFoundError extends Error {
  readonly code = 'SOLUTION_NOT_FOUND';

  constructor(solutionId: string) {
    super(`Solution 不存在：${solutionId}`);
    this.name = 'SolutionNotFoundError';
  }
}

export class SolutionValidationFailedError extends Error {
  readonly code = 'SOLUTION_VALIDATION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'SolutionValidationFailedError';
  }
}

export class SolutionProjectBindingNotFoundError extends Error {
  readonly code = 'SOLUTION_PROJECT_BINDING_NOT_FOUND';

  constructor(solutionId: string, projectId: string) {
    super(`Solution 项目绑定不存在：${solutionId} / ${projectId}`);
    this.name = 'SolutionProjectBindingNotFoundError';
  }
}

export class ProjectNotFoundError extends Error {
  readonly code = 'PROJECT_NOT_FOUND';

  constructor(projectId: string) {
    super(`Project 不存在：${projectId}`);
    this.name = 'ProjectNotFoundError';
  }
}

export class SolutionConflictError extends Error {
  readonly code = 'CONFLICT';

  constructor(solutionId: string, projectId: string) {
    super(`Solution 项目绑定冲突：${solutionId} / ${projectId}`);
    this.name = 'SolutionConflictError';
  }
}
