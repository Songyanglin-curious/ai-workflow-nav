import { z } from 'zod';
export const emptyBodySchema = z.object({}).strict();
export const syncImportBodySchema = z.object({
    mode: z.literal('rebuild'),
});
//# sourceMappingURL=system.js.map