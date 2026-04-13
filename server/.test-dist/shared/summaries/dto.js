import { z } from 'zod';
import { integerSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';
export const summaryFolderInfoSchema = z.object({
    projectNodeId: uuidSchema,
    exists: z.boolean(),
    fileCount: integerSchema,
    isEmpty: z.boolean(),
});
export const summaryFileItemSchema = z.object({
    fileName: trimmedNonEmptyStringSchema,
});
//# sourceMappingURL=dto.js.map