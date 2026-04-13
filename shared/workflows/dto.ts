import { z } from 'zod';

import { categorySchema, descriptionSchema, integerSchema, isoDateTimeSchema, tagsSchema, textSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';

export const workflowActionTypeValues = ['prompt', 'tool'] as const;
export const workflowActionTypeSchema = z.enum(workflowActionTypeValues);
export type WorkflowActionType = z.infer<typeof workflowActionTypeSchema>;

export const runtimeFailureReasonValues = ['prompt_not_found', 'tool_target_not_found'] as const;
export const runtimeFailureReasonSchema = z.enum(runtimeFailureReasonValues);
export type RuntimeFailureReason = z.infer<typeof runtimeFailureReasonSchema>;

export const workflowSummarySchema = z.object({
  id: uuidSchema,
  name: trimmedNonEmptyStringSchema,
  description: descriptionSchema,
  tags: tagsSchema,
  category: categorySchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type WorkflowSummary = z.infer<typeof workflowSummarySchema>;

export const workflowDetailSchema = workflowSummarySchema.extend({
  mermaidSource: textSchema,
});
export type WorkflowDetail = z.infer<typeof workflowDetailSchema>;

export const workflowNodeActionItemSchema = z.object({
  workflowId: uuidSchema,
  mermaidNodeId: trimmedNonEmptyStringSchema,
  actionType: workflowActionTypeSchema,
  targetRef: trimmedNonEmptyStringSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type WorkflowNodeActionItem = z.infer<typeof workflowNodeActionItemSchema>;

export const workflowNodeActionSyncResultSchema = z.object({
  removedCount: integerSchema,
  remainingCount: integerSchema,
});
export type WorkflowNodeActionSyncResult = z.infer<typeof workflowNodeActionSyncResultSchema>;

export const workflowRuntimeActionSchema = z.object({
  actionType: workflowActionTypeSchema,
  targetRef: trimmedNonEmptyStringSchema,
  targetName: trimmedNonEmptyStringSchema,
  isExecutable: z.boolean(),
  failureReason: runtimeFailureReasonSchema.nullable().optional(),
});
export type WorkflowRuntimeAction = z.infer<typeof workflowRuntimeActionSchema>;

export const workflowRuntimeNodeDetailSchema = z.object({
  projectNodeId: uuidSchema,
  workflowId: uuidSchema,
  mermaidNodeId: trimmedNonEmptyStringSchema,
  hasBinding: z.boolean(),
  action: workflowRuntimeActionSchema.nullable(),
});
export type WorkflowRuntimeNodeDetail = z.infer<typeof workflowRuntimeNodeDetailSchema>;

export const workflowRuntimePromptTriggerResultSchema = z.object({
  actionType: z.literal('prompt'),
  promptId: uuidSchema,
  promptName: trimmedNonEmptyStringSchema,
  copyText: textSchema,
});
export type WorkflowRuntimePromptTriggerResult = z.infer<typeof workflowRuntimePromptTriggerResultSchema>;

export const workflowRuntimeToolTriggerResultSchema = z.object({
  actionType: z.literal('tool'),
  toolKey: trimmedNonEmptyStringSchema,
  launched: z.boolean(),
});
export type WorkflowRuntimeToolTriggerResult = z.infer<typeof workflowRuntimeToolTriggerResultSchema>;

export const workflowRuntimeTriggerResultSchema = z.discriminatedUnion('actionType', [
  workflowRuntimePromptTriggerResultSchema,
  workflowRuntimeToolTriggerResultSchema,
]);
export type WorkflowRuntimeTriggerResult = z.infer<typeof workflowRuntimeTriggerResultSchema>;
