import { httpClient } from '../../../shared/api/index.js';

import type {
  InspectionRunData,
  InspectionRunRequest,
  InspectionRunResult,
} from '../../../../../shared/inspections/index.js';

export async function runInspection(body: InspectionRunRequest = {}): Promise<InspectionRunResult> {
  const response = await httpClient.post<InspectionRunData, InspectionRunRequest>({
    path: '/api/inspections/run',
    body,
  });

  return response.result;
}
