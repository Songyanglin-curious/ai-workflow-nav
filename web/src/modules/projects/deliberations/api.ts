import { httpClient } from '../../../shared/api/index.js';

import type {
  AppendLatestDeliberationsData,
  AppendLatestDeliberationsRequest,
  AppendLatestDeliberationsResult,
  CreateDeliberationsFileData,
  CreateDeliberationsFileRequest,
  CreateDeliberationsFileResult,
  DeliberationsRecordFileItem,
  DeliberationsRecordFilesData,
  DeliberationsRecordFolderData,
  DeliberationsRecordFolderInfo,
} from '../../../../../shared/deliberations/index.js';

export async function getDeliberationsRecordFolderInfo(projectNodeId: string): Promise<DeliberationsRecordFolderInfo> {
  const response = await httpClient.get<DeliberationsRecordFolderData>({
    path: `/api/project-nodes/${projectNodeId}/deliberations-records`,
  });

  return response.deliberationsRecord;
}

export async function listDeliberationsRecordFiles(projectNodeId: string): Promise<DeliberationsRecordFileItem[]> {
  const response = await httpClient.get<DeliberationsRecordFilesData>({
    path: `/api/project-nodes/${projectNodeId}/deliberations-records/files`,
  });

  return response.items;
}

export async function appendLatestDeliberations(
  projectNodeId: string,
  body: AppendLatestDeliberationsRequest,
): Promise<AppendLatestDeliberationsResult> {
  const response = await httpClient.post<AppendLatestDeliberationsData, AppendLatestDeliberationsRequest>({
    path: `/api/project-nodes/${projectNodeId}/deliberations-records/append-latest`,
    body,
  });

  return response.result;
}

export async function createDeliberationsFile(
  projectNodeId: string,
  body: CreateDeliberationsFileRequest,
): Promise<CreateDeliberationsFileResult> {
  const response = await httpClient.post<CreateDeliberationsFileData, CreateDeliberationsFileRequest>({
    path: `/api/project-nodes/${projectNodeId}/deliberations-records/files`,
    body,
  });

  return response.result;
}
