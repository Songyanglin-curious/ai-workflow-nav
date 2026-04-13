import { createResultDataSchema } from '../common/index.js';
import { syncExportResultSchema, syncImportResultSchema } from './dto.js';
export const syncExportDataSchema = createResultDataSchema(syncExportResultSchema);
export const syncImportDataSchema = createResultDataSchema(syncImportResultSchema);
//# sourceMappingURL=responses.js.map