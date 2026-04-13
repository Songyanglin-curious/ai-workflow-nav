import { z } from 'zod';

const trimmedNonEmptyStringSchema = z.string().trim().min(1);

const promptSummarySchema = z.object({
  id: z.string().uuid(),
  name: trimmedNonEmptyStringSchema,
  description: z.string(),
  tags: z.string(),
  category: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const promptDetailSchema = promptSummarySchema.extend({
  content: z.string(),
});

const promptListDataSchema = z.object({
  items: z.array(promptSummarySchema),
});

const promptDetailDataSchema = z.object({
  prompt: promptDetailSchema,
});

const promptDeleteDataSchema = z.object({
  result: z.object({
    deleted: z.literal(true),
  }),
});

const apiSuccessEnvelopeSchema = <TSchema extends z.ZodTypeAny>(dataSchema: TSchema) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.string(), z.unknown()).default({}),
  });

export const promptParamsSchema = z.object({
  id: z.string().uuid(),
});
export type PromptParams = z.infer<typeof promptParamsSchema>;

export const promptListQueryHttpSchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
});
export type PromptListQuery = z.infer<typeof promptListQueryHttpSchema>;

export const createPromptBodySchema = z.object({
  name: trimmedNonEmptyStringSchema,
  description: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
  content: z.string().optional(),
});
export type CreatePromptBody = z.infer<typeof createPromptBodySchema>;

export const updatePromptBodySchema = z.object({
  name: trimmedNonEmptyStringSchema.optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
  content: z.string().optional(),
});
export type UpdatePromptBody = z.infer<typeof updatePromptBodySchema>;

export const promptListResponseSchema = apiSuccessEnvelopeSchema(promptListDataSchema);
export const promptDetailResponseSchema = apiSuccessEnvelopeSchema(promptDetailDataSchema);
export const promptDeleteResponseSchema = apiSuccessEnvelopeSchema(promptDeleteDataSchema);
