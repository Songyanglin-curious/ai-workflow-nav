import { z } from 'zod';

import { apiErrorSchema } from './errors.js';

export const apiMetaSchema = z.record(z.string(), z.unknown());
export type ApiMeta = z.infer<typeof apiMetaSchema>;

export const emptyMeta = {} as Record<string, never>;

export const emptyBodySchema = z.object({}).strict();
export type EmptyBody = z.infer<typeof emptyBodySchema>;

export const deletedResultSchema = z.object({
  deleted: z.literal(true),
});
export type DeletedResult = z.infer<typeof deletedResultSchema>;

export const createItemsDataSchema = <TSchema extends z.ZodTypeAny>(itemSchema: TSchema) =>
  z.object({
    items: z.array(itemSchema),
  });

export const createNamedDataSchema = <TKey extends string, TSchema extends z.ZodTypeAny>(
  key: TKey,
  schema: TSchema,
) =>
  z.object({
    [key]: schema,
  } as Record<TKey, TSchema>);

export const createResultDataSchema = <TSchema extends z.ZodTypeAny>(resultSchema: TSchema) =>
  z.object({
    result: resultSchema,
  });

export interface ApiSuccessResponse<TData, TMeta = Record<string, never>> {
  success: true;
  data: TData;
  meta: TMeta;
}

export interface ApiFailureResponse<TDetails = Record<string, unknown>, TMeta = Record<string, never>> {
  success: false;
  error: {
    code: string;
    message: string;
    details?: TDetails;
  };
  meta: TMeta;
}

export type ApiResponse<TData, TDetails = Record<string, unknown>, TMeta = Record<string, never>> =
  | ApiSuccessResponse<TData, TMeta>
  | ApiFailureResponse<TDetails, TMeta>;

export const apiSuccessEnvelopeSchema = <TSchema extends z.ZodTypeAny>(dataSchema: TSchema) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: apiMetaSchema.default({}),
  });

export const apiFailureEnvelopeSchema = z.object({
  success: z.literal(false),
  error: apiErrorSchema,
  meta: apiMetaSchema.default({}),
});
