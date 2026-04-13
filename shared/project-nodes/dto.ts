import { z } from 'zod';

import { descriptionSchema, integerSchema, isoDateTimeSchema, sortOrderSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';
import { deletionStrategySchema } from '../projects/dto.js';

export const projectNodeStatusValues = ['default', 'todo', 'fix'] as const;
export const projectNodeStatusSchema = z.enum(projectNodeStatusValues);
export type ProjectNodeStatus = z.infer<typeof projectNodeStatusSchema>;

export const projectNodeSummarySchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  name: trimmedNonEmptyStringSchema,
  description: descriptionSchema,
  status: projectNodeStatusSchema,
  parentNodeId: uuidSchema.nullable(),
  sortOrder: sortOrderSchema,
  workflowId: uuidSchema.nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type ProjectNodeSummary = z.infer<typeof projectNodeSummarySchema>;

export const projectNodeDetailSchema = projectNodeSummarySchema;
export type ProjectNodeDetail = z.infer<typeof projectNodeDetailSchema>;

export const projectNodeDeletionCheckResultSchema = z.object({
  projectNodeId: uuidSchema,
  requiresSecondConfirmation: z.boolean(),
  directChildCount: integerSchema,
  summaryFileCount: integerSchema,
  allowedStrategies: z.array(deletionStrategySchema),
});
export type ProjectNodeDeletionCheckResult = z.infer<typeof projectNodeDeletionCheckResultSchema>;

export const projectNodeDeletionExecuteResultSchema = z.object({
  projectNodeId: uuidSchema,
  deleted: z.boolean(),
  usedStrategy: deletionStrategySchema,
  archived: z.boolean(),
  promotedToRootCount: integerSchema,
});
export type ProjectNodeDeletionExecuteResult = z.infer<typeof projectNodeDeletionExecuteResultSchema>;
