import { presentItems, presentNamedData, presentResult } from '../presenter.js';
import type {
  ProjectDetail,
  ProjectSummary,
} from '../../domains/projects/service.js';
import type {
  ProjectNodeDetail,
  ProjectNodeSummary,
} from '../../domains/projects/project-nodes/service.js';
import type {
  DeliberationsRecordFileItem,
  DeliberationsRecordFolderInfo,
  AppendLatestDeliberationsResult,
  CreateDeliberationsFileResult,
} from '../../domains/projects/deliberations/service.js';
import type {
  SummaryFileItem,
  SummaryFolderInfo,
} from '../../domains/projects/summaries/service.js';
import type {
  PatchProjectNodeLayoutsResult,
  ProjectNodeLayoutItem,
  ProjectViewport,
} from '../../domains/projects/view-config/service.js';
import type {
  ProjectDeletionCheckResult,
  ProjectDeletionExecuteResult,
} from '../../processes/project-deletion/service.js';
import type {
  ProjectNodeDeletionCheckResult,
  ProjectNodeDeletionExecuteResult,
} from '../../processes/project-node-deletion/service.js';
import type {
  WorkflowRuntimeNodeDetail,
  WorkflowRuntimeTriggerResult,
} from '../../processes/workflow-runtime-actions/service.js';

export function presentProjectListEnvelope(items: ProjectSummary[]) {
  return presentItems(items);
}

export function presentProjectDetailEnvelope(project: ProjectDetail) {
  return presentNamedData('project', project);
}

export function presentProjectNodeListEnvelope(items: ProjectNodeSummary[]) {
  return presentItems(items);
}

export function presentProjectNodeDetailEnvelope(projectNode: ProjectNodeDetail) {
  return presentNamedData('projectNode', projectNode);
}

export function presentProjectNodeLayoutsEnvelope(items: ProjectNodeLayoutItem[]) {
  return presentItems(items);
}

export function presentProjectNodeLayoutsPatchEnvelope(result: PatchProjectNodeLayoutsResult) {
  return presentResult(result);
}

export function presentProjectViewportEnvelope(viewport: ProjectViewport) {
  return presentNamedData('viewport', viewport);
}

export function presentDeliberationsFolderEnvelope(result: DeliberationsRecordFolderInfo) {
  return presentNamedData('folder', result);
}

export function presentDeliberationsFilesEnvelope(items: DeliberationsRecordFileItem[]) {
  return presentItems(items);
}

export function presentAppendLatestDeliberationsEnvelope(result: AppendLatestDeliberationsResult) {
  return presentResult(result);
}

export function presentCreateDeliberationsFileEnvelope(result: CreateDeliberationsFileResult) {
  return presentResult(result);
}

export function presentSummaryFolderEnvelope(summary: SummaryFolderInfo) {
  return presentNamedData('summary', summary);
}

export function presentSummaryFilesEnvelope(items: SummaryFileItem[]) {
  return presentItems(items);
}

export function presentProjectDeletionCheckEnvelope(result: ProjectDeletionCheckResult) {
  return presentResult(result);
}

export function presentProjectDeletionExecuteEnvelope(result: ProjectDeletionExecuteResult) {
  return presentResult(result);
}

export function presentProjectNodeDeletionCheckEnvelope(result: ProjectNodeDeletionCheckResult) {
  return presentResult(result);
}

export function presentProjectNodeDeletionExecuteEnvelope(result: ProjectNodeDeletionExecuteResult) {
  return presentResult(result);
}

export function presentWorkflowRuntimeDetailEnvelope(result: WorkflowRuntimeNodeDetail) {
  return presentResult(result);
}

export function presentWorkflowRuntimeTriggerEnvelope(result: WorkflowRuntimeTriggerResult) {
  return presentResult(result);
}
