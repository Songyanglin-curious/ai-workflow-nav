import { presentNamedData, presentResult } from '../presenter.js';
export function presentInspectionRunEnvelope(result) {
    return presentResult(result);
}
export function presentSyncExportEnvelope(result) {
    return presentResult(result);
}
export function presentSyncImportEnvelope(result) {
    return presentResult(result);
}
export function presentStartupReportEnvelope(report) {
    return presentNamedData('report', report);
}
export function presentSelfCheckEnvelope(result) {
    return presentResult(result);
}
//# sourceMappingURL=system.js.map