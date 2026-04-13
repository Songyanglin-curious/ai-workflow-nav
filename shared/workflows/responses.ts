import { z } from 'zod';

import { createItemsDataSchema, createNamedDataSchema, createResultDataSchema, deletedResultSchema } from '../common/index.js';
import {
  workflowDetailSchema,
  workflowNodeActionItemSchema,
  workflowNodeActionSyncResultSchema,
  workflowRuntimeNodeDetailSchema,
  workflowRuntimeTriggerResultSchema,
  workflowSummarySchema,
} from './dto.js';

export const workflowListDataSchema = createItemsDataSchema(workflowSummarySchema);
export type WorkflowListData = z.infer<typeof workflowListDataSchema>;

export const workflowDetailDataSchema = createNamedDataSchema('workflow', workflowDetailSchema);
export type WorkflowDetailData = z.infer<typeof workflowDetailDataSchema>;

export const workflowDeleteDataSchema = createResultDataSchema(deletedResultSchema);
export type WorkflowDeleteData = z.infer<typeof workflowDeleteDataSchema>;

export const workflowNodeActionListDataSchema = createItemsDataSchema(workflowNodeActionItemSchema);
export type WorkflowNodeActionListData = z.infer<typeof workflowNodeActionListDataSchema>;

export const workflowNodeActionDataSchema = createNamedDataSchema('nodeAction', workflowNodeActionItemSchema);
export type WorkflowNodeActionData = z.infer<typeof workflowNodeActionDataSchema>;

export const workflowNodeActionDeleteDataSchema = createResultDataSchema(deletedResultSchema);
export type WorkflowNodeActionDeleteData = z.infer<typeof workflowNodeActionDeleteDataSchema>;

export const workflowNodeActionSyncDataSchema = createResultDataSchema(workflowNodeActionSyncResultSchema);
export type WorkflowNodeActionSyncData = z.infer<typeof workflowNodeActionSyncDataSchema>;

export const workflowRuntimeNodeDetailDataSchema = createResultDataSchema(workflowRuntimeNodeDetailSchema);
export type WorkflowRuntimeNodeDetailData = z.infer<typeof workflowRuntimeNodeDetailDataSchema>;

export const workflowRuntimeTriggerDataSchema = createResultDataSchema(workflowRuntimeTriggerResultSchema);
export type WorkflowRuntimeTriggerData = z.infer<typeof workflowRuntimeTriggerDataSchema>;
