import type {
  WorkflowActionType,
  WorkflowDetail,
  WorkflowNodeActionItem,
  WorkflowSummary,
} from '../../../../shared/workflows/index.js';

export interface WorkflowDraft {
  name: string;
  description: string;
  tags: string;
  category: string;
  mermaidSource: string;
}

export const workflowActionTypeOptions: Array<{ label: string; value: WorkflowActionType }> = [
  { label: 'Prompt', value: 'prompt' },
  { label: 'Tool', value: 'tool' },
];

export function createWorkflowDraft(): WorkflowDraft {
  return {
    name: '',
    description: '',
    tags: '',
    category: '',
    mermaidSource: '',
  };
}

export function workflowDraftFromDetail(workflow: WorkflowDetail): WorkflowDraft {
  return {
    name: workflow.name,
    description: workflow.description,
    tags: workflow.tags,
    category: workflow.category,
    mermaidSource: workflow.mermaidSource,
  };
}

export function workflowSummaryFromDetail(workflow: WorkflowDetail): WorkflowSummary {
  const { mermaidSource: _mermaidSource, ...summary } = workflow;
  return summary;
}

export function upsertWorkflowSummary(items: WorkflowSummary[], workflow: WorkflowSummary): WorkflowSummary[] {
  const index = items.findIndex((item) => item.id === workflow.id);

  if (index === -1) {
    return [workflow, ...items];
  }

  return items.map((item) => (item.id === workflow.id ? workflow : item));
}

export function selectWorkflowSummary(items: WorkflowSummary[], workflowId: string): WorkflowSummary | null {
  return items.find((item) => item.id === workflowId) ?? null;
}

export function formatWorkflowTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export type {
  WorkflowActionType,
  WorkflowDetail,
  WorkflowNodeActionItem,
  WorkflowSummary,
} from '../../../../shared/workflows/index.js';
