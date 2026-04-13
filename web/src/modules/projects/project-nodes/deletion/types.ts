import type {
  ProjectNodeDeletionCheckResult,
  ProjectNodeDeletionExecuteRequest,
  ProjectNodeDeletionExecuteResult,
} from '../../../../../../shared/project-nodes/index.js';
import type { DeletionStrategy } from '../../../../../../shared/projects/index.js';

export interface ProjectNodeDeletionDraft {
  strategy: DeletionStrategy;
  confirmDelete: boolean;
  secondConfirmation: boolean;
}

export const deletionStrategyLabels: Record<DeletionStrategy, string> = {
  archive_then_delete: '先转存总结再删除',
  direct_delete: '直接删除',
};

export function createProjectNodeDeletionDraft(
  checkResult: ProjectNodeDeletionCheckResult | null,
): ProjectNodeDeletionDraft {
  return {
    strategy: checkResult?.allowedStrategies[0] ?? 'direct_delete',
    confirmDelete: false,
    secondConfirmation: false,
  };
}

export function toProjectNodeDeletionRequest(
  draft: ProjectNodeDeletionDraft,
): ProjectNodeDeletionExecuteRequest {
  return {
    strategy: draft.strategy,
    confirmDelete: draft.confirmDelete,
    secondConfirmation: draft.secondConfirmation || undefined,
  };
}

export function describeDeletionStrategy(strategy: DeletionStrategy): string {
  return strategy === 'archive_then_delete'
    ? '适用于存在 summaries 内容的节点，会先转存到 summaryArchives 后再执行删除。'
    : '不做总结转存，直接删除当前节点，并按契约将其直接子节点提升到根层。';
}

export type { DeletionStrategy, ProjectNodeDeletionCheckResult, ProjectNodeDeletionExecuteResult };
