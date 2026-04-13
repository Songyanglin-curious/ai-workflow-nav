import { z } from 'zod';

import { emptyBodySchema } from '../common/index.js';
import { importModeSchema } from './dto.js';

export const syncExportRequestSchema = emptyBodySchema;
export type SyncExportRequest = z.infer<typeof syncExportRequestSchema>;

export const syncImportRequestSchema = z.object({
  mode: importModeSchema,
});
export type SyncImportRequest = z.infer<typeof syncImportRequestSchema>;
