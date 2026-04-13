import { httpClient } from '../../../shared/api/index.js';

import type {
  SummaryFileItem,
  SummaryFilesData,
  SummaryFolderData,
  SummaryFolderInfo,
} from '../../../../../shared/summaries/index.js';

export async function getSummaryFolderInfo(projectNodeId: string): Promise<SummaryFolderInfo> {
  const response = await httpClient.get<SummaryFolderData>({
    path: `/api/project-nodes/${projectNodeId}/summaries`,
  });

  return response.summary;
}

export async function listSummaryFiles(projectNodeId: string): Promise<SummaryFileItem[]> {
  const response = await httpClient.get<SummaryFilesData>({
    path: `/api/project-nodes/${projectNodeId}/summaries/files`,
  });

  return response.items;
}
