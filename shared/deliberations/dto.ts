import { z } from 'zod';

import { integerSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';

export const deliberationsRecordFolderInfoSchema = z.object({
  projectNodeId: uuidSchema,
  exists: z.boolean(),
  fileCount: integerSchema,
  latestWritableFileName: z.string().nullable(),
});
export type DeliberationsRecordFolderInfo = z.infer<typeof deliberationsRecordFolderInfoSchema>;

export const deliberationsRecordFileItemSchema = z.object({
  fileName: trimmedNonEmptyStringSchema,
  isNameCompliant: z.boolean(),
  isLatestWritable: z.boolean(),
});
export type DeliberationsRecordFileItem = z.infer<typeof deliberationsRecordFileItemSchema>;

export const appendLatestDeliberationsResultSchema = z.object({
  fileName: trimmedNonEmptyStringSchema,
  createdNewFile: z.boolean(),
});
export type AppendLatestDeliberationsResult = z.infer<typeof appendLatestDeliberationsResultSchema>;

export const createDeliberationsFileResultSchema = z.object({
  fileName: trimmedNonEmptyStringSchema,
});
export type CreateDeliberationsFileResult = z.infer<typeof createDeliberationsFileResultSchema>;
