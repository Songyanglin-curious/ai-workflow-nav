import { z } from 'zod';

import { descriptionSchema, emptyBodySchema, sortOrderSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';
import { deletionStrategySchema } from '../projects/dto.js';
import { projectNodeStatusSchema } from './dto.js';

export const projectNodesListQuerySchema = z.object({
  parentNodeId: z.string().nullable().optional(),
  status: projectNodeStatusSchema.optional(),
});
export type ProjectNodesListQuery = z.infer<typeof projectNodesListQuerySchema>;

export const createProjectNodeRequestSchema = z.object({
  name: trimmedNonEmptyStringSchema,
  description: descriptionSchema.optional(),
  status: projectNodeStatusSchema.optional(),
  parentNodeId: uuidSchema.nullable().optional(),
  sortOrder: sortOrderSchema.optional(),
  workflowId: uuidSchema.nullable().optional(),
});
export type CreateProjectNodeRequest = z.infer<typeof createProjectNodeRequestSchema>;

export const updateProjectNodeRequestSchema = z.object({
  name: trimmedNonEmptyStringSchema.optional(),
  description: descriptionSchema.optional(),
  status: projectNodeStatusSchema.optional(),
  parentNodeId: uuidSchema.nullable().optional(),
  sortOrder: sortOrderSchema.optional(),
  workflowId: uuidSchema.nullable().optional(),
});
export type UpdateProjectNodeRequest = z.infer<typeof updateProjectNodeRequestSchema>;

export const projectNodeDeletionCheckRequestSchema = emptyBodySchema;
export type ProjectNodeDeletionCheckRequest = z.infer<typeof projectNodeDeletionCheckRequestSchema>;

export const projectNodeDeletionExecuteRequestSchema = z.object({
  confirmDelete: z.boolean(),
  secondConfirmation: z.boolean().optional(),
  strategy: deletionStrategySchema,
});
export type ProjectNodeDeletionExecuteRequest = z.infer<typeof projectNodeDeletionExecuteRequestSchema>;
