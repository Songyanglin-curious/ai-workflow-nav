import { z } from 'zod';

import { integerSchema, isoDateTimeSchema } from '../common/index.js';

export const importModeValues = ['rebuild'] as const;
export const importModeSchema = z.enum(importModeValues);
export type ImportMode = z.infer<typeof importModeSchema>;

export const syncManifestSchema = z.object({
  version: integerSchema,
  exportedAt: isoDateTimeSchema,
  files: z.array(z.string()),
});
export type SyncManifest = z.infer<typeof syncManifestSchema>;

export const syncExportResultSchema = z.object({
  exported: z.boolean(),
  manifestFile: z.string(),
  exportedFileCount: integerSchema,
});
export type SyncExportResult = z.infer<typeof syncExportResultSchema>;

export const syncImportResultSchema = z.object({
  imported: z.boolean(),
  mode: importModeSchema,
});
export type SyncImportResult = z.infer<typeof syncImportResultSchema>;
