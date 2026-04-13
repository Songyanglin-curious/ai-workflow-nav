import type { PromptSummary } from '../../../../../shared/prompts/index.js';
import type {
  WorkflowActionType,
  WorkflowNodeActionItem,
  WorkflowNodeActionSyncResult,
} from '../../../../../shared/workflows/index.js';

export interface NodeActionDraft {
  mermaidNodeId: string;
  actionType: WorkflowActionType;
  targetRef: string;
}

export type NodeActionEditorMode = 'create' | 'edit';

export interface PromptTargetOption {
  value: string;
  label: string;
  description: string;
}

export const nodeActionTypeOptions: Array<{ label: string; value: WorkflowActionType }> = [
  { label: 'Prompt', value: 'prompt' },
  { label: 'Tool', value: 'tool' },
];

export function createNodeActionDraft(): NodeActionDraft {
  return {
    mermaidNodeId: '',
    actionType: 'prompt',
    targetRef: '',
  };
}

export function toNodeActionDraft(nodeAction: WorkflowNodeActionItem): NodeActionDraft {
  return {
    mermaidNodeId: nodeAction.mermaidNodeId,
    actionType: nodeAction.actionType,
    targetRef: nodeAction.targetRef,
  };
}

export function toPromptTargetOptions(items: PromptSummary[]): PromptTargetOption[] {
  return items.map((item) => ({
    value: item.id,
    label: item.name,
    description: item.category || '未分类',
  }));
}

export function extractMermaidNodeIds(source: string): string[] {
  const matches = source.matchAll(/\b([A-Za-z][A-Za-z0-9_-]*)\s*(?=[\[\(\{])/g);

  return [...new Set(Array.from(matches, (match) => match[1]))];
}

export function formatNodeActionTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export type { WorkflowActionType, WorkflowNodeActionItem, WorkflowNodeActionSyncResult };
