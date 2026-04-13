import { z } from 'zod';
import { categorySchema, descriptionSchema, integerSchema, isoDateTimeSchema, sortOrderSchema, tagsSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';
export const deletionStrategyValues = ['archive_then_delete', 'direct_delete'];
export const deletionStrategySchema = z.enum(deletionStrategyValues);
export const projectSummarySchema = z.object({
    id: uuidSchema,
    name: trimmedNonEmptyStringSchema,
    description: descriptionSchema,
    tags: tagsSchema,
    category: categorySchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
});
export const projectDetailSchema = projectSummarySchema;
export const projectDeletionCheckResultSchema = z.object({
    projectId: uuidSchema,
    projectNodeCount: integerSchema,
    summaryNodeCount: integerSchema,
    requiresSecondConfirmation: z.boolean(),
    allowedStrategies: z.array(deletionStrategySchema),
});
export const projectDeletionExecuteResultSchema = z.object({
    projectId: uuidSchema,
    deleted: z.boolean(),
    usedStrategy: deletionStrategySchema,
    archivedSummaryNodeCount: integerSchema,
});
export const solutionSummarySchema = z.object({
    id: uuidSchema,
    name: trimmedNonEmptyStringSchema,
    description: descriptionSchema,
    tags: tagsSchema,
    category: categorySchema,
    projectCount: integerSchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
});
export const solutionDetailSchema = solutionSummarySchema;
export const solutionProjectItemSchema = z.object({
    solutionId: uuidSchema,
    projectId: uuidSchema,
    sortOrder: sortOrderSchema,
    projectName: trimmedNonEmptyStringSchema,
});
export const projectSolutionItemSchema = z.object({
    projectId: uuidSchema,
    solutionId: uuidSchema,
    solutionName: trimmedNonEmptyStringSchema,
    sortOrder: sortOrderSchema,
});
export const projectNodeLayoutItemSchema = z.object({
    projectNodeId: uuidSchema,
    positionX: z.number(),
    positionY: z.number(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
});
export const projectViewportSchema = z.object({
    projectId: uuidSchema,
    viewportX: z.number(),
    viewportY: z.number(),
    zoom: z.number().positive(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
});
//# sourceMappingURL=dto.js.map