import { z } from 'zod';

import {
  createResultDataSchema,
  emptyBodySchema,
  trimmedNonEmptyStringSchema,
  uuidSchema,
} from '../../../shared/common/index.js';
import { deletionStrategySchema, projectSolutionItemSchema, solutionProjectItemSchema } from '../../../shared/projects/index.js';
import { importModeSchema } from '../../../shared/imports-exports/index.js';
import { projectNodesListQuerySchema } from '../../../shared/project-nodes/index.js';
export {
  projectListDataSchema,
  projectDetailDataSchema,
  projectDeletionCheckDataSchema,
  projectDeletionExecuteDataSchema,
  solutionListDataSchema,
  solutionDetailDataSchema,
  solutionDeleteDataSchema,
  solutionProjectsDataSchema,
  projectSolutionsDataSchema,
  projectNodeLayoutsDataSchema,
  projectNodeLayoutsPatchDataSchema,
  projectViewportDataSchema,
} from '../../../shared/projects/responses.js';
export {
  projectNodesListDataSchema,
  projectNodeDetailDataSchema,
  projectNodeDeletionCheckDataSchema,
  projectNodeDeletionExecuteDataSchema,
} from '../../../shared/project-nodes/responses.js';
export {
  deliberationsRecordFolderDataSchema,
  deliberationsRecordFilesDataSchema,
  appendLatestDeliberationsDataSchema,
  createDeliberationsFileDataSchema,
} from '../../../shared/deliberations/responses.js';
export { summaryFolderDataSchema, summaryFilesDataSchema } from '../../../shared/summaries/responses.js';
export const solutionProjectDataSchema = createResultDataSchema(solutionProjectItemSchema);
export const projectSolutionDataSchema = createResultDataSchema(projectSolutionItemSchema);
export type SolutionProjectData = z.infer<typeof solutionProjectDataSchema>;
export type ProjectSolutionData = z.infer<typeof projectSolutionDataSchema>;

export { inspectionRunRequestSchema } from '../../../shared/inspections/requests.js';
export { syncExportRequestSchema, syncImportRequestSchema } from '../../../shared/imports-exports/requests.js';
export { selfCheckRequestSchema } from '../../../shared/startup/requests.js';
export { workflowRuntimeTriggerRequestSchema } from '../../../shared/workflows/requests.js';
export {
  projectListQuerySchema,
  createProjectRequestSchema,
  updateProjectRequestSchema,
  projectDeletionCheckRequestSchema,
  projectDeletionExecuteRequestSchema,
  solutionListQuerySchema,
  createSolutionRequestSchema,
  updateSolutionRequestSchema,
  bindSolutionProjectRequestSchema,
  patchSolutionProjectRequestSchema,
  patchProjectNodeLayoutsRequestSchema,
  patchProjectViewportRequestSchema,
} from '../../../shared/projects/index.js';
export {
  projectNodesListQuerySchema,
  createProjectNodeRequestSchema,
  updateProjectNodeRequestSchema,
  projectNodeDeletionCheckRequestSchema,
  projectNodeDeletionExecuteRequestSchema,
} from '../../../shared/project-nodes/index.js';
export {
  appendLatestDeliberationsRequestSchema,
  createDeliberationsFileRequestSchema,
} from '../../../shared/deliberations/index.js';

export const emptyObjectSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
} as const;

export const apiEnvelopeSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    meta: { ...emptyObjectSchema },
  },
  required: ['success', 'meta'],
} as const;

export const projectDeletionParamsSchema = z.object({
  projectId: uuidSchema,
});
export type ProjectDeletionParams = z.infer<typeof projectDeletionParamsSchema>;

export const projectNodeDeletionParamsSchema = z.object({
  projectNodeId: uuidSchema,
});
export type ProjectNodeDeletionParams = z.infer<typeof projectNodeDeletionParamsSchema>;

export const workflowRuntimeParamsSchema = z.object({
  projectNodeId: uuidSchema,
  mermaidNodeId: trimmedNonEmptyStringSchema,
});
export type WorkflowRuntimeParams = z.infer<typeof workflowRuntimeParamsSchema>;

export const inspectionsRunBodySchema = emptyBodySchema;
export type InspectionsRunBody = z.infer<typeof inspectionsRunBodySchema>;

export const syncExportBodySchema = emptyBodySchema;
export type SyncExportBody = z.infer<typeof syncExportBodySchema>;

export const syncImportBodySchema = z.object({
  mode: importModeSchema,
});
export type SyncImportBody = z.infer<typeof syncImportBodySchema>;

export const startupReportBodySchema = emptyBodySchema;
export type StartupReportBody = z.infer<typeof startupReportBodySchema>;

export const selfCheckBodySchema = emptyBodySchema;
export type SelfCheckBody = z.infer<typeof selfCheckBodySchema>;

export const projectParamsSchema = z.object({
  id: uuidSchema,
});
export type ProjectParams = z.infer<typeof projectParamsSchema>;

export const projectIdParamsSchema = z.object({
  projectId: uuidSchema,
});
export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;

export const projectNodeParamsSchema = z.object({
  id: uuidSchema,
});
export type ProjectNodeParams = z.infer<typeof projectNodeParamsSchema>;

export const projectNodeIdParamsSchema = z.object({
  projectNodeId: uuidSchema,
});
export type ProjectNodeIdParams = z.infer<typeof projectNodeIdParamsSchema>;

export const solutionParamsSchema = z.object({
  id: uuidSchema,
});
export type SolutionParams = z.infer<typeof solutionParamsSchema>;

export const solutionIdParamsSchema = z.object({
  solutionId: uuidSchema,
});
export type SolutionIdParams = z.infer<typeof solutionIdParamsSchema>;

export const solutionProjectParamsSchema = z.object({
  solutionId: uuidSchema,
  projectId: uuidSchema,
});
export type SolutionProjectParams = z.infer<typeof solutionProjectParamsSchema>;

const nullableQueryNormalizer = (value: unknown): unknown => {
  if (value === '' || value === 'null') {
    return null;
  }

  return value;
};

export const projectNodesListQueryHttpSchema = z.object({
  parentNodeId: z.preprocess(nullableQueryNormalizer, z.string().nullable().optional()),
  status: projectNodesListQuerySchema.shape.status,
});
export type ProjectNodesListQueryHttp = z.infer<typeof projectNodesListQueryHttpSchema>;

export const projectNodeLayoutsParamsSchema = z.object({
  projectId: uuidSchema,
});
export type ProjectNodeLayoutsParams = z.infer<typeof projectNodeLayoutsParamsSchema>;

export const projectViewportParamsSchema = z.object({
  projectId: uuidSchema,
});
export type ProjectViewportParams = z.infer<typeof projectViewportParamsSchema>;

export const deliberationsRecordParamsSchema = z.object({
  projectNodeId: uuidSchema,
});
export type DeliberationsRecordParams = z.infer<typeof deliberationsRecordParamsSchema>;

export const summaryFolderParamsSchema = z.object({
  projectNodeId: uuidSchema,
});
export type SummaryFolderParams = z.infer<typeof summaryFolderParamsSchema>;
