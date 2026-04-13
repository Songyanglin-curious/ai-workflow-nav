import { z } from 'zod';
import { createItemsDataSchema, createNamedDataSchema, createResultDataSchema, deletedResultSchema } from '../common/index.js';
import { projectDeletionCheckResultSchema, projectDeletionExecuteResultSchema, projectDetailSchema, projectNodeLayoutItemSchema, projectSolutionItemSchema, projectSummarySchema, projectViewportSchema, solutionDetailSchema, solutionProjectItemSchema, solutionSummarySchema, } from './dto.js';
export const projectListDataSchema = createItemsDataSchema(projectSummarySchema);
export const projectDetailDataSchema = createNamedDataSchema('project', projectDetailSchema);
export const projectDeletionCheckDataSchema = createResultDataSchema(projectDeletionCheckResultSchema);
export const projectDeletionExecuteDataSchema = createResultDataSchema(projectDeletionExecuteResultSchema);
export const solutionListDataSchema = createItemsDataSchema(solutionSummarySchema);
export const solutionDetailDataSchema = createNamedDataSchema('solution', solutionDetailSchema);
export const solutionDeleteDataSchema = createResultDataSchema(deletedResultSchema);
export const solutionProjectsDataSchema = createItemsDataSchema(solutionProjectItemSchema);
export const projectSolutionsDataSchema = createItemsDataSchema(projectSolutionItemSchema);
export const projectNodeLayoutsDataSchema = createItemsDataSchema(projectNodeLayoutItemSchema);
export const projectNodeLayoutsPatchDataSchema = createResultDataSchema(z.object({
    updatedCount: z.number().int(),
}));
export const projectViewportDataSchema = createNamedDataSchema('viewport', projectViewportSchema);
//# sourceMappingURL=responses.js.map