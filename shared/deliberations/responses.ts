import { z } from 'zod';

import { createItemsDataSchema, createNamedDataSchema, createResultDataSchema } from '../common/index.js';
import {
  appendLatestDeliberationsResultSchema,
  createDeliberationsFileResultSchema,
  deliberationsRecordFileItemSchema,
  deliberationsRecordFolderInfoSchema,
} from './dto.js';

export const deliberationsRecordFolderDataSchema = createNamedDataSchema(
  'deliberationsRecord',
  deliberationsRecordFolderInfoSchema,
);
export type DeliberationsRecordFolderData = z.infer<typeof deliberationsRecordFolderDataSchema>;

export const deliberationsRecordFilesDataSchema = createItemsDataSchema(deliberationsRecordFileItemSchema);
export type DeliberationsRecordFilesData = z.infer<typeof deliberationsRecordFilesDataSchema>;

export const appendLatestDeliberationsDataSchema = createResultDataSchema(appendLatestDeliberationsResultSchema);
export type AppendLatestDeliberationsData = z.infer<typeof appendLatestDeliberationsDataSchema>;

export const createDeliberationsFileDataSchema = createResultDataSchema(createDeliberationsFileResultSchema);
export type CreateDeliberationsFileData = z.infer<typeof createDeliberationsFileDataSchema>;
