import { z } from 'zod';

import { emptyBodySchema } from '../common/index.js';

export const summaryFolderRequestSchema = emptyBodySchema;
export type SummaryFolderRequest = z.infer<typeof summaryFolderRequestSchema>;

export const summaryFilesRequestSchema = emptyBodySchema;
export type SummaryFilesRequest = z.infer<typeof summaryFilesRequestSchema>;
