import { z } from 'zod';

import { categorySchema, descriptionSchema, isoDateTimeSchema, tagsSchema, textSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';

export const promptSummarySchema = z.object({
  id: uuidSchema,
  name: trimmedNonEmptyStringSchema,
  description: descriptionSchema,
  tags: tagsSchema,
  category: categorySchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type PromptSummary = z.infer<typeof promptSummarySchema>;

export const promptDetailSchema = promptSummarySchema.extend({
  content: textSchema,
});
export type PromptDetail = z.infer<typeof promptDetailSchema>;
