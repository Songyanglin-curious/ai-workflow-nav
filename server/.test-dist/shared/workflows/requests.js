import { z } from 'zod';
import { categorySchema, descriptionSchema, emptyBodySchema, tagsSchema, textSchema, trimmedNonEmptyStringSchema } from '../common/index.js';
import { workflowActionTypeSchema } from './dto.js';
export const workflowListQuerySchema = z.object({
    keyword: z.string().optional(),
    category: z.string().optional(),
});
export const createWorkflowRequestSchema = z.object({
    name: trimmedNonEmptyStringSchema,
    description: descriptionSchema.optional(),
    tags: tagsSchema.optional(),
    category: categorySchema.optional(),
    mermaidSource: textSchema.optional(),
});
export const updateWorkflowRequestSchema = z.object({
    name: trimmedNonEmptyStringSchema.optional(),
    description: descriptionSchema.optional(),
    tags: tagsSchema.optional(),
    category: categorySchema.optional(),
    mermaidSource: textSchema.optional(),
});
export const createWorkflowNodeActionRequestSchema = z.object({
    mermaidNodeId: trimmedNonEmptyStringSchema,
    actionType: workflowActionTypeSchema,
    targetRef: trimmedNonEmptyStringSchema,
});
export const updateWorkflowNodeActionRequestSchema = z.object({
    actionType: workflowActionTypeSchema.optional(),
    targetRef: trimmedNonEmptyStringSchema.optional(),
});
export const workflowNodeActionSyncRequestSchema = emptyBodySchema;
export const workflowRuntimeTriggerRequestSchema = emptyBodySchema;
//# sourceMappingURL=requests.js.map