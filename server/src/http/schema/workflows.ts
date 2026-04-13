import { z } from 'zod';

const trimmedNonEmptyStringSchema = z.string().trim().min(1);
const emptyBodySchema = z.object({}).strict();
const workflowActionTypeSchema = z.enum(['prompt', 'tool']);
const runtimeFailureReasonSchema = z.enum(['prompt_not_found', 'tool_target_not_found']);

const workflowSummarySchema = z.object({
  id: z.string().uuid(),
  name: trimmedNonEmptyStringSchema,
  description: z.string(),
  tags: z.string(),
  category: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const workflowDetailSchema = workflowSummarySchema.extend({
  mermaidSource: z.string(),
});

const workflowNodeActionItemSchema = z.object({
  workflowId: z.string().uuid(),
  mermaidNodeId: trimmedNonEmptyStringSchema,
  actionType: workflowActionTypeSchema,
  targetRef: trimmedNonEmptyStringSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

const workflowNodeActionSyncResultSchema = z.object({
  removedCount: z.number().int(),
  remainingCount: z.number().int(),
});

const workflowRuntimeActionSchema = z.object({
  actionType: workflowActionTypeSchema,
  targetRef: trimmedNonEmptyStringSchema,
  targetName: trimmedNonEmptyStringSchema,
  isExecutable: z.boolean(),
  failureReason: runtimeFailureReasonSchema.nullable().optional(),
});

const workflowRuntimeNodeDetailSchema = z.object({
  projectNodeId: z.string().uuid(),
  workflowId: z.string().uuid(),
  mermaidNodeId: trimmedNonEmptyStringSchema,
  hasBinding: z.boolean(),
  action: workflowRuntimeActionSchema.nullable(),
});

const workflowRuntimePromptTriggerResultSchema = z.object({
  actionType: z.literal('prompt'),
  promptId: z.string().uuid(),
  promptName: trimmedNonEmptyStringSchema,
  copyText: z.string(),
});

const workflowRuntimeToolTriggerResultSchema = z.object({
  actionType: z.literal('tool'),
  toolKey: trimmedNonEmptyStringSchema,
  launched: z.boolean(),
});

const workflowListDataSchema = z.object({
  items: z.array(workflowSummarySchema),
});

const workflowDetailDataSchema = z.object({
  workflow: workflowDetailSchema,
});

const workflowDeleteDataSchema = z.object({
  result: z.object({
    deleted: z.literal(true),
  }),
});

const workflowNodeActionListDataSchema = z.object({
  items: z.array(workflowNodeActionItemSchema),
});

const workflowNodeActionDataSchema = z.object({
  nodeAction: workflowNodeActionItemSchema,
});

const workflowNodeActionDeleteDataSchema = z.object({
  result: z.object({
    deleted: z.literal(true),
  }),
});

const workflowNodeActionSyncDataSchema = z.object({
  result: workflowNodeActionSyncResultSchema,
});

const workflowRuntimeNodeDetailDataSchema = z.object({
  result: workflowRuntimeNodeDetailSchema,
});

const workflowRuntimeTriggerDataSchema = z.object({
  result: z.discriminatedUnion('actionType', [
    workflowRuntimePromptTriggerResultSchema,
    workflowRuntimeToolTriggerResultSchema,
  ]),
});

const apiSuccessEnvelopeSchema = <TSchema extends z.ZodTypeAny>(dataSchema: TSchema) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.string(), z.unknown()).default({}),
  });

export const workflowParamsSchema = z.object({
  id: z.string().uuid(),
});
export type WorkflowParams = z.infer<typeof workflowParamsSchema>;

export const workflowNodeActionParamsSchema = z.object({
  workflowId: z.string().uuid(),
  mermaidNodeId: trimmedNonEmptyStringSchema,
});
export type WorkflowNodeActionParams = z.infer<typeof workflowNodeActionParamsSchema>;

export const workflowListQueryHttpSchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
});
export type WorkflowListQuery = z.infer<typeof workflowListQueryHttpSchema>;

export const createWorkflowBodySchema = z.object({
  name: trimmedNonEmptyStringSchema,
  description: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
  mermaidSource: z.string().optional(),
});
export type CreateWorkflowBody = z.infer<typeof createWorkflowBodySchema>;

export const updateWorkflowBodySchema = z.object({
  name: trimmedNonEmptyStringSchema.optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
  mermaidSource: z.string().optional(),
});
export type UpdateWorkflowBody = z.infer<typeof updateWorkflowBodySchema>;

export const createWorkflowNodeActionBodySchema = z.object({
  mermaidNodeId: trimmedNonEmptyStringSchema,
  actionType: workflowActionTypeSchema,
  targetRef: trimmedNonEmptyStringSchema,
});
export type CreateWorkflowNodeActionBody = z.infer<typeof createWorkflowNodeActionBodySchema>;

export const updateWorkflowNodeActionBodySchema = z.object({
  actionType: workflowActionTypeSchema.optional(),
  targetRef: trimmedNonEmptyStringSchema.optional(),
});
export type UpdateWorkflowNodeActionBody = z.infer<typeof updateWorkflowNodeActionBodySchema>;

export const workflowNodeActionSyncBodySchema = emptyBodySchema;
export type WorkflowNodeActionSyncBody = z.infer<typeof workflowNodeActionSyncBodySchema>;

export const workflowEmptyBodySchema = emptyBodySchema;

export const workflowListResponseSchema = apiSuccessEnvelopeSchema(workflowListDataSchema);
export const workflowDetailResponseSchema = apiSuccessEnvelopeSchema(workflowDetailDataSchema);
export const workflowDeleteResponseSchema = apiSuccessEnvelopeSchema(workflowDeleteDataSchema);
export const workflowNodeActionListResponseSchema = apiSuccessEnvelopeSchema(workflowNodeActionListDataSchema);
export const workflowNodeActionResponseSchema = apiSuccessEnvelopeSchema(workflowNodeActionDataSchema);
export const workflowNodeActionDeleteResponseSchema = apiSuccessEnvelopeSchema(workflowNodeActionDeleteDataSchema);
export const workflowNodeActionSyncResponseSchema = apiSuccessEnvelopeSchema(workflowNodeActionSyncDataSchema);

export const workflowUpdateResponseSchema = z.object({
  success: z.literal(true),
  data: workflowDetailDataSchema,
  meta: z
    .object({
      bindingSync: workflowNodeActionSyncResultSchema.optional(),
    })
    .default({}),
});

export const workflowRuntimeNodeDetailResponseSchema = apiSuccessEnvelopeSchema(workflowRuntimeNodeDetailDataSchema);
export const workflowRuntimeTriggerResponseSchema = apiSuccessEnvelopeSchema(workflowRuntimeTriggerDataSchema);
