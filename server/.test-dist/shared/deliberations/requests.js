import { z } from 'zod';
import { trimmedNonEmptyStringSchema } from '../common/index.js';
export const appendLatestDeliberationsRequestSchema = z.object({
    content: z.string(),
});
export const createDeliberationsFileRequestSchema = z.object({
    title: trimmedNonEmptyStringSchema.optional(),
});
//# sourceMappingURL=requests.js.map