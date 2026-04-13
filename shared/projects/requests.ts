import { z } from 'zod';

import { categorySchema, descriptionSchema, emptyBodySchema, sortOrderSchema, tagsSchema, trimmedNonEmptyStringSchema, uuidSchema } from '../common/index.js';
import { deletionStrategySchema } from './dto.js';

export const projectListQuerySchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
});
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;

export const createProjectRequestSchema = z.object({
  name: trimmedNonEmptyStringSchema,
  description: descriptionSchema.optional(),
  tags: tagsSchema.optional(),
  category: categorySchema.optional(),
});
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;

export const updateProjectRequestSchema = z.object({
  name: trimmedNonEmptyStringSchema.optional(),
  description: descriptionSchema.optional(),
  tags: tagsSchema.optional(),
  category: categorySchema.optional(),
});
export type UpdateProjectRequest = z.infer<typeof updateProjectRequestSchema>;

export const projectDeletionCheckRequestSchema = emptyBodySchema;
export type ProjectDeletionCheckRequest = z.infer<typeof projectDeletionCheckRequestSchema>;

export const projectDeletionExecuteRequestSchema = z.object({
  confirmDelete: z.boolean(),
  secondConfirmation: z.boolean().optional(),
  strategy: deletionStrategySchema,
});
export type ProjectDeletionExecuteRequest = z.infer<typeof projectDeletionExecuteRequestSchema>;

export const solutionListQuerySchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
});
export type SolutionListQuery = z.infer<typeof solutionListQuerySchema>;

export const createSolutionRequestSchema = z.object({
  name: trimmedNonEmptyStringSchema,
  description: descriptionSchema.optional(),
  tags: tagsSchema.optional(),
  category: categorySchema.optional(),
});
export type CreateSolutionRequest = z.infer<typeof createSolutionRequestSchema>;

export const updateSolutionRequestSchema = z.object({
  name: trimmedNonEmptyStringSchema.optional(),
  description: descriptionSchema.optional(),
  tags: tagsSchema.optional(),
  category: categorySchema.optional(),
});
export type UpdateSolutionRequest = z.infer<typeof updateSolutionRequestSchema>;

export const bindSolutionProjectRequestSchema = z.object({
  projectId: uuidSchema,
  sortOrder: sortOrderSchema.optional(),
});
export type BindSolutionProjectRequest = z.infer<typeof bindSolutionProjectRequestSchema>;

export const patchSolutionProjectRequestSchema = z.object({
  sortOrder: sortOrderSchema,
});
export type PatchSolutionProjectRequest = z.infer<typeof patchSolutionProjectRequestSchema>;

export const patchProjectNodeLayoutsRequestSchema = z.object({
  items: z.array(
    z.object({
      projectNodeId: uuidSchema,
      positionX: z.number(),
      positionY: z.number(),
    }),
  ),
});
export type PatchProjectNodeLayoutsRequest = z.infer<typeof patchProjectNodeLayoutsRequestSchema>;

export const patchProjectViewportRequestSchema = z.object({
  viewportX: z.number(),
  viewportY: z.number(),
  zoom: z.number().positive(),
});
export type PatchProjectViewportRequest = z.infer<typeof patchProjectViewportRequestSchema>;
