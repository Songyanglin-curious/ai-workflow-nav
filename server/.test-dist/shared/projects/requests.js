import { z } from 'zod';
import { categorySchema, descriptionSchema, emptyBodySchema, sortOrderSchema, tagsSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';
import { deletionStrategySchema } from './dto.js';
export const projectListQuerySchema = z.object({
    keyword: z.string().optional(),
    category: z.string().optional(),
});
export const createProjectRequestSchema = z.object({
    name: trimmedNonEmptyStringSchema,
    description: descriptionSchema.optional(),
    tags: tagsSchema.optional(),
    category: categorySchema.optional(),
});
export const updateProjectRequestSchema = z.object({
    name: trimmedNonEmptyStringSchema.optional(),
    description: descriptionSchema.optional(),
    tags: tagsSchema.optional(),
    category: categorySchema.optional(),
});
export const projectDeletionCheckRequestSchema = emptyBodySchema;
export const projectDeletionExecuteRequestSchema = z.object({
    confirmDelete: z.boolean(),
    secondConfirmation: z.boolean().optional(),
    strategy: deletionStrategySchema,
});
export const solutionListQuerySchema = z.object({
    keyword: z.string().optional(),
    category: z.string().optional(),
});
export const createSolutionRequestSchema = z.object({
    name: trimmedNonEmptyStringSchema,
    description: descriptionSchema.optional(),
    tags: tagsSchema.optional(),
    category: categorySchema.optional(),
});
export const updateSolutionRequestSchema = z.object({
    name: trimmedNonEmptyStringSchema.optional(),
    description: descriptionSchema.optional(),
    tags: tagsSchema.optional(),
    category: categorySchema.optional(),
});
export const bindSolutionProjectRequestSchema = z.object({
    projectId: uuidSchema,
    sortOrder: sortOrderSchema.optional(),
});
export const patchSolutionProjectRequestSchema = z.object({
    sortOrder: sortOrderSchema,
});
export const patchProjectNodeLayoutsRequestSchema = z.object({
    items: z.array(z.object({
        projectNodeId: uuidSchema,
        positionX: z.number(),
        positionY: z.number(),
    })),
});
export const patchProjectViewportRequestSchema = z.object({
    viewportX: z.number(),
    viewportY: z.number(),
    zoom: z.number().positive(),
});
//# sourceMappingURL=requests.js.map