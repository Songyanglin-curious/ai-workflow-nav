import type {
  DeletionStrategy,
  ProjectDeletionCheckResult,
  ProjectDeletionExecuteRequest,
  ProjectDeletionExecuteResult,
} from '../../../../../shared/projects/index.js';

export interface ProjectDeletionDraft {
  strategy: DeletionStrategy;
  confirmDelete: boolean;
  secondConfirmation: boolean;
}

export const deletionStrategyLabels: Record<DeletionStrategy, string> = {
  archive_then_delete: '先转存总结再删除',
  direct_delete: '直接删除',
};

export function createProjectDeletionDraft(
  checkResult: ProjectDeletionCheckResult | null,
): ProjectDeletionDraft {
  return {
    strategy: checkResult?.allowedStrategies[0] ?? 'direct_delete',
    confirmDelete: false,
    secondConfirmation: false,
  };
}

export function toProjectDeletionRequest(draft: ProjectDeletionDraft): ProjectDeletionExecuteRequest {
  return {
    strategy: draft.strategy,
    confirmDelete: draft.confirmDelete,
    secondConfirmation: draft.secondConfirmation || undefined,
  };
}

export function describeDeletionStrategy(strategy: DeletionStrategy): string {
  return strategy === 'archive_then_delete'
    ? '适用于存在 summaries 内容的项目，会先按设计语义进行总结转存。'
    : '不做总结转存，直接执行项目删除。';
}

export type { DeletionStrategy, ProjectDeletionCheckResult, ProjectDeletionExecuteResult };
