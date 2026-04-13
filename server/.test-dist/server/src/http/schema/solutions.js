import { z } from 'zod';
export const solutionParamsSchema = z.object({
    solutionId: z.string().uuid(),
});
export const solutionProjectParamsSchema = z.object({
    solutionId: z.string().uuid(),
    projectId: z.string().uuid(),
});
export const projectSolutionsParamsSchema = z.object({
    projectId: z.string().uuid(),
});
export const solutionListQuerySchema = z.object({
    keyword: z.string().optional(),
    category: z.string().optional(),
});
export const createSolutionBodySchema = z.object({
    name: z.string().trim().min(1),
    description: z.string().optional(),
    tags: z.string().optional(),
    category: z.string().optional(),
});
export const updateSolutionBodySchema = z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    tags: z.string().optional(),
    category: z.string().optional(),
});
export const createSolutionProjectBodySchema = z.object({
    projectId: z.string().uuid(),
    sortOrder: z.number().int().optional(),
});
export const patchSolutionProjectBodySchema = z.object({
    sortOrder: z.number().int(),
});
//# sourceMappingURL=solutions.js.map