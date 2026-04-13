import { z } from 'zod';
import { apiErrorSchema } from './errors.js';
export const apiMetaSchema = z.record(z.string(), z.unknown());
export const emptyMeta = {};
export const emptyBodySchema = z.object({}).strict();
export const deletedResultSchema = z.object({
    deleted: z.literal(true),
});
export const createItemsDataSchema = (itemSchema) => z.object({
    items: z.array(itemSchema),
});
export const createNamedDataSchema = (key, schema) => z.object({
    [key]: schema,
});
export const createResultDataSchema = (resultSchema) => z.object({
    result: resultSchema,
});
export const apiSuccessEnvelopeSchema = (dataSchema) => z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: apiMetaSchema.default({}),
});
export const apiFailureEnvelopeSchema = z.object({
    success: z.literal(false),
    error: apiErrorSchema,
    meta: apiMetaSchema.default({}),
});
//# sourceMappingURL=response.js.map