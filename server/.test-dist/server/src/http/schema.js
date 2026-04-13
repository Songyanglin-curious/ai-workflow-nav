import { z } from 'zod';
import { createResultDataSchema, emptyBodySchema, trimmedNonEmptyStringSchema, uuidSchema, } from '../../../shared/common/index.js';
import { projectSolutionItemSchema, solutionProjectItemSchema } from '../../../shared/projects/index.js';
import { importModeSchema } from '../../../shared/imports-exports/index.js';
import { projectNodesListQuerySchema } from '../../../shared/project-nodes/index.js';
export { projectListDataSchema, projectDetailDataSchema, projectDeletionCheckDataSchema, projectDeletionExecuteDataSchema, solutionListDataSchema, solutionDetailDataSchema, solutionDeleteDataSchema, solutionProjectsDataSchema, projectSolutionsDataSchema, projectNodeLayoutsDataSchema, projectNodeLayoutsPatchDataSchema, projectViewportDataSchema, } from '../../../shared/projects/responses.js';
export { projectNodesListDataSchema, projectNodeDetailDataSchema, projectNodeDeletionCheckDataSchema, projectNodeDeletionExecuteDataSchema, } from '../../../shared/project-nodes/responses.js';
export { deliberationsRecordFolderDataSchema, deliberationsRecordFilesDataSchema, appendLatestDeliberationsDataSchema, createDeliberationsFileDataSchema, } from '../../../shared/deliberations/responses.js';
export { summaryFolderDataSchema, summaryFilesDataSchema } from '../../../shared/summaries/responses.js';
export const solutionProjectDataSchema = createResultDataSchema(solutionProjectItemSchema);
export const projectSolutionDataSchema = createResultDataSchema(projectSolutionItemSchema);
export { inspectionRunRequestSchema } from '../../../shared/inspections/requests.js';
export { syncExportRequestSchema, syncImportRequestSchema } from '../../../shared/imports-exports/requests.js';
export { selfCheckRequestSchema } from '../../../shared/startup/requests.js';
export { workflowRuntimeTriggerRequestSchema } from '../../../shared/workflows/requests.js';
export { projectListQuerySchema, createProjectRequestSchema, updateProjectRequestSchema, projectDeletionCheckRequestSchema, projectDeletionExecuteRequestSchema, solutionListQuerySchema, createSolutionRequestSchema, updateSolutionRequestSchema, bindSolutionProjectRequestSchema, patchSolutionProjectRequestSchema, patchProjectNodeLayoutsRequestSchema, patchProjectViewportRequestSchema, } from '../../../shared/projects/index.js';
export { projectNodesListQuerySchema, createProjectNodeRequestSchema, updateProjectNodeRequestSchema, projectNodeDeletionCheckRequestSchema, projectNodeDeletionExecuteRequestSchema, } from '../../../shared/project-nodes/index.js';
export { appendLatestDeliberationsRequestSchema, createDeliberationsFileRequestSchema, } from '../../../shared/deliberations/index.js';
export const emptyObjectSchema = {
    type: 'object',
    properties: {},
    additionalProperties: false,
};
export const apiEnvelopeSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        meta: { ...emptyObjectSchema },
    },
    required: ['success', 'meta'],
};
export const projectDeletionParamsSchema = z.object({
    projectId: uuidSchema,
});
export const projectNodeDeletionParamsSchema = z.object({
    projectNodeId: uuidSchema,
});
export const workflowRuntimeParamsSchema = z.object({
    projectNodeId: uuidSchema,
    mermaidNodeId: trimmedNonEmptyStringSchema,
});
export const inspectionsRunBodySchema = emptyBodySchema;
export const syncExportBodySchema = emptyBodySchema;
export const syncImportBodySchema = z.object({
    mode: importModeSchema,
});
export const startupReportBodySchema = emptyBodySchema;
export const selfCheckBodySchema = emptyBodySchema;
export const projectParamsSchema = z.object({
    id: uuidSchema,
});
export const projectIdParamsSchema = z.object({
    projectId: uuidSchema,
});
export const projectNodeParamsSchema = z.object({
    id: uuidSchema,
});
export const projectNodeIdParamsSchema = z.object({
    projectNodeId: uuidSchema,
});
export const solutionParamsSchema = z.object({
    id: uuidSchema,
});
export const solutionIdParamsSchema = z.object({
    solutionId: uuidSchema,
});
export const solutionProjectParamsSchema = z.object({
    solutionId: uuidSchema,
    projectId: uuidSchema,
});
const nullableQueryNormalizer = (value) => {
    if (value === '' || value === 'null') {
        return null;
    }
    return value;
};
export const projectNodesListQueryHttpSchema = z.object({
    parentNodeId: z.preprocess(nullableQueryNormalizer, z.string().nullable().optional()),
    status: projectNodesListQuerySchema.shape.status,
});
export const projectNodeLayoutsParamsSchema = z.object({
    projectId: uuidSchema,
});
export const projectViewportParamsSchema = z.object({
    projectId: uuidSchema,
});
export const deliberationsRecordParamsSchema = z.object({
    projectNodeId: uuidSchema,
});
export const summaryFolderParamsSchema = z.object({
    projectNodeId: uuidSchema,
});
//# sourceMappingURL=schema.js.map