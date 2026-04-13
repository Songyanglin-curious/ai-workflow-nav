import { z } from 'zod';

const deletionStrategySchema = z.enum(['archive_then_delete', 'direct_delete']);
const projectNodeStatusSchema = z.enum(['default', 'todo', 'fix']);

export const projectParamsSchema = z.object({
  projectId: z.string().uuid(),
});

export const projectListQuerySchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
});

export const createProjectBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
});

export const updateProjectBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
});

export const projectDeletionExecuteBodySchema = z.object({
  confirmDelete: z.boolean(),
  secondConfirmation: z.boolean().optional(),
  strategy: deletionStrategySchema,
});

export const projectNodesListQuerySchema = z.object({
  parentNodeId: z.string().uuid().nullable().optional(),
  status: projectNodeStatusSchema.optional(),
});

export const createProjectNodeBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  status: projectNodeStatusSchema.optional(),
  parentNodeId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().optional(),
  workflowId: z.string().uuid().nullable().optional(),
});

export const projectNodeParamsSchema = z.object({
  projectNodeId: z.string().uuid(),
});

export const updateProjectNodeBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  status: projectNodeStatusSchema.optional(),
  parentNodeId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().optional(),
  workflowId: z.string().uuid().nullable().optional(),
});

export const projectNodeDeletionExecuteBodySchema = z.object({
  confirmDelete: z.boolean(),
  secondConfirmation: z.boolean().optional(),
  strategy: deletionStrategySchema,
});

export const patchProjectNodeLayoutsBodySchema = z.object({
  items: z.array(
    z.object({
      projectNodeId: z.string().uuid(),
      positionX: z.number(),
      positionY: z.number(),
    }),
  ),
});

export const patchProjectViewportBodySchema = z.object({
  viewportX: z.number(),
  viewportY: z.number(),
  zoom: z.number().positive(),
});

export const appendLatestDeliberationsBodySchema = z.object({
  content: z.string(),
});

export const createDeliberationsFileBodySchema = z.object({
  title: z.string().optional(),
});

export const workflowRuntimeParamsSchema = z.object({
  projectNodeId: z.string().uuid(),
  mermaidNodeId: z.string().trim().min(1),
});
