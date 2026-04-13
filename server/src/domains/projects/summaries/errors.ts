export class SummaryRecordNotFoundError extends Error {
  readonly code = 'SUMMARY_RECORD_NOT_FOUND';

  constructor(projectNodeId: string) {
    super(`SummaryRecord 不存在：${projectNodeId}`);
    this.name = 'SummaryRecordNotFoundError';
  }
}
