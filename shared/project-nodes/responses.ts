import { z } from 'zod';

import { createItemsDataSchema, createNamedDataSchema, createResultDataSchema } from '../common/index.js';
import {
  projectNodeDeletionCheckResultSchema,
  projectNodeDeletionExecuteResultSchema,
  projectNodeDetailSchema,
  projectNodeSummarySchema,
} from './dto.js';

export const projectNodesListDataSchema = createItemsDataSchema(projectNodeSummarySchema);
export type ProjectNodesListData = z.infer<typeof projectNodesListDataSchema>;

export const projectNodeDetailDataSchema = createNamedDataSchema('projectNode', projectNodeDetailSchema);
export type ProjectNodeDetailData = z.infer<typeof projectNodeDetailDataSchema>;

export const projectNodeDeletionCheckDataSchema = createResultDataSchema(projectNodeDeletionCheckResultSchema);
export type ProjectNodeDeletionCheckData = z.infer<typeof projectNodeDeletionCheckDataSchema>;

export const projectNodeDeletionExecuteDataSchema = createResultDataSchema(projectNodeDeletionExecuteResultSchema);
export type ProjectNodeDeletionExecuteData = z.infer<typeof projectNodeDeletionExecuteDataSchema>;
