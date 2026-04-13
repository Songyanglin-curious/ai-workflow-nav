import { z } from 'zod';

import { createItemsDataSchema, createNamedDataSchema } from '../common/index.js';
import { summaryFileItemSchema, summaryFolderInfoSchema } from './dto.js';

export const summaryFolderDataSchema = createNamedDataSchema('summary', summaryFolderInfoSchema);
export type SummaryFolderData = z.infer<typeof summaryFolderDataSchema>;

export const summaryFilesDataSchema = createItemsDataSchema(summaryFileItemSchema);
export type SummaryFilesData = z.infer<typeof summaryFilesDataSchema>;
