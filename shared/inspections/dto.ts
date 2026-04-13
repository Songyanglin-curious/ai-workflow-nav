import { z } from 'zod';

import { integerSchema } from '../common/index.js';

export const inspectionIssueTypeValues = [
  'INDEXED_FILE_MISSING',
  'UNINDEXED_FILE_FOUND',
  'WORKFLOW_NODE_ACTION_STALE',
  'BINDING_TARGET_NOT_FOUND',
  'TOOL_TARGET_NOT_FOUND',
  'WORKFLOW_NODE_ACTION_MISSING',
  'PROJECT_NODE_WORKFLOW_MISSING',
] as const;
export const inspectionIssueTypeSchema = z.enum(inspectionIssueTypeValues);
export type InspectionIssueType = z.infer<typeof inspectionIssueTypeSchema>;

export const inspectionSeverityValues = ['error', 'warning'] as const;
export const inspectionSeveritySchema = z.enum(inspectionSeverityValues);
export type InspectionSeverity = z.infer<typeof inspectionSeveritySchema>;

export const inspectionIssueSchema = z.object({
  issueType: inspectionIssueTypeSchema,
  severity: inspectionSeveritySchema,
  entityType: z.string(),
  entityId: z.string().nullable(),
  message: z.string(),
  suggestion: z.string(),
});
export type InspectionIssue = z.infer<typeof inspectionIssueSchema>;

export const inspectionRunResultSchema = z.object({
  summary: z.object({
    total: integerSchema,
    errorCount: integerSchema,
    warningCount: integerSchema,
  }),
  items: z.array(inspectionIssueSchema),
});
export type InspectionRunResult = z.infer<typeof inspectionRunResultSchema>;
