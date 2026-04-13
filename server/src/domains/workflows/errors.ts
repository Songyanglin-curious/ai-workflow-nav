export class WorkflowNotFoundError extends Error {
  readonly code = 'WORKFLOW_NOT_FOUND';

  constructor(workflowId: string) {
    super(`Workflow 不存在：${workflowId}`);
    this.name = 'WorkflowNotFoundError';
  }
}

export class WorkflowValidationFailedError extends Error {
  readonly code = 'WORKFLOW_VALIDATION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'WorkflowValidationFailedError';
  }
}
