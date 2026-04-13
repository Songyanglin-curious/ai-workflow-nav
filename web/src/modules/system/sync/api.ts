import { httpClient } from '../../../shared/api/index.js';

import type {
  SyncExportData,
  SyncExportRequest,
  SyncExportResult,
  SyncImportData,
  SyncImportRequest,
  SyncImportResult,
} from '../../../../../shared/imports-exports/index.js';

export async function exportSync(body: SyncExportRequest = {}): Promise<SyncExportResult> {
  const response = await httpClient.post<SyncExportData, SyncExportRequest>({
    path: '/api/sync/export',
    body,
  });

  return response.result;
}

export async function importSync(body: SyncImportRequest): Promise<SyncImportResult> {
  const response = await httpClient.post<SyncImportData, SyncImportRequest>({
    path: '/api/sync/import',
    body,
  });

  return response.result;
}
