import { z } from 'zod';
import { integerSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';
export const deliberationsRecordFolderInfoSchema = z.object({
    projectNodeId: uuidSchema,
    exists: z.boolean(),
    fileCount: integerSchema,
    latestWritableFileName: z.string().nullable(),
});
export const deliberationsRecordFileItemSchema = z.object({
    fileName: trimmedNonEmptyStringSchema,
    isNameCompliant: z.boolean(),
    isLatestWritable: z.boolean(),
});
export const appendLatestDeliberationsResultSchema = z.object({
    fileName: trimmedNonEmptyStringSchema,
    createdNewFile: z.boolean(),
});
export const createDeliberationsFileResultSchema = z.object({
    fileName: trimmedNonEmptyStringSchema,
});
//# sourceMappingURL=dto.js.map