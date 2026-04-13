import { z } from 'zod';

import { createResultDataSchema } from '../common/index.js';
import { syncExportResultSchema, syncImportResultSchema } from './dto.js';

export const syncExportDataSchema = createResultDataSchema(syncExportResultSchema);
export type SyncExportData = z.infer<typeof syncExportDataSchema>;

export const syncImportDataSchema = createResultDataSchema(syncImportResultSchema);
export type SyncImportData = z.infer<typeof syncImportDataSchema>;
