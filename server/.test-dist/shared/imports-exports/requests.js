import { z } from 'zod';
import { emptyBodySchema } from '../common/index.js';
import { importModeSchema } from './dto.js';
export const syncExportRequestSchema = emptyBodySchema;
export const syncImportRequestSchema = z.object({
    mode: importModeSchema,
});
//# sourceMappingURL=requests.js.map