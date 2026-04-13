import { httpClient } from '../../../shared/api/index.js';

import type {
  SelfCheckData,
  SelfCheckRequest,
  SelfCheckResult,
  StartupReport,
  StartupReportData,
} from '../../../../../shared/startup/index.js';

export async function getStartupReport(): Promise<StartupReport> {
  const response = await httpClient.get<StartupReportData>({
    path: '/api/system/startup-report',
  });

  return response.report;
}

export async function runSelfCheck(body: SelfCheckRequest = {}): Promise<SelfCheckResult> {
  const response = await httpClient.post<SelfCheckData, SelfCheckRequest>({
    path: '/api/system/self-check',
    body,
  });

  return response.result;
}
