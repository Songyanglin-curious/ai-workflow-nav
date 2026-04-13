import { z } from 'zod';

import { categorySchema, descriptionSchema, integerSchema, isoDateTimeSchema, sortOrderSchema, tagsSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';

export const deletionStrategyValues = ['archive_then_delete', 'direct_delete'] as const;
export const deletionStrategySchema = z.enum(deletionStrategyValues);
export type DeletionStrategy = z.infer<typeof deletionStrategySchema>;

export const projectSummarySchema = z.object({
  id: uuidSchema,
  name: trimmedNonEmptyStringSchema,
  description: descriptionSchema,
  tags: tagsSchema,
  category: categorySchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type ProjectSummary = z.infer<typeof projectSummarySchema>;

export const projectDetailSchema = projectSummarySchema;
export type ProjectDetail = z.infer<typeof projectDetailSchema>;

export const projectDeletionCheckResultSchema = z.object({
  projectId: uuidSchema,
  projectNodeCount: integerSchema,
  summaryNodeCount: integerSchema,
  requiresSecondConfirmation: z.boolean(),
  allowedStrategies: z.array(deletionStrategySchema),
});
export type ProjectDeletionCheckResult = z.infer<typeof projectDeletionCheckResultSchema>;

export const projectDeletionExecuteResultSchema = z.object({
  projectId: uuidSchema,
  deleted: z.boolean(),
  usedStrategy: deletionStrategySchema,
  archivedSummaryNodeCount: integerSchema,
});
export type ProjectDeletionExecuteResult = z.infer<typeof projectDeletionExecuteResultSchema>;

export const solutionSummarySchema = z.object({
  id: uuidSchema,
  name: trimmedNonEmptyStringSchema,
  description: descriptionSchema,
  tags: tagsSchema,
  category: categorySchema,
  projectCount: integerSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type SolutionSummary = z.infer<typeof solutionSummarySchema>;

export const solutionDetailSchema = solutionSummarySchema;
export type SolutionDetail = z.infer<typeof solutionDetailSchema>;

export const solutionProjectItemSchema = z.object({
  solutionId: uuidSchema,
  projectId: uuidSchema,
  sortOrder: sortOrderSchema,
  projectName: trimmedNonEmptyStringSchema,
});
export type SolutionProjectItem = z.infer<typeof solutionProjectItemSchema>;

export const projectSolutionItemSchema = z.object({
  projectId: uuidSchema,
  solutionId: uuidSchema,
  solutionName: trimmedNonEmptyStringSchema,
  sortOrder: sortOrderSchema,
});
export type ProjectSolutionItem = z.infer<typeof projectSolutionItemSchema>;

export const projectNodeLayoutItemSchema = z.object({
  projectNodeId: uuidSchema,
  positionX: z.number(),
  positionY: z.number(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type ProjectNodeLayoutItem = z.infer<typeof projectNodeLayoutItemSchema>;

export const projectViewportSchema = z.object({
  projectId: uuidSchema,
  viewportX: z.number(),
  viewportY: z.number(),
  zoom: z.number().positive(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type ProjectViewport = z.infer<typeof projectViewportSchema>;
