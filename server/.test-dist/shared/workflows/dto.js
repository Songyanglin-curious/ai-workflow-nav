import { z } from 'zod';
import { categorySchema, descriptionSchema, integerSchema, isoDateTimeSchema, tagsSchema, textSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';
export const workflowActionTypeValues = ['prompt', 'tool'];
export const workflowActionTypeSchema = z.enum(workflowActionTypeValues);
export const runtimeFailureReasonValues = ['prompt_not_found', 'tool_target_not_found'];
export const runtimeFailureReasonSchema = z.enum(runtimeFailureReasonValues);
export const workflowSummarySchema = z.object({
    id: uuidSchema,
    name: trimmedNonEmptyStringSchema,
    description: descriptionSchema,
    tags: tagsSchema,
    category: categorySchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
});
export const workflowDetailSchema = workflowSummarySchema.extend({
    mermaidSource: textSchema,
});
export const workflowNodeActionItemSchema = z.object({
    workflowId: uuidSchema,
    mermaidNodeId: trimmedNonEmptyStringSchema,
    actionType: workflowActionTypeSchema,
    targetRef: trimmedNonEmptyStringSchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
});
export const workflowNodeActionSyncResultSchema = z.object({
    removedCount: integerSchema,
    remainingCount: integerSchema,
});
export const workflowRuntimeActionSchema = z.object({
    actionType: workflowActionTypeSchema,
    targetRef: trimmedNonEmptyStringSchema,
    targetName: trimmedNonEmptyStringSchema,
    isExecutable: z.boolean(),
    failureReason: runtimeFailureReasonSchema.nullable().optional(),
});
export const workflowRuntimeNodeDetailSchema = z.object({
    projectNodeId: uuidSchema,
    workflowId: uuidSchema,
    mermaidNodeId: trimmedNonEmptyStringSchema,
    hasBinding: z.boolean(),
    action: workflowRuntimeActionSchema.nullable(),
});
export const workflowRuntimePromptTriggerResultSchema = z.object({
    actionType: z.literal('prompt'),
    promptId: uuidSchema,
    promptName: trimmedNonEmptyStringSchema,
    copyText: textSchema,
});
export const workflowRuntimeToolTriggerResultSchema = z.object({
    actionType: z.literal('tool'),
    toolKey: trimmedNonEmptyStringSchema,
    launched: z.boolean(),
});
export const workflowRuntimeTriggerResultSchema = z.discriminatedUnion('actionType', [
    workflowRuntimePromptTriggerResultSchema,
    workflowRuntimeToolTriggerResultSchema,
]);
//# sourceMappingURL=dto.js.map