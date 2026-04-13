import { presentNamedData, presentResult } from '../presenter.js';
import type { InspectionRunResult } from '../../processes/inspections/service.js';
import type {
  SyncExportResult,
  SyncImportResult,
} from '../../processes/imports-exports/service.js';
import type {
  SelfCheckResult,
  StartupReport,
} from '../../processes/startup/types.js';

export function presentInspectionRunEnvelope(result: InspectionRunResult) {
  return presentResult(result);
}

export function presentSyncExportEnvelope(result: SyncExportResult) {
  return presentResult(result);
}

export function presentSyncImportEnvelope(result: SyncImportResult) {
  return presentResult(result);
}

export function presentStartupReportEnvelope(report: StartupReport) {
  return presentNamedData('report', report);
}

export function presentSelfCheckEnvelope(result: SelfCheckResult) {
  return presentResult(result);
}
