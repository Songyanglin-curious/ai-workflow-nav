import { z } from 'zod';
import { descriptionSchema, integerSchema, isoDateTimeSchema, sortOrderSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';
import { deletionStrategySchema } from '../projects/dto.js';
export const projectNodeStatusValues = ['default', 'todo', 'fix'];
export const projectNodeStatusSchema = z.enum(projectNodeStatusValues);
export const projectNodeSummarySchema = z.object({
    id: uuidSchema,
    projectId: uuidSchema,
    name: trimmedNonEmptyStringSchema,
    description: descriptionSchema,
    status: projectNodeStatusSchema,
    parentNodeId: uuidSchema.nullable(),
    sortOrder: sortOrderSchema,
    workflowId: uuidSchema.nullable(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
});
export const projectNodeDetailSchema = projectNodeSummarySchema;
export const projectNodeDeletionCheckResultSchema = z.object({
    projectNodeId: uuidSchema,
    requiresSecondConfirmation: z.boolean(),
    directChildCount: integerSchema,
    summaryFileCount: integerSchema,
    allowedStrategies: z.array(deletionStrategySchema),
});
export const projectNodeDeletionExecuteResultSchema = z.object({
    projectNodeId: uuidSchema,
    deleted: z.boolean(),
    usedStrategy: deletionStrategySchema,
    archived: z.boolean(),
    promotedToRootCount: integerSchema,
});
//# sourceMappingURL=dto.js.map