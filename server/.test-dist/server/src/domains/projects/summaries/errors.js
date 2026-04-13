export class SummaryRecordNotFoundError extends Error {
    code = 'SUMMARY_RECORD_NOT_FOUND';
    constructor(projectNodeId) {
        super(`SummaryRecord 不存在：${projectNodeId}`);
        this.name = 'SummaryRecordNotFoundError';
    }
}
//# sourceMappingURL=errors.js.map