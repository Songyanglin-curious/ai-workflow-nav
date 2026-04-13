import { z } from 'zod';
const toolActionSchema = z.object({
    args: z.array(z.string()),
    requiresExists: z.boolean(),
});
const toolDefinitionSchema = z.object({
    toolKey: z.string().trim().min(1),
    label: z.string().trim().min(1),
    enabled: z.boolean(),
    platform: z.string().trim().min(1),
    exePath: z.string().trim().min(1),
    actions: z.object({
        openFile: toolActionSchema.optional(),
        openFolder: toolActionSchema.optional(),
        openPath: toolActionSchema.optional(),
        openAtLine: toolActionSchema.optional(),
    }),
});
const toolRouteSchema = z.object({
    toolKey: z.string().trim().min(1),
    actionType: z.enum(['openFile', 'openFolder', 'openPath', 'openAtLine']),
    match: z.object({
        extension: z.string().trim().min(1),
    }),
});
export const localConfigSchema = z
    .object({
    version: z.number().int(),
    workspaceRoot: z.string().trim().min(1),
    server: z.object({
        port: z.number().int().positive(),
    }),
    defaults: z
        .object({
        toolKey: z.string().trim().min(1).optional(),
    })
        .passthrough()
        .optional(),
    tools: z.array(toolDefinitionSchema).default([]),
    routes: z.array(toolRouteSchema).default([]),
    security: z
        .object({
        allowAbsolutePaths: z.boolean().default(false),
        allowedRoots: z.array(z.string()).default([]),
    })
        .optional(),
})
    .passthrough();
//# sourceMappingURL=schema.js.map