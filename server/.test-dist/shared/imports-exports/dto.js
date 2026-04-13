import { z } from 'zod';
import { integerSchema, isoDateTimeSchema } from '../common/index.js';
export const importModeValues = ['rebuild'];
export const importModeSchema = z.enum(importModeValues);
export const syncManifestSchema = z.object({
    version: integerSchema,
    exportedAt: isoDateTimeSchema,
    files: z.array(z.string()),
});
export const syncExportResultSchema = z.object({
    exported: z.boolean(),
    manifestFile: z.string(),
    exportedFileCount: integerSchema,
});
export const syncImportResultSchema = z.object({
    imported: z.boolean(),
    mode: importModeSchema,
});
//# sourceMappingURL=dto.js.map