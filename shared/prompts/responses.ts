import { z } from 'zod';

import { createItemsDataSchema, createNamedDataSchema, createResultDataSchema, deletedResultSchema } from '../common/index.js';
import { promptDetailSchema, promptSummarySchema } from './dto.js';

export const promptListDataSchema = createItemsDataSchema(promptSummarySchema);
export type PromptListData = z.infer<typeof promptListDataSchema>;

export const promptDetailDataSchema = createNamedDataSchema('prompt', promptDetailSchema);
export type PromptDetailData = z.infer<typeof promptDetailDataSchema>;

export const promptDeleteResultSchema = deletedResultSchema;
export type PromptDeleteResult = z.infer<typeof promptDeleteResultSchema>;

export const promptDeleteDataSchema = createResultDataSchema(promptDeleteResultSchema);
export type PromptDeleteData = z.infer<typeof promptDeleteDataSchema>;
