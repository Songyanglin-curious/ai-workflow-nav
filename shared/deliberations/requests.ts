import { z } from 'zod';

import { trimmedNonEmptyStringSchema } from '../common/index.js';

export const appendLatestDeliberationsRequestSchema = z.object({
  content: z.string(),
});
export type AppendLatestDeliberationsRequest = z.infer<typeof appendLatestDeliberationsRequestSchema>;

export const createDeliberationsFileRequestSchema = z.object({
  title: trimmedNonEmptyStringSchema.optional(),
});
export type CreateDeliberationsFileRequest = z.infer<typeof createDeliberationsFileRequestSchema>;
