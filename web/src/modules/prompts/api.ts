import { httpClient } from '../../shared/api';

import type {
  CreatePromptRequest,
  PromptDeleteData,
  PromptDetail,
  PromptDetailData,
  PromptListData,
  PromptListQuery,
  PromptSummary,
  UpdatePromptRequest,
} from '../../../../shared/prompts';

export async function listPrompts(query: PromptListQuery = {}): Promise<PromptSummary[]> {
  const data = await httpClient.get<PromptListData>({
    path: '/api/prompts',
    query,
  });

  return data.items;
}

export async function getPrompt(promptId: string): Promise<PromptDetail> {
  const data = await httpClient.get<PromptDetailData>({
    path: `/api/prompts/${promptId}`,
  });

  return data.prompt;
}

export async function createPrompt(body: CreatePromptRequest): Promise<PromptDetail> {
  const data = await httpClient.post<PromptDetailData, CreatePromptRequest>({
    path: '/api/prompts',
    body,
  });

  return data.prompt;
}

export async function updatePrompt(promptId: string, body: UpdatePromptRequest): Promise<PromptDetail> {
  const data = await httpClient.patch<PromptDetailData, UpdatePromptRequest>({
    path: `/api/prompts/${promptId}`,
    body,
  });

  return data.prompt;
}

export async function deletePrompt(promptId: string): Promise<true> {
  const data = await httpClient.delete<PromptDeleteData>({
    path: `/api/prompts/${promptId}`,
  });

  return data.result.deleted;
}
