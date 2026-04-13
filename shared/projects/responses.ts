import { z } from 'zod';

import { createItemsDataSchema, createNamedDataSchema, createResultDataSchema, deletedResultSchema } from '../common/index.js';
import {
  projectDeletionCheckResultSchema,
  projectDeletionExecuteResultSchema,
  projectDetailSchema,
  projectNodeLayoutItemSchema,
  projectSolutionItemSchema,
  projectSummarySchema,
  projectViewportSchema,
  solutionDetailSchema,
  solutionProjectItemSchema,
  solutionSummarySchema,
} from './dto.js';

export const projectListDataSchema = createItemsDataSchema(projectSummarySchema);
export type ProjectListData = z.infer<typeof projectListDataSchema>;

export const projectDetailDataSchema = createNamedDataSchema('project', projectDetailSchema);
export type ProjectDetailData = z.infer<typeof projectDetailDataSchema>;

export const projectDeletionCheckDataSchema = createResultDataSchema(projectDeletionCheckResultSchema);
export type ProjectDeletionCheckData = z.infer<typeof projectDeletionCheckDataSchema>;

export const projectDeletionExecuteDataSchema = createResultDataSchema(projectDeletionExecuteResultSchema);
export type ProjectDeletionExecuteData = z.infer<typeof projectDeletionExecuteDataSchema>;

export const solutionListDataSchema = createItemsDataSchema(solutionSummarySchema);
export type SolutionListData = z.infer<typeof solutionListDataSchema>;

export const solutionDetailDataSchema = createNamedDataSchema('solution', solutionDetailSchema);
export type SolutionDetailData = z.infer<typeof solutionDetailDataSchema>;

export const solutionDeleteDataSchema = createResultDataSchema(deletedResultSchema);
export type SolutionDeleteData = z.infer<typeof solutionDeleteDataSchema>;

export const solutionProjectsDataSchema = createItemsDataSchema(solutionProjectItemSchema);
export type SolutionProjectsData = z.infer<typeof solutionProjectsDataSchema>;

export const projectSolutionsDataSchema = createItemsDataSchema(projectSolutionItemSchema);
export type ProjectSolutionsData = z.infer<typeof projectSolutionsDataSchema>;

export const projectNodeLayoutsDataSchema = createItemsDataSchema(projectNodeLayoutItemSchema);
export type ProjectNodeLayoutsData = z.infer<typeof projectNodeLayoutsDataSchema>;

export const projectNodeLayoutsPatchDataSchema = createResultDataSchema(
  z.object({
    updatedCount: z.number().int(),
  }),
);
export type ProjectNodeLayoutsPatchData = z.infer<typeof projectNodeLayoutsPatchDataSchema>;

export const projectViewportDataSchema = createNamedDataSchema('viewport', projectViewportSchema);
export type ProjectViewportData = z.infer<typeof projectViewportDataSchema>;
