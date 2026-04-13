import { presentSuccess } from '../presenter.js';
import type { PromptDetail, PromptSummary } from '../../domains/prompts/service.js';

export interface PromptListData {
  items: PromptSummary[];
}

export interface PromptDetailData {
  prompt: PromptDetail;
}

export interface PromptDeleteData {
  result: {
    deleted: true;
  };
}

export function presentPromptListResponse(items: PromptSummary[]): PromptListData {
  return {
    items,
  };
}

export function presentPromptDetailResponse(prompt: PromptDetail): PromptDetailData {
  return {
    prompt,
  };
}

export function presentPromptDeleteResponse(): PromptDeleteData {
  return {
    result: {
      deleted: true,
    },
  };
}

export function presentPromptListEnvelope(items: PromptSummary[]) {
  return presentSuccess(presentPromptListResponse(items));
}

export function presentPromptDetailEnvelope(prompt: PromptDetail) {
  return presentSuccess(presentPromptDetailResponse(prompt));
}

export function presentPromptDeleteEnvelope() {
  return presentSuccess(presentPromptDeleteResponse());
}
