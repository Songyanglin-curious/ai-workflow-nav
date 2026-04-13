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
const apiSuccessEnvelopeSchema = (dataSchema) => z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.string(), z.unknown()).default({}),
});
export const promptParamsSchema = z.object({
    id: z.string().uuid(),
});
export const promptListQueryHttpSchema = z.object({
    keyword: z.string().optional(),
    category: z.string().optional(),
});
export const createPromptBodySchema = z.object({
    name: trimmedNonEmptyStringSchema,
    description: z.string().optional(),
    tags: z.string().optional(),
    category: z.string().optional(),
    content: z.string().optional(),
});
export const updatePromptBodySchema = z.object({
    name: trimmedNonEmptyStringSchema.optional(),
    description: z.string().optional(),
    tags: z.string().optional(),
    category: z.string().optional(),
    content: z.string().optional(),
});
export const promptListResponseSchema = apiSuccessEnvelopeSchema(promptListDataSchema);
export const promptDetailResponseSchema = apiSuccessEnvelopeSchema(promptDetailDataSchema);
export const promptDeleteResponseSchema = apiSuccessEnvelopeSchema(promptDeleteDataSchema);
//# sourceMappingURL=prompts.js.map