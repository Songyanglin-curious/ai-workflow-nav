import { z } from 'zod';

import { categorySchema, descriptionSchema, emptyBodySchema, tagsSchema, textSchema, trimmedNonEmptyStringSchema } from '../common/index.js';
import { workflowActionTypeSchema } from './dto.js';

export const workflowListQuerySchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
});
export type WorkflowListQuery = z.infer<typeof workflowListQuerySchema>;

export const createWorkflowRequestSchema = z.object({
  name: trimmedNonEmptyStringSchema,
  description: descriptionSchema.optional(),
  tags: tagsSchema.optional(),
  category: categorySchema.optional(),
  mermaidSource: textSchema.optional(),
});
export type CreateWorkflowRequest = z.infer<typeof createWorkflowRequestSchema>;

export const updateWorkflowRequestSchema = z.object({
  name: trimmedNonEmptyStringSchema.optional(),
  description: descriptionSchema.optional(),
  tags: tagsSchema.optional(),
  category: categorySchema.optional(),
  mermaidSource: textSchema.optional(),
});
export type UpdateWorkflowRequest = z.infer<typeof updateWorkflowRequestSchema>;

export const createWorkflowNodeActionRequestSchema = z.object({
  mermaidNodeId: trimmedNonEmptyStringSchema,
  actionType: workflowActionTypeSchema,
  targetRef: trimmedNonEmptyStringSchema,
});
export type CreateWorkflowNodeActionRequest = z.infer<typeof createWorkflowNodeActionRequestSchema>;

export const updateWorkflowNodeActionRequestSchema = z.object({
  actionType: workflowActionTypeSchema.optional(),
  targetRef: trimmedNonEmptyStringSchema.optional(),
});
export type UpdateWorkflowNodeActionRequest = z.infer<typeof updateWorkflowNodeActionRequestSchema>;

export const workflowNodeActionSyncRequestSchema = emptyBodySchema;
export type WorkflowNodeActionSyncRequest = z.infer<typeof workflowNodeActionSyncRequestSchema>;

export const workflowRuntimeTriggerRequestSchema = emptyBodySchema;
export type WorkflowRuntimeTriggerRequest = z.infer<typeof workflowRuntimeTriggerRequestSchema>;
