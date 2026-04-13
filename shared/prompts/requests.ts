import { z } from 'zod';

import { categorySchema, descriptionSchema, tagsSchema, textSchema, trimmedNonEmptyStringSchema } from '../common/index.js';

export const promptListQuerySchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
});
export type PromptListQuery = z.infer<typeof promptListQuerySchema>;

export const createPromptRequestSchema = z.object({
  name: trimmedNonEmptyStringSchema,
  description: descriptionSchema.optional(),
  tags: tagsSchema.optional(),
  category: categorySchema.optional(),
  content: textSchema.optional(),
});
export type CreatePromptRequest = z.infer<typeof createPromptRequestSchema>;

export const updatePromptRequestSchema = z.object({
  name: trimmedNonEmptyStringSchema.optional(),
  description: descriptionSchema.optional(),
  tags: tagsSchema.optional(),
  category: categorySchema.optional(),
  content: textSchema.optional(),
});
export type UpdatePromptRequest = z.infer<typeof updatePromptRequestSchema>;
